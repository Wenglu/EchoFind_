import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Box,
  Grid,
  Button,
  Alert,
  Snackbar,
  Typography,
  Grow,
  Slide,
} from "@mui/material";
import { Logout, VolumeUp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { SearchForm } from "./components/SearchForm";
import { TrackCard } from "./components/TrackCard";
import { PlaybackBar } from "./components/PlaybackBar";

interface Track {
  id: string;
  name: string;
  artists: string;
  album: string;
  cover: string;
  preview_url: string | null;
  spotify_url: string;
  uri: string;
}

const BACKEND_URL = "http://127.0.0.1:5001";

// Theme colors
const theme = {
  primary: "#1DB954",
  primaryDark: "#1ed760",
  background: {
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
  },
  text: {
    primary: "#ffffff",
    secondary: "rgba(255, 255, 255, 0.7)",
    tertiary: "rgba(255, 255, 255, 0.5)",
  },
  border: "rgba(29, 185, 84, 0.2)",
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // ============================================================================
  // TOKEN AUTHENTICATION
  // ============================================================================
  useEffect(() => {
    console.log("🔍 [AUTH] Checking for access token...");
    const tokenFromStorage = localStorage.getItem("spotify_access_token");

    if (tokenFromStorage) {
      console.log("✅ [AUTH] Token found");
      setAccessToken(tokenFromStorage);

      fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${tokenFromStorage}` },
      })
        .then((res) => {
          if (res.status === 401) {
            showSnackbar("Session expired. Please login again.");
            handleLogout();
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data) showSnackbar(`Welcome, ${data.display_name}!`);
        })
        .catch(() => {
          // Network error – stay on dashboard, token may still be valid
        });
    } else {
      console.warn("⚠️ [AUTH] No token found");
      navigate("/");
    }
  }, [navigate]);

  // ============================================================================
  // SPOTIFY WEB PLAYBACK SDK
  // ============================================================================
  useEffect(() => {
    if (!accessToken) return;

    console.log("🎵 [PLAYER] Initializing...");

    if (window.Spotify) {
      initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer();
      };

      if (
        !document.querySelector(
          'script[src="https://sdk.scdn.co/spotify-player.js"]'
        )
      ) {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    function initializePlayer() {
      const spotifyPlayer = new window.Spotify.Player({
        name: "EchoFind Web Player",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(accessToken!);
        },
        volume: 0.5,
      });

      spotifyPlayer.addListener(
        "ready",
        ({ device_id }: { device_id: string }) => {
          console.log("✅ [PLAYER] Ready! Device:", device_id);
          setDeviceId(device_id);
          setPlayerReady(true);
          showSnackbar("🎵 Player connected!");
        }
      );

      spotifyPlayer.addListener("not_ready", () => {
        setPlayerReady(false);
        showSnackbar("Player disconnected");
      });

      spotifyPlayer.addListener("player_state_changed", (state: any) => {
        if (!state) return;

        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);

        if (state.track_window?.current_track) {
          const track = state.track_window.current_track;
          setCurrentTrack({
            id: track.id || "",
            name: track.name || "",
            artists: track.artists?.map((a: any) => a.name).join(", ") || "",
            album: track.album?.name || "",
            cover: track.album?.images?.[0]?.url || "",
            preview_url: null,
            spotify_url: track.uri || "",
            uri: track.uri || "",
          });
        }
      });

      spotifyPlayer.addListener("initialization_error", ({ message }: any) => {
        console.error("❌ [PLAYER] Init error:", message);
      });

      spotifyPlayer.addListener("authentication_error", ({ message }: any) => {
        console.error("❌ [PLAYER] Auth error:", message);
        showSnackbar("Spotify auth error – try logging in again.");
      });

      spotifyPlayer.addListener("account_error", ({ message }: any) => {
        console.error("❌ [PLAYER] Account error:", message);
        showSnackbar("You need Spotify Premium");
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
      playerRef.current = spotifyPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [accessToken]);

  // ============================================================================
  // FETCH RECOMMENDATIONS
  // ============================================================================
  const handleSearch = async (artist: string, title: string) => {
    console.log("🔍 [SEARCH] Searching:", { artist, title });
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${BACKEND_URL}/recommend`, {
        artist,
        title,
      });

      const tracksWithUri = res.data.recommendations.map((t: Track) => ({
        ...t,
        uri: `spotify:track:${t.id}`,
      }));

      setRecommendations(tracksWithUri);
      showSnackbar(`✨ Found ${tracksWithUri.length} recommendations!`);
    } catch (err) {
      console.error("❌ [SEARCH] Error:", err);
      setError("Failed to fetch recommendations. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // PLAYBACK CONTROLS
  // ============================================================================
  const playTrack = async (uri: string) => {
    console.log("▶️ [PLAYBACK] Playing:", uri);

    if (!deviceId || !accessToken) {
      showSnackbar("⏳ Player not ready...");
      return;
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          body: JSON.stringify({ uris: [uri] }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 204 || response.status === 200) {
        console.log("✅ [PLAYBACK] Started");
        const track = recommendations.find((t) => t.uri === uri);
        if (track) {
          setCurrentTrack(track);
        }
      } else if (response.status === 404) {
        showSnackbar("Device not found");
      } else if (response.status === 403) {
        showSnackbar("Premium required");
      }
    } catch (err) {
      console.error("❌ [PLAYBACK] Error:", err);
      showSnackbar("Failed to play");
    }
  };

  const togglePlayback = async () => {
    if (!player) return;
    try {
      await player.togglePlay();
    } catch (err) {
      console.error("❌ Toggle error:", err);
    }
  };

  const seekToPosition = async (positionMs: number) => {
    if (!accessToken || !deviceId) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}&device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 204 || response.status === 200) {
        setPosition(positionMs);
      }
    } catch (err) {
      console.error("❌ [SEEK] Error:", err);
    }
  };

  const skipTrack = async (direction: "next" | "previous") => {
    if (!player) return;
    try {
      if (direction === "next") {
        await player.nextTrack();
      } else {
        await player.previousTrack();
      }
    } catch (err) {
      console.error("❌ [SKIP] Error:", err);
    }
  };

  const handleLogout = () => {
    console.log("👋 [LOGOUT]");
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_token_expiration");
    if (player) player.disconnect();
    navigate("/");
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.background.gradient,
        pb: currentTrack ? { xs: "110px", sm: "100px" } : "40px",
        pt: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: { xs: 3, sm: 4 },
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1DB954, #1ed760)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 14px rgba(29,185,84,0.4)",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🎵
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.5px",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Echo
              <Box component="span" sx={{ color: theme.primary }}>
                Find
              </Box>
            </Typography>
          </Box>

          {/* Right side: status + logout */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: playerReady ? theme.primary : "#ff4444",
                  boxShadow: playerReady
                    ? `0 0 8px ${theme.primary}`
                    : "0 0 8px #ff4444",
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: theme.text.tertiary,
                  fontWeight: 500,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                {playerReady ? "Connected" : "Connecting..."}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Logout sx={{ fontSize: 16 }} />}
              onClick={handleLogout}
              size="small"
              sx={{
                color: theme.text.tertiary,
                borderColor: "rgba(255,255,255,0.1)",
                textTransform: "none",
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                borderRadius: 2,
                px: 1.5,
                "&:hover": {
                  borderColor: theme.primary,
                  color: theme.primary,
                  backgroundColor: "rgba(29, 185, 84, 0.08)",
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {/* Connection Alert */}
        {!playerReady && accessToken && (
          <Alert
            severity="info"
            icon={<VolumeUp />}
            sx={{
              mb: 3,
              backgroundColor: "rgba(29, 185, 84, 0.1)",
              color: theme.text.primary,
              borderLeft: `4px solid ${theme.primary}`,
            }}
          >
            🔌 Connecting to Spotify... Please wait.
          </Alert>
        )}

        {/* Search Form */}
        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: "rgba(244, 67, 54, 0.1)",
              color: theme.text.primary,
              borderLeft: "4px solid #f44336",
            }}
          >
            {error}
          </Alert>
        )}

        {/* Recommendations Grid */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
          {recommendations.map((track, index) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={track.id}>
              <Grow in timeout={300 + index * 50}>
                <div>
                  <TrackCard
                    track={track}
                    onPlay={playTrack}
                    isCurrentTrack={currentTrack?.id === track.id}
                    isPlayerReady={playerReady}
                  />
                </div>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {recommendations.length === 0 && !loading && (
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 6, sm: 8 },
              color: theme.text.tertiary,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              🎵 Discover Similar Music
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
            >
              Enter an artist and song title to get personalized recommendations
            </Typography>
          </Box>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{
              width: "100%",
              backgroundColor: "rgba(30, 30, 46, 0.95)",
              color: theme.text.primary,
              borderLeft: `4px solid ${theme.primary}`,
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>

      {/* Bottom Playback Bar */}
      <Slide direction="up" in={!!currentTrack} mountOnEnter unmountOnExit>
        <Box>
          <PlaybackBar
            track={currentTrack}
            isPlaying={isPlaying}
            position={position}
            duration={duration}
            onTogglePlay={togglePlayback}
            onSeek={seekToPosition}
            onSkip={skipTrack}
          />
        </Box>
      </Slide>
    </Box>
  );
}
