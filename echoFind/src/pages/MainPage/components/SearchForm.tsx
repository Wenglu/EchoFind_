import React, { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  LinearProgress,
  Fade,
} from "@mui/material";
import { Search as SearchIcon, MusicNote } from "@mui/icons-material";

interface SearchFormProps {
  onSearch: (artist: string, title: string) => Promise<void>;
  loading: boolean;
}

const theme = {
  primary: "#1DB954",
  primaryDark: "#1ed760",
  background: {
    card: "rgba(30, 30, 46, 0.6)",
  },
  text: {
    primary: "#ffffff",
    secondary: "rgba(255, 255, 255, 0.7)",
    tertiary: "rgba(255, 255, 255, 0.5)",
  },
  border: "rgba(29, 185, 84, 0.2)",
  borderHover: "rgba(29, 185, 84, 0.5)",
};

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  loading,
}) => {
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!artist.trim() || !title.trim()) {
      setError("Please enter both artist and song title");
      return;
    }

    await onSearch(artist, title);
  };

  return (
    <Fade in timeout={600}>
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 4,
          background: theme.background.card,
          backdropFilter: "blur(10px)",
          borderRadius: 3,
          border: `1px solid ${theme.border}`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
        elevation={0}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            gap: 2,
          }}
        >
          <MusicNote
            sx={{
              fontSize: { xs: 32, sm: 40 },
              color: theme.primary,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              background: `linear-gradient(45deg, ${theme.primary} 30%, ${theme.primaryDark} 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1,
            }}
          >
            EchoFind
          </Typography>
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{
            color: theme.text.secondary,
            mb: 3,
            fontSize: { xs: "0.85rem", sm: "0.95rem" },
          }}
        >
          Discover music similar to your favorite tracks
        </Typography>

        {/* Search Form */}
        <Stack
          component="form"
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Artist"
            fullWidth
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="e.g. The Beatles"
            error={!!error && !artist.trim()}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: theme.text.primary,
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                "& fieldset": {
                  borderColor: theme.border,
                },
                "&:hover fieldset": {
                  borderColor: theme.borderHover,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.primary,
                },
              },
              "& .MuiInputLabel-root": {
                color: theme.text.secondary,
                "&.Mui-focused": {
                  color: theme.primary,
                },
              },
            }}
          />

          <TextField
            label="Song Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Yesterday"
            error={!!error && !title.trim()}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: theme.text.primary,
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                "& fieldset": {
                  borderColor: theme.border,
                },
                "&:hover fieldset": {
                  borderColor: theme.borderHover,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.primary,
                },
              },
              "& .MuiInputLabel-root": {
                color: theme.text.secondary,
                "&.Mui-focused": {
                  color: theme.primary,
                },
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
              height: { xs: 48, sm: 56 },
              background: `linear-gradient(45deg, ${theme.primary} 30%, ${theme.primaryDark} 90%)`,
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              fontSize: { xs: "0.95rem", sm: "1rem" },
              boxShadow: `0 4px 12px rgba(29, 185, 84, 0.3)`,
              "&:hover": {
                background: `linear-gradient(45deg, ${theme.primaryDark} 30%, ${theme.primary} 90%)`,
                transform: "translateY(-2px)",
                boxShadow: `0 6px 16px rgba(29, 185, 84, 0.4)`,
              },
              "&:active": {
                transform: "translateY(0)",
              },
              "&:disabled": {
                background: "rgba(255, 255, 255, 0.12)",
                color: "rgba(255, 255, 255, 0.3)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </Stack>

        {/* Error Message */}
        {error && (
          <Fade in>
            <Typography
              variant="body2"
              align="center"
              sx={{
                mt: 2,
                color: "#ff6b6b",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </Typography>
          </Fade>
        )}

        {/* Loading Progress */}
        {loading && (
          <LinearProgress
            sx={{
              mt: 2,
              borderRadius: 1,
              height: 3,
              backgroundColor: "rgba(29, 185, 84, 0.1)",
              "& .MuiLinearProgress-bar": {
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.primaryDark})`,
                borderRadius: 1,
              },
            }}
          />
        )}
      </Paper>
    </Fade>
  );
};
