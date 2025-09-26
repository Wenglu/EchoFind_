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
} from "@mui/material";
import { PlayArrow, Search as SearchIcon } from "@mui/icons-material";
import axios from "axios";

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
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // 1. Pobierz token z URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    if (token) setAccessToken(token);
  }, []);

  // 2. Inicjalizacja Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken) return;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "My Web Player",
        getOAuthToken: (cb: (token: string) => void) => cb(accessToken),
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("Got Device ID:", device_id);
        setDeviceId(device_id);
      });

      player.addListener(
        "not_ready",
        ({ device_id }: { device_id: string }) => {
          console.log("Device went offline", device_id);
        }
      );

      player.connect();
    };

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
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
    } catch {
      setError("Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  // 4. Odtwarzanie utworu
  const playTrack = async (track: Track) => {
    if (!deviceId || !accessToken || !track.uri) {
      setError("Spotify Player not ready");
      return;
    }

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
  };

  return (
    <Container>
      <Paper sx={{ p: 4, mb: 4 }} elevation={3}>
        <Typography variant="h4" align="center" gutterBottom>
          Music Recommender
        </Typography>
        <Stack
          component="form"
          direction="row"
          spacing={2}
          onSubmit={handleSearch}
        >
          <TextField
            label="Artist"
            fullWidth
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
            disabled={loading}
          >
            Search
          </Button>
        </Stack>
        {loading && <LinearProgress sx={{ mt: 2 }} />}
        {error && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>

      <Grid container spacing={3}>
        {recommendations.map((track) => (
          <Grid item key={track.id} xs={12} sm={6} md={4}>
            <Card sx={{ width: 300 }}>
              <Box sx={{ position: "relative", height: 300 }}>
                <CardMedia
                  component="img"
                  image={track.cover}
                  sx={{ height: "100%", objectFit: "cover" }}
                />
                <IconButton
                  onClick={() => playTrack(track)}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "rgba(0,0,0,0.5)",
                  }}
                >
                  <PlayArrow />
                </IconButton>
              </Box>
              <CardContent>
                <Typography noWrap>{track.name}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {track.artists}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {track.album}
                </Typography>
              </CardContent>
              <Button
                variant="outlined"
                size="small"
                href={track.spotify_url}
                target="_blank"
              >
                Open in Spotify
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
