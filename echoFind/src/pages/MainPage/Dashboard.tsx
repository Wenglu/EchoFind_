import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Box,
  Paper,
  Stack,
  LinearProgress,
  Fade,
  Zoom,
  Grow,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Search as SearchIcon,
  MusicNote,
  VolumeUp,
  Logout,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Deklaracja typów dla Spotify SDK
declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface Track {
  id: string;
  name: string;
  artists: string;
  album: string;
  cover: string;
  preview_url: string | null;
  spotify_url: string;
  uri?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Spotify Player state
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // 1. Pobierz token z URL lub localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("access_token");
    const tokenFromStorage = localStorage.getItem("spotify_access_token");

    const token = tokenFromUrl || tokenFromStorage;

    if (token) {
      setAccessToken(token);
      // Usuń token z URL dla czystości
      if (tokenFromUrl) {
        window.history.replaceState({}, document.title, "/dashboard");
      }
    } else {
      // Jeśli brak tokenu, przekieruj do logowania
      console.warn("No Spotify token found, redirecting to login");
      navigate("/");
    }
  }, [navigate]);

  // 2. Inicjalizacja Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken) return;

    // Sprawdź czy SDK już jest załadowane
    if (window.Spotify) {
      initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer();
      };

      // Załaduj SDK jeśli jeszcze nie jest
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
        name: "Music Recommender Web Player",
        // getOAuthToken: (cb: (token: string) => void) => {
        //   cb(accessToken);
        // },
        volume: 0.5,
      });

      // Zdarzenia playera
      spotifyPlayer.addListener(
        "ready",
        ({ device_id }: { device_id: string }) => {
          console.log("✅ Spotify Player Ready! Device ID:", device_id);
          setDeviceId(device_id);
          setPlayerReady(true);
          showSnackbar("Spotify Player connected successfully!");
        }
      );

      spotifyPlayer.addListener(
        "not_ready",
        ({ device_id }: { device_id: string }) => {
          console.log("⚠️ Device went offline", device_id);
          setPlayerReady(false);
        }
      );

      spotifyPlayer.addListener("player_state_changed", (state: any) => {
        if (!state) return;

        setIsPlaying(!state.paused);

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
        console.error("Failed to initialize:", message);
        showSnackbar("Failed to initialize player: " + message);
      });

      spotifyPlayer.addListener("authentication_error", ({ message }: any) => {
        console.error("Failed to authenticate:", message);
        showSnackbar("Authentication error. Please login again.");
        handleLogout();
      });

      spotifyPlayer.addListener("account_error", ({ message }: any) => {
        console.error("Account error:", message);
        showSnackbar("Account error: " + message);
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken]);

  // 3. Pobranie rekomendacji z backendu
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist.trim() || !title.trim()) {
      setError("Please enter both artist and title");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("http://localhost:5001/recommend", {
        artist,
        title,
      });
      setRecommendations(
        res.data.recommendations.map((t: Track) => ({
          ...t,
          uri: `spotify:track:${t.id}`,
        }))
      );
      showSnackbar(`Found ${res.data.recommendations.length} recommendations!`);
    } catch (err) {
      setError("Failed to fetch recommendations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Odtwarzanie utworu
  const playTrack = async (track: Track) => {
    if (!deviceId || !accessToken || !track.uri) {
      showSnackbar("Spotify Player not ready yet. Please wait...");
      return;
    }

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          body: JSON.stringify({ uris: [track.uri] }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setCurrentTrack(track);
      showSnackbar(`Now playing: ${track.name}`);
    } catch (err) {
      console.error("Error playing track:", err);
      showSnackbar("Failed to play track. Make sure Spotify is active.");
    }
  };

  // 5. Pauza/wznowienie
  const togglePlayback = async () => {
    if (!player) return;

    try {
      await player.togglePlay();
    } catch (err) {
      console.error("Error toggling playback:", err);
    }
  };

  // 6. Wylogowanie
  const handleLogout = () => {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_token_expiration");
    if (player) {
      player.disconnect();
    }
    navigate("/");
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header z przyciskiem wylogowania */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                borderColor: "#1DB954",
                color: "#1DB954",
              },
            }}
          >
            Logout
          </Button>
        </Box>

        {/* Status połączenia */}
        {!playerReady && accessToken && (
          <Alert severity="info" sx={{ mb: 2 }} icon={<VolumeUp />}>
            Connecting to Spotify Player...
          </Alert>
        )}

        {/* Aktualnie odtwarzany utwór */}
        {currentTrack && (
          <Fade in>
            <Paper
              sx={{
                p: 2,
                mb: 3,
                background: "rgba(29, 185, 84, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: 2,
                border: "1px solid rgba(29, 185, 84, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {currentTrack.cover && (
                <Box
                  component="img"
                  src={currentTrack.cover}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                  }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ color: "white" }}>
                  {currentTrack.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  {currentTrack.artists}
                </Typography>
              </Box>
              <IconButton
                onClick={togglePlayback}
                sx={{
                  bgcolor: "#1DB954",
                  color: "white",
                  "&:hover": { bgcolor: "#1ed760" },
                }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Paper>
          </Fade>
        )}

        {/* Formularz wyszukiwania */}
        <Fade in timeout={800}>
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              borderRadius: 3,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
            elevation={0}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <MusicNote sx={{ fontSize: 40, color: "#1DB954", mr: 2 }} />
              <Typography
                variant="h3"
                align="center"
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(45deg, #1DB954 30%, #1ed760 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: 1,
                }}
              >
                Music Recommender
              </Typography>
            </Box>

            <Stack
              component="form"
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              onSubmit={handleSearch}
            >
              <TextField
                label="Artist"
                fullWidth
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#1DB954",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1DB954",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
              />
              <TextField
                label="Title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#1DB954",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1DB954",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<SearchIcon />}
                disabled={loading}
                sx={{
                  minWidth: { xs: "100%", sm: 140 },
                  background:
                    "linear-gradient(45deg, #1DB954 30%, #1ed760 90%)",
                  color: "white",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1ed760 30%, #1DB954 90%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(29, 185, 84, 0.4)",
                  },
                  "&:disabled": {
                    background: "rgba(255, 255, 255, 0.12)",
                  },
                }}
              >
                Search
              </Button>
            </Stack>
            {loading && (
              <LinearProgress
                sx={{
                  mt: 2,
                  borderRadius: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #1DB954, #1ed760)",
                  },
                }}
              />
            )}
            {error && (
              <Fade in>
                <Typography
                  color="error"
                  align="center"
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "rgba(211, 47, 47, 0.1)",
                    borderRadius: 2,
                    border: "1px solid rgba(211, 47, 47, 0.3)",
                  }}
                >
                  {error}
                </Typography>
              </Fade>
            )}
          </Paper>
        </Fade>

        {/* Lista rekomendacji */}
        <Grid container spacing={3}>
          {recommendations.map((track, index) => (
            <Grid>
              <Grow in timeout={300 + index * 100}>
                <Card
                  onMouseEnter={() => setHoveredCard(track.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  sx={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 3,
                    border:
                      currentTrack?.id === track.id
                        ? "2px solid #1DB954"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform:
                      hoveredCard === track.id
                        ? "translateY(-8px)"
                        : "translateY(0)",
                    boxShadow:
                      hoveredCard === track.id
                        ? "0 12px 40px rgba(0, 0, 0, 0.5)"
                        : "0 4px 20px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <Box sx={{ position: "relative", overflow: "hidden" }}>
                    <CardMedia
                      component="img"
                      image={track.cover}
                      sx={{
                        height: 300,
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                        transform:
                          hoveredCard === track.id ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                    <Zoom in={hoveredCard === track.id}>
                      <IconButton
                        onClick={() => playTrack(track)}
                        disabled={!playerReady}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          bgcolor: "#1DB954",
                          width: 64,
                          height: 64,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            bgcolor: "#1ed760",
                            transform: "translate(-50%, -50%) scale(1.1)",
                            boxShadow: "0 8px 24px rgba(29, 185, 84, 0.5)",
                          },
                          "&:disabled": {
                            bgcolor: "rgba(29, 185, 84, 0.3)",
                          },
                        }}
                      >
                        <PlayArrow sx={{ fontSize: 40, color: "white" }} />
                      </IconButton>
                    </Zoom>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "50%",
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                        opacity: hoveredCard === track.id ? 1 : 0,
                        transition: "opacity 0.3s ease",
                      }}
                    />
                  </Box>
                  <CardContent sx={{ color: "white", pb: 1 }}>
                    <Typography
                      variant="h6"
                      noWrap
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      {track.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 0.3 }}
                      noWrap
                    >
                      {track.artists}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                      noWrap
                    >
                      {track.album}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      href={track.spotify_url}
                      target="_blank"
                      sx={{
                        borderColor: "rgba(29, 185, 84, 0.5)",
                        color: "#1DB954",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "#1DB954",
                          bgcolor: "rgba(29, 185, 84, 0.1)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      Open in Spotify
                    </Button>
                  </Box>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Snackbar dla powiadomień */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
