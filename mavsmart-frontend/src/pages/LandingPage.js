import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingHeader from "../components/MainHeader";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Authentication/firebase-config";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// Animation Variants
const titleVariants = {
  hidden: { opacity: 0, y: 80 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15, // Stagger effect
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.7 } },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { delay: 0.7, duration: 0.5 } },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Handle Sell button click
  const handleSellClick = () => {
    navigate(auth.currentUser ? "/sell" : "/login");
  };

  // Primary Button Component
  const PrimaryButton = ({ children, onClick, isSecondary }) => (
    <motion.button
      type="button"
      className={`${
        isSecondary
          ? "text-black bg-gray-300 hover:bg-[#0064b1] hover:text-white"
          : "text-white bg-[#0064b1] hover:bg-gray-300 hover:text-black"
      } focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2`}
      onClick={onClick}
      variants={buttonVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.button>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="bg-[#ebedf0] flex-grow flex items-center container mx-auto justify-between p-4">
        <div className="flex-1 flex justify-center">
          <DotLottieReact
            src="https://lottie.host/d822ddf8-a559-44e8-960f-853f05038ae1/0jHgHTt4mJ.lottie"
            loop
            autoplay
            className="w-full max-w-xl sm:max-w-md lg:max-w-2xl"
          />
        </div>
        <div className="flex-1">
          {/* Title with staggered character animation */}
          <h1 className="text-5xl font-bold text-gray-800 sm:text-6xl lg:text-8xl">
            {"Welcome to MavsMart!".split("").map((char, index) => (
              <motion.span
                key={index}
                custom={index}
                variants={titleVariants}
                initial="hidden"
                animate="visible"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle Animation */}
          <motion.p
            className="mt-4 text-2xl text-gray-800 sm:text-4xl lg:text-5xl"
            variants={subtitleVariants}
            initial="hidden"
            animate="visible"
          >
            Simplifying life for every Maverick!
          </motion.p>

          {/* Buttons with Motion */}
          <motion.div className="mt-8 space-x-4">
            <PrimaryButton onClick={() => navigate("/buy")}>Buy</PrimaryButton>
            <PrimaryButton onClick={handleSellClick} isSecondary>
              Sell
            </PrimaryButton>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
