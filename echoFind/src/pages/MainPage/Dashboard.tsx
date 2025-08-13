import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  LinearProgress,
  IconButton,
  Box,
  Paper,
  Stack,
  Slider,
} from "@mui/material";
import { PlayArrow, Pause, Search as SearchIcon } from "@mui/icons-material";
import axios from "axios";

interface Track {
  id: string;
  name: string;
  artists: string;
  album: string;
  cover: string;
  preview_url: string | null;
  spotify_url: string;
}

function Dashboard() {
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zmienione:
  const [currentlyPlayingTrack, setCurrentlyPlayingTrack] =
    useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist.trim() || !title.trim()) {
      setError("Please enter both artist and title");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5001/recommend", {
        artist,
        title,
      });
      setRecommendations(response.data.recommendations);
    } catch (err) {
      setError("Failed to get recommendations. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (track: Track) => {
    if (!track.preview_url) {
      setError("No preview available for this track");
      return;
    }

    if (currentlyPlayingTrack?.id === track.id) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(track.preview_url);
      audioRef.current
        .play()
        .then(() => {
          setCurrentlyPlayingTrack(track);
          setIsPlaying(true);
          setProgress(0);

          audioRef.current?.addEventListener("ended", () => {
            setIsPlaying(false);
            setCurrentlyPlayingTrack(null);
            setProgress(0);
          });

          audioRef.current?.addEventListener("timeupdate", () => {
            if (audioRef.current) {
              setProgress(audioRef.current.currentTime);
            }
          });
        })
        .catch((err) => {
          console.error("Error playing audio:", err);
          setError("Could not play preview. Please try another track.");
        });
    }
  };

  const handleProgressChange = (event: Event, value: number | number[]) => {
    if (!audioRef.current) return;
    const newTime = Array.isArray(value) ? value[0] : value;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, height: "100vh", overflowY: "auto", bgcolor: "#fafafa" }}
    >
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          Music Recommender
        </Typography>

        <Stack
          component="form"
          onSubmit={handleSearch}
          spacing={2}
          direction="row"
          sx={{ mb: 3 }}
        >
          <TextField
            fullWidth
            label="Artist"
            variant="outlined"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SearchIcon />}
            disabled={loading}
            sx={{ px: 4 }}
          >
            Search
          </Button>
        </Stack>

        {loading && <LinearProgress sx={{ mb: 4 }} />}
      </Paper>

      <Grid
        container
        spacing={3}
        sx={{
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {recommendations.map((track) => (
          <Card
            key={track.id}
            sx={{
              width: 300,
              display: "flex",
              flexDirection: "column",
              cursor: track.preview_url ? "pointer" : "default",
              position: "relative",
              overflow: "hidden",
            }}
            onClick={() => togglePlay(track)} // <-- jeden argument: cały track
          >
            <Box
              sx={{
                position: "relative",
                width: 300,
                height: 300,
                backgroundImage: `url(${track.cover})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                "&:hover .play-icon": {
                  opacity: 1,
                },
              }}
            >
              <IconButton
                className="play-icon"
                aria-label="play/pause"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay(track); // <-- jeden argument
                }}
                color={
                  currentlyPlayingTrack?.id === track.id ? "primary" : "default"
                }
                disabled={!track.preview_url}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  bgcolor: "rgba(0,0,0,0.5)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                  opacity: currentlyPlayingTrack?.id === track.id ? 1 : 0.7,
                  transition: "opacity 0.3s ease",
                  width: 60,
                  height: 60,
                }}
              >
                {currentlyPlayingTrack?.id === track.id ? (
                  <Pause sx={{ fontSize: 40 }} />
                ) : (
                  <PlayArrow sx={{ fontSize: 40 }} />
                )}
              </IconButton>
            </Box>

            <CardContent sx={{ flexGrow: 1 }}>
              <Typography
                gutterBottom
                variant="h6"
                component="div"
                noWrap
                title={track.name}
              >
                {track.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                title={track.artists}
              >
                {track.artists}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                title={track.album}
              >
                {track.album}
              </Typography>
            </CardContent>
            <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
              <Button
                variant="outlined"
                size="small"
                href={track.spotify_url}
                target="_blank"
                rel="noopener"
              >
                Open
              </Button>
            </Box>
          </Card>
        ))}
      </Grid>

      {/* BottomBar */}
      {currentlyPlayingTrack && (
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1,
            zIndex: 1300,
          }}
        >
          <CardMedia
            component="img"
            image={currentlyPlayingTrack.cover}
            alt={currentlyPlayingTrack.name}
            sx={{ height: 56, width: 56, borderRadius: 1, mr: 2 }}
          />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography noWrap fontWeight="bold">
              {currentlyPlayingTrack.name}
            </Typography>
            <Typography noWrap variant="body2" color="text.secondary">
              {currentlyPlayingTrack.artists}
            </Typography>
            <Slider
              min={0}
              max={audioRef.current?.duration || 0}
              value={progress}
              onChange={handleProgressChange}
              size="small"
              aria-label="audio progress"
            />
          </Box>
          <IconButton
            onClick={handlePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Paper>
      )}

      {recommendations.length === 0 && !loading && (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          Search for a song to get recommendations
        </Typography>
      )}
    </Container>
  );
}

export default Dashboard;
