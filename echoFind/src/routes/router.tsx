import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInSide from "../pages/SignIn/login";
import Dashboard from "../pages/MainPage/Dashboard";
import SpotifyCallback from "../pages/MainPage/spotifyCallback";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInSide />} />
        <Route path="/callback" element={<SpotifyCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<SignInSide />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
