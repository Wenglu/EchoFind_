import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInSide from "../pages/SignIn/login";
import SignUp from "../pages/SignUp/signUp";
import Dashboard from "../pages/MainPage/Dashboard";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInSide />} />
        <Route path="*" element={<SignInSide />} />
        <Route path="/SignIn" element={<SignInSide />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
