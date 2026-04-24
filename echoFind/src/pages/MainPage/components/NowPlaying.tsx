import React from "react";
import { Paper, Typography, Box, IconButton, Fade } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";

interface Track {
  name: string;
  artists: string;
  cover: string;
}

interface NowPlayingProps {
  track: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const NowPlaying: React.FC<NowPlayingProps> = ({
  track,
  isPlaying,
  onTogglePlay,
}) => {
  if (!track) return null;

  return (
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
        {track.cover && (
          <Box
            component="img"
            src={track.cover}
            alt={track.name}
            sx={{
              width: 60,
              height: 60,
              borderRadius: 1,
            }}
          />
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ color: "white" }} noWrap>
            {track.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            noWrap
          >
            {track.artists}
          </Typography>
        </Box>

        <IconButton
          onClick={onTogglePlay}
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
  );
};
