import React from "react";
import LandingHeader from "../components/MainHeader";
import { Link } from "react-router-dom";

const LandingPage = () => {
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
            <button
              type="button"
              
              class="text-white bg-[#0064b1] hover:bg-gray-300 hover:text-black focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 "
            >
            <Link to="/buy">Buy </Link>
            </button>
            
            <button
              type="button"
              
              class="text-black bg-gray-300 hover:bg-[#0064b1] hover:text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 "
            ><Link to="/sell">Sell </Link>
             
             
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
