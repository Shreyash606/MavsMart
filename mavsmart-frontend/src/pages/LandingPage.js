import React from "react";
import LandingHeader from "../components/LandingHeader";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-grow flex items-center justify-center text-center">
        <div>
          <h1 className="text-7xl font-bold text-gray-800">
            Welcome to <span className="text-[#0064b1]">Mavs</span>Mart!
          </h1>
          <p className="mt-4 text-3xl text-gray-800">
            The ultimate platform for Mavs to buy and sell items.
          </p>
          <div className="mt-8 space-x-4">
            <a
              href="/buy"
              className="px-6 py-3 bg-[#0064b1] text-white rounded hover:bg-slate-500 hover:text-black" 
            >
              Buy
            </a>
            <a
              href="/sell"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded hover:bg-[#0064b1] hover:text-white"
            >
              Sell
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
