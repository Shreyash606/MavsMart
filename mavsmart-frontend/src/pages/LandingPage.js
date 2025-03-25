import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LandingHeader from "../components/MainHeader";
import { onAuthStateChanged } from "firebase/auth"; // Firebase import
import { auth } from "../Authentication/firebase-config"; // Firebase config import
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger for potential use
gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Refs for GSAP Animations
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true); // User is logged in
      } else {
        setIsLoggedIn(false); // User is not logged in
      }
    });
    return () => unsubscribe(); // Clean up on unmount
  }, []);

  // GSAP Animations on Mount
  useEffect(() => {
    const tl = gsap.timeline();

    // Hero fade-in animation
    tl.from(heroRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
    })
      // Title slide-up
      .from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
      // Subtitle slide-up
      .from(subtitleRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      })
      // Button pop-in effect
      .from(buttonRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      });

    // Button hover bounce effect
    gsap.to(buttonRef.current, {
      scale: 1.1,
      repeat: -1,
      yoyo: true,
      duration: 0.8,
      ease: "power1.inOut",
    });
  }, []);

  // Handle navigation for the "Sell" button
  const handleSellClick = () => {
    navigate(auth.currentUser ? "/sell" : "/login");
  };

  // Reusable Primary Button with animation
  const PrimaryButton = ({ children, onClick, isSecondary }) => (
    <button
      type="button"
      className={`${
        isSecondary
          ? "text-black bg-gray-300 hover:bg-[#0064b1] hover:text-white"
          : "text-white bg-[#0064b1] hover:bg-gray-300 hover:text-black"
      } focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 transition-all duration-300`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      {/* Hero Section */}
      <main
        ref={heroRef}
        className="bg-[#ebedf0] flex-grow flex items-center justify-center text-center"
      >
        <div>
          {/* Title Animation */}
          <h1
            ref={titleRef}
            className="text-5xl font-bold text-gray-800 sm:text-6xl lg:text-8xl"
          >
            Welcome to <span className="text-[#0064b1]">Mavs</span>Mart!
          </h1>

          {/* Subtitle Animation */}
          <p
            ref={subtitleRef}
            className="mt-4 text-2xl text-gray-800 sm:text-4xl lg:text-5xl"
          >
            Simplifying life for every Maverick!
          </p>

          {/* Buttons with hover animation */}
          <div ref={buttonRef} className="mt-8 space-x-4">
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
