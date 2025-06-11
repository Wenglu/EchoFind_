import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInSide from "../pages/SignIn/login";
import SignUp from "../pages/SignUp/signUp";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/SignIn" element={<SignInSide />} />
        <Route path="/SignUp" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
