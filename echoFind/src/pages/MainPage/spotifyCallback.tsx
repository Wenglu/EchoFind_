import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function SpotifyCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Pobieramy token z URL hash (#access_token=...)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const expiresIn = params.get("expires_in");
    const state = params.get("state");
    const error = params.get("error");

    // Sprawdzamy state dla bezpieczeństwa
    const savedState = localStorage.getItem("spotify_auth_state");

    if (error) {
      console.error("Spotify auth error:", error);
      alert("Authorization failed: " + error);
      navigate("/");
      return;
    }

    if (state !== savedState) {
      console.error("State mismatch!");
      alert("Security error: state mismatch");
      navigate("/");
      return;
    }

    if (accessToken) {
      // Zapisujemy token i czas wygaśnięcia
      const expirationTime = Date.now() + parseInt(expiresIn || "3600") * 1000;

      localStorage.setItem("spotify_access_token", accessToken);
      localStorage.setItem(
        "spotify_token_expiration",
        expirationTime.toString()
      );
      localStorage.removeItem("spotify_auth_state");

      console.log("✅ Spotify login successful!");

      // Przekierowanie do dashboardu z tokenem w URL
      navigate(`/dashboard?access_token=${accessToken}`);
    } else {
      console.error("No access token received");
      navigate("/");
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
    >
      <CircularProgress
        size={60}
        sx={{
          color: "#1DB954",
          mb: 3,
        }}
      />
      <Typography
        variant="h5"
        sx={{
          color: "white",
          fontWeight: 500,
        }}
      >
        Connecting to Spotify...
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "rgba(255, 255, 255, 0.6)",
          mt: 1,
        }}
      >
        Please wait while we authenticate your account
      </Typography>
    </Box>
  );
}
