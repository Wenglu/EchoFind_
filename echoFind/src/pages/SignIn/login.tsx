import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";

const SPOTIFY_CLIENT_ID = "07aa42f54a97449784d02b56bbe8ccb4";

const REDIRECT_URI =
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5173/callback"
    : "https://echo-find-seven.vercel.app/callback";

const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-library-read",
  "playlist-read-private",
].join(" ");

const handleSpotifyLogin = () => {
  const state = Math.random().toString(36).substring(7);
  localStorage.setItem("spotify_auth_state", state);

  const authUrl =
    `https://accounts.spotify.com/authorize?` +
    `client_id=${SPOTIFY_CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `state=${state}`;

  window.location.href = authUrl;
};

export default function SignInSide() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CssBaseline />

      {/* Background decorative circles */}
      <Box
        sx={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(29,185,84,0.08) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(29,185,84,0.05) 0%, transparent 70%)",
          top: "20%",
          right: "15%",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(29,185,84,0.05) 0%, transparent 70%)",
          bottom: "20%",
          left: "15%",
          pointerEvents: "none",
        }}
      />

      {/* Login card */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          p: { xs: 4, sm: 6 },
          maxWidth: 420,
          width: "100%",
          mx: 2,
          borderRadius: 4,
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(29, 185, 84, 0.15)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(29,185,84,0.05)",
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1DB954, #1ed760)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(29,185,84,0.4)",
              fontSize: 22,
            }}
          >
            🎵
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.5px",
              fontSize: { xs: "1.75rem", sm: "2rem" },
            }}
          >
            Echo<Box component="span" sx={{ color: "#1DB954" }}>Find</Box>
          </Typography>
        </Box>

        {/* Tagline */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.9)",
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
            Discover music you'll love
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.6,
            }}
          >
            Connect your Spotify account to get AI-powered recommendations based on your favorite artists and songs.
          </Typography>
        </Box>

        {/* Spotify Login Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSpotifyLogin}
          sx={{
            py: 1.75,
            borderRadius: 3,
            background: "#1DB954",
            color: "#000",
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "0.3px",
            textTransform: "none",
            boxShadow: "0 4px 20px rgba(29,185,84,0.4)",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            "&:hover": {
              background: "#1ed760",
              boxShadow: "0 6px 28px rgba(29,185,84,0.55)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        >
          <SpotifyIcon />
          Continue with Spotify
        </Button>

        {/* Footer note */}
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.25)",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Requires Spotify Premium for full playback. By continuing, you agree to Spotify's Terms of Service.
        </Typography>
      </Box>
    </Box>
  );
}

function SpotifyIcon() {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      sx={{ width: 22, height: 22, fill: "#000", flexShrink: 0 }}
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </Box>
  );
}
