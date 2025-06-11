import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "../pages/Login.tsx/login";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
