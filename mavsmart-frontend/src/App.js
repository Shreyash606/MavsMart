import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage"; // Ensure the import is correct
import BuyPage from "./pages/BuyPage";
import SellPage from "./pages/SellPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />{" "}
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
};

export default App;
