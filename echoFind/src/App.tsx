import { Box } from "@mui/material";
import Router from "./routes/router";

export default function App() {
  return (
    <Box sx={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Router />
    </Box>
  );
}
