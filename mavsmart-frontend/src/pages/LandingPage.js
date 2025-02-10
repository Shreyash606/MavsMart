import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingHeader from "../components/MainHeader";
import { onAuthStateChanged } from "firebase/auth"; // Import from Firebase
import { auth } from "../Authentication/firebase-config"; // Import Firebase configuration

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true); // User is logged in
      } else {
        setIsLoggedIn(false); // User is not logged in
      }
    });
    return () => unsubscribe(); // Clean up on component unmount
  }, []);

  // Handle navigation for the "Sell" button
  const handleSellClick = () => {
    navigate(auth.currentUser ? "/sell" : "/login");
  };

  const PrimaryButton = ({ children, onClick, isSecondary }) => (
    <button
      type="button"
      className={`${
        isSecondary
          ? "text-black bg-gray-300 hover:bg-[#0064b1] hover:text-white"
          : "text-white bg-[#0064b1] hover:bg-gray-300 hover:text-black"
      } focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="bg-[#ebedf0] flex-grow flex items-center justify-center text-center">
        <div>
          <h1 className="text-5xl font-bold text-gray-800 sm:text-6xl lg:text-7xl">
            Welcome to <span className="text-[#0064b1]">Mavs</span>Mart!
          </h1>
          <p className="mt-4 text-2xl text-gray-800 sm:text-3xl lg:text-4xl">
            {/*The ultimate platform for Mavs to buy and sell items.*/}
            Simplifying life for every Maverick!
          </p>
          <div className="mt-8 space-x-4">
            {/* Buy Button */}
            <PrimaryButton onClick={() => navigate("/buy")}>Buy</PrimaryButton>

            {/* Sell Button */}
            <PrimaryButton onClick={handleSellClick} isSecondary>
              Sell
            </PrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
