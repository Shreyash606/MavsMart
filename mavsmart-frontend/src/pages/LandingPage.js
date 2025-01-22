import React from "react";
import { useNavigate } from "react-router-dom";
import LandingHeader from "../components/MainHeader";

const LandingPage = () => {
  const navigate = useNavigate();

  // Simulate user authentication status (replace this with actual logic)
  const isLoggedIn = false; // Set to true if the user is logged in

  // Handle navigation for the "Sell" button
  const handleSellClick = () => {
    if (!isLoggedIn) {
      navigate("/login"); // Redirect to login page if not logged in
    } else {
      navigate("/sell"); // Redirect to sell page if logged in
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="bg-[#ebedf0] flex-grow flex items-center justify-center text-center">
        <div>
          <h1 className="text-7xl font-bold text-gray-800">
            Welcome to <span className="text-[#0064b1]">Mavs</span>Mart!
          </h1>
          <p className="mt-4 text-3xl text-gray-800">
            The ultimate platform for Mavs to buy and sell items.
          </p>
          <div className="mt-8 space-x-4">
            {/* Buy Button */}
            <button
              type="button"
              className="text-white bg-[#0064b1] hover:bg-gray-300 hover:text-black focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
              onClick={() => navigate("/buy")}
            >
              Buy
            </button>

            {/* Sell Button */}
            <button
              type="button"
              className="text-black bg-gray-300 hover:bg-[#0064b1] hover:text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
              onClick={handleSellClick}
            >
              Sell
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
