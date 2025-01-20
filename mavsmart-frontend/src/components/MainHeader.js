import React from "react";
import { Link } from "react-router-dom";

const MainHeader = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <h1 className="text-4xl font-bold text-[#0064b1] font-sans-serif">
          <Link to="/">MavsMart</Link>
        </h1>
        <nav className="space-x-4">
          <Link to="/buy" className="text-gray-700 font-sans-serif hover:text-[#0064b1]">
            Buy
          </Link>
          <Link to="/sell" className="text-gray-700 font-sans-serif hover:text-[#0064b1]">
            Sell
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 bg-[#0064b1] text-white font-sans-serif rounded hover:bg-slate-500 hover:text-black"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default MainHeader;
