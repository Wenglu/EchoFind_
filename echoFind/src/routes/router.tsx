import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInSide from "../pages/SignIn/login";
import SignUp from "../pages/SignUp/signUp";
import Dashboard from "../pages/MainPage/Dashboard";
import SpotifyCallback from "../pages/MainPage/spotifyCallback";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInSide />} />
        <Route path="*" element={<SignInSide />} />
        <Route path="/SignIn" element={<SignInSide />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/" element={<SignInSide />} />
        <Route path="/callback" element={<SpotifyCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
