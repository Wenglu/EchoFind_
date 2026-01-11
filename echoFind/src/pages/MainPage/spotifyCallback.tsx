import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";

const BACKEND_URL = "http://127.0.0.1:5001"; // ← Zmień na 127.0.0.1

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  console.log("🎯 [CALLBACK] Component rendered!");

  useEffect(() => {
    console.log("🔄 [CALLBACK] SpotifyCallback component mounted");
    console.log("📍 [CALLBACK] Current URL:", window.location.href);
    console.log("🔍 [CALLBACK] URL search params:", window.location.search);
    console.log("🔍 [CALLBACK] URL hash:", window.location.hash);

    const exchangeCodeForToken = async () => {
      console.log("⚙️ [CALLBACK] Starting token exchange...");

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const spotifyError = params.get("error");

      console.log("📦 [CALLBACK] Extracted params:");
      console.log("  - code:", code ? `${code.substring(0, 20)}...` : "null");
      console.log("  - state:", state);
      console.log("  - error:", spotifyError);

      const savedState = localStorage.getItem("spotify_auth_state");
      console.log("💾 [CALLBACK] Saved state from localStorage:", savedState);

      if (spotifyError) {
        console.error("❌ [CALLBACK] Spotify error:", spotifyError);
        setError(`Spotify authorization failed: ${spotifyError}`);
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      if (state !== savedState) {
        console.error("❌ [CALLBACK] State mismatch!");
        console.error("  - Received state:", state);
        console.error("  - Saved state:", savedState);
        setError("Security error: state mismatch");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      console.log("✅ [CALLBACK] State validation passed");

      if (!code) {
        console.error("❌ [CALLBACK] No authorization code received");
        setError("No authorization code received");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      const redirect_uri =
        window.location.hostname === "127.0.0.1"
          ? "http://127.0.0.1:5173/callback"
          : "https://echo-find-seven.vercel.app/callback";

      console.log("🔗 [CALLBACK] Using redirect_uri:", redirect_uri);

      try {
        const requestBody = { code, redirect_uri };
        console.log("📤 [CALLBACK] Sending request to backend:");
        console.log("  - URL:", `${BACKEND_URL}/spotify/token`);
        console.log("  - Body:", requestBody);

        const response = await fetch(`${BACKEND_URL}/spotify/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        console.log("📥 [CALLBACK] Response status:", response.status);
        console.log("📥 [CALLBACK] Response ok:", response.ok);

        const data = await response.json();
        console.log("📥 [CALLBACK] Response data:", data);

        if (response.ok && data.access_token) {
          console.log("✅ [CALLBACK] Token received successfully!");
          console.log(
            "  - Access token (first 20 chars):",
            data.access_token.substring(0, 20) + "..."
          );
          console.log(
            "  - Refresh token:",
            data.refresh_token ? "Present" : "Missing"
          );
          console.log("  - Expires in:", data.expires_in, "seconds");

          const expirationTime = Date.now() + data.expires_in * 1000;

          localStorage.setItem("spotify_access_token", data.access_token);
          localStorage.setItem("spotify_refresh_token", data.refresh_token);
          localStorage.setItem(
            "spotify_token_expiration",
            expirationTime.toString()
          );
          localStorage.removeItem("spotify_auth_state");

          console.log("💾 [CALLBACK] Tokens saved to localStorage");
          console.log("🎉 [CALLBACK] Spotify login successful!");
          console.log("🚀 [CALLBACK] Navigating to /dashboard...");

          navigate("/dashboard");
        } else {
          console.error("❌ [CALLBACK] Token exchange failed");
          console.error("  - Error:", data.error);
          setError(data.error || "Token exchange failed");
          setTimeout(() => navigate("/"), 3000);
        }
      } catch (err) {
        console.error("❌ [CALLBACK] Fetch error:", err);
        if (err instanceof Error) {
          console.error("  - Error message:", err.message);
          console.error("  - Error stack:", err.stack);
        } else {
          console.error("  - Unknown error:", err);
        }
        setError("Failed to connect to backend");
        setTimeout(() => navigate("/"), 3000);
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
      {error ? (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
          {error}
        </Alert>
      ) : (
        <>
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
        </>
      )}
    </Box>
  );
}
