import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

const SPOTIFY_CLIENT_ID = "07aa42f54a97449784d02b56bbe8ccb4";
const REDIRECT_URI = "https://echo-find-seven.vercel.app/callback";

export default function SpotifyCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      // Pobieramy code z URL (już nie hash, tylko query param)
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");

      const savedState = localStorage.getItem("spotify_auth_state");
      const codeVerifier = localStorage.getItem("spotify_code_verifier");

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

      if (!code || !codeVerifier) {
        console.error("No code or verifier");
        navigate("/");
        return;
      }

      try {
        // Wymieniamy code na access token
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier,
          }),
        });

        const data = await response.json();

        if (data.access_token) {
          const expirationTime = Date.now() + data.expires_in * 1000;

          localStorage.setItem("spotify_access_token", data.access_token);
          localStorage.setItem("spotify_refresh_token", data.refresh_token);
          localStorage.setItem(
            "spotify_token_expiration",
            expirationTime.toString()
          );
          localStorage.removeItem("spotify_auth_state");
          localStorage.removeItem("spotify_code_verifier");

          console.log("✅ Spotify login successful!");
          navigate("/dashboard");
        } else {
          console.error("No access token received");
          navigate("/");
        }
      } catch (err) {
        console.error("Token exchange error:", err);
        navigate("/");
      }
    };

    exchangeCodeForToken();
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
      <CircularProgress size={60} sx={{ color: "#1DB954", mb: 3 }} />
      <Typography variant="h5" sx={{ color: "white", fontWeight: 500 }}>
        Connecting to Spotify...
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "rgba(255, 255, 255, 0.6)", mt: 1 }}
      >
        Please wait while we authenticate your account
      </Typography>
    </Box>
  );
}
