import React from "react";
import LandingHeader from "../components/LandingHeader";

const LandingPage = () => {
  return (
    <div>
      <LandingHeader />
      <main className="container mx-auto text-center mt-16">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to MavSmart!
        </h1>
        <p className="mt-4 text-gray-600">
          The ultimate platform for university students to buy and sell items.
        </p>
        <div className="mt-8 space-x-4">
          <a
            href="/buy"
            className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            Buy
          </a>
          <a
            href="/sell"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Sell
          </a>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
