import React, { useState, useRef } from "react";
import { Box, IconButton, Typography, Slider } from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
} from "@mui/icons-material";

interface Track {
  name: string;
  artists: string;
  cover: string;
}

interface PlaybackBarProps {
  track: Track | null;
  isPlaying: boolean;
  position: number; // in milliseconds
  duration: number; // in milliseconds
  onTogglePlay: () => void;
  onSeek: (position: number) => void;
  onSkip: (direction: "next" | "previous") => void;
}

const theme = {
  primary: "#1DB954",
  primaryDark: "#1ed760",
  background: "rgba(18, 18, 18, 0.98)",
  text: {
    primary: "#ffffff",
    secondary: "rgba(255, 255, 255, 0.7)",
  },
};

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  track,
  isPlaying,
  position,
  duration,
  onTogglePlay,
  onSeek,
  onSkip,
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  if (!track) return null;

  // Format time from milliseconds to MM:SS
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeekChange = (event: Event, newValue: number | number[]) => {
    setIsSeeking(true);
    setSeekPosition(newValue as number);
  };

  const handleSeekCommitted = (
    event: Event | React.SyntheticEvent,
    newValue: number | number[]
  ) => {
    setIsSeeking(false);
    onSeek(newValue as number);
  };

  const currentPosition = isSeeking ? seekPosition : position;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: { xs: "100px", sm: "90px" },
        backgroundColor: theme.background,
        backdropFilter: "blur(20px)",
        borderTop: `1px solid rgba(29, 185, 84, 0.2)`,
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Progress Bar */}
      <Box
        sx={{
          px: 2,
          pt: 1,
          pb: 0.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: -0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: theme.text.secondary,
              minWidth: "40px",
              fontSize: "0.7rem",
            }}
          >
            {formatTime(currentPosition)}
          </Typography>
          <Slider
            size="small"
            value={currentPosition}
            min={0}
            max={duration || 100}
            onChange={handleSeekChange}
            onChangeCommitted={handleSeekCommitted}
            sx={{
              color: theme.primary,
              height: 4,
              "& .MuiSlider-thumb": {
                width: 12,
                height: 12,
                transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: `0px 0px 0px 8px rgba(29, 185, 84, 0.16)`,
                },
                "&.Mui-active": {
                  width: 16,
                  height: 16,
                },
              },
              "& .MuiSlider-rail": {
                opacity: 0.3,
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: theme.text.secondary,
              minWidth: "40px",
              fontSize: "0.7rem",
            }}
          >
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      {/* Main Controls */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, sm: 3 },
          pb: 1,
          flex: 1,
        }}
      >
        {/* Track Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
            flex: 1,
            minWidth: 0,
            maxWidth: { xs: "50%", sm: "30%" },
          }}
        >
          <Box
            component="img"
            src={track.cover}
            alt={track.name}
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              borderRadius: 1,
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            }}
          />
          <Box sx={{ minWidth: 0, display: { xs: "block", sm: "block" } }}>
            <Typography
              variant="body2"
              sx={{
                color: theme.text.primary,
                fontWeight: 600,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
              }}
              noWrap
            >
              {track.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.text.secondary,
                fontSize: { xs: "0.75rem", sm: "0.8rem" },
              }}
              noWrap
            >
              {track.artists}
            </Typography>
          </Box>
        </Box>

        {/* Playback Controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
            justifyContent: "center",
          }}
        >
          <IconButton
            onClick={() => onSkip("previous")}
            sx={{
              color: theme.text.primary,
              "&:hover": {
                color: theme.primary,
                backgroundColor: "rgba(29, 185, 84, 0.1)",
              },
            }}
            size="small"
          >
            <SkipPrevious sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </IconButton>

          <IconButton
            onClick={onTogglePlay}
            sx={{
              bgcolor: theme.primary,
              color: "white",
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              "&:hover": {
                bgcolor: theme.primaryDark,
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {isPlaying ? (
              <Pause sx={{ fontSize: { xs: 24, sm: 28 } }} />
            ) : (
              <PlayArrow sx={{ fontSize: { xs: 24, sm: 28 } }} />
            )}
          </IconButton>

          <IconButton
            onClick={() => onSkip("next")}
            sx={{
              color: theme.text.primary,
              "&:hover": {
                color: theme.primary,
                backgroundColor: "rgba(29, 185, 84, 0.1)",
              },
            }}
            size="small"
          >
            <SkipNext sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </IconButton>
        </Box>

        {/* Volume Control (hidden on mobile) */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1,
            maxWidth: "30%",
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <VolumeUp sx={{ color: theme.text.secondary, fontSize: 20 }} />
          <Slider
            size="small"
            defaultValue={50}
            sx={{
              width: 100,
              color: theme.text.secondary,
              "& .MuiSlider-thumb": {
                width: 10,
                height: 10,
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: `0px 0px 0px 8px rgba(255, 255, 255, 0.16)`,
                },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
