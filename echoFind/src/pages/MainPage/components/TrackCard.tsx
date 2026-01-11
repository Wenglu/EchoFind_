import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Button,
  Zoom,
} from "@mui/material";
import { PlayArrow, MusicNote } from "@mui/icons-material";

interface Track {
  id: string;
  name: string;
  artists: string;
  album: string;
  cover: string;
  spotify_url: string;
  uri: string;
}

interface TrackCardProps {
  track: Track;
  onPlay: (uri: string) => void;
  isCurrentTrack: boolean;
  isPlayerReady: boolean;
}

const theme = {
  primary: "#1DB954",
  primaryDark: "#1ed760",
  background: {
    card: "rgba(30, 30, 46, 0.6)",
    cardHover: "rgba(40, 40, 60, 0.8)",
  },
  text: {
    primary: "#ffffff",
    secondary: "rgba(255, 255, 255, 0.7)",
    tertiary: "rgba(255, 255, 255, 0.5)",
  },
  border: "rgba(29, 185, 84, 0.2)",
};

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  onPlay,
  isCurrentTrack,
  isPlayerReady,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: "480px",
        height: "480px",
        display: "flex",
        flexDirection: "column",
        background: theme.background.card,
        backdropFilter: "blur(10px)",
        borderRadius: { xs: 1.5, sm: 2 },
        border: isCurrentTrack
          ? `2px solid ${theme.primary}`
          : `1px solid ${theme.border}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 8px 20px rgba(0, 0, 0, 0.6), 0 0 0 1px ${theme.primary}40`
          : "0 2px 8px rgba(0, 0, 0, 0.4)",
        "&:hover": {
          background: theme.background.cardHover,
        },
      }}
    >
      {/* Cover Image with Play Button */}
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        {track.cover ? (
          <CardMedia
            component="img"
            image={track.cover}
            alt={track.name}
            sx={{
              aspectRatio: "1",
              objectFit: "cover",
              transition: "transform 0.3s ease",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        ) : (
          <Box
            sx={{
              aspectRatio: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(29, 185, 84, 0.2) 0%, rgba(30, 30, 46, 0.8) 100%)",
              transition: "transform 0.3s ease",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          >
            <MusicNote
              sx={{
                fontSize: { xs: 60, sm: 80 },
                color: theme.primary,
                opacity: 0.6,
              }}
            />
          </Box>
        )}

        {/* Gradient Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
            opacity: isHovered ? 1 : 0.3,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Play Button */}
        <Zoom in={isHovered || isCurrentTrack}>
          <IconButton
            onClick={() => onPlay(track.uri)}
            disabled={!isPlayerReady}
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              bgcolor: theme.primary,
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              boxShadow: "0 4px 12px rgba(29, 185, 84, 0.4)",
              "&:hover": {
                bgcolor: theme.primaryDark,
                transform: "scale(1.1)",
                boxShadow: "0 6px 16px rgba(29, 185, 84, 0.6)",
              },
              "&:disabled": {
                bgcolor: "rgba(29, 185, 84, 0.3)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <PlayArrow sx={{ fontSize: { xs: 20, sm: 26 }, color: "white" }} />
          </IconButton>
        </Zoom>
      </Box>

      {/* Track Info */}
      <CardContent
        sx={{
          flexGrow: 1,
          color: theme.text.primary,
          p: { xs: 1, sm: 1.5 },
          pb: { xs: 0.75, sm: 1 },
          "&:last-child": {
            pb: { xs: 0.75, sm: 1 },
          },
        }}
      >
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontWeight: 600,
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
            mb: 0.3,
            lineHeight: 1.2,
          }}
        >
          {track.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: theme.text.secondary,
            fontSize: { xs: "0.7rem", sm: "0.75rem" },
            display: "block",
          }}
          noWrap
        >
          {track.artists}
        </Typography>
      </CardContent>

      {/* Spotify Link */}
      <Box sx={{ px: { xs: 1, sm: 1.5 }, pb: { xs: 1, sm: 1.5 } }}>
        <Button
          variant="outlined"
          fullWidth
          size="small"
          href={track.spotify_url}
          target="_blank"
          sx={{
            borderColor: theme.border,
            color: theme.primary,
            fontSize: { xs: "0.7rem", sm: "0.75rem" },
            py: { xs: 0.4, sm: 0.5 },
            minHeight: { xs: 28, sm: 32 },
            textTransform: "none",
            fontWeight: 500,
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: theme.primary,
              bgcolor: "rgba(29, 185, 84, 0.1)",
              transform: "translateY(-2px)",
            },
          }}
        >
          Open in Spotify
        </Button>
      </Box>
    </Card>
  );
};
