import React from "react";
import { Link } from "react-router-dom";

const MainHeader = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold text-indigo-600"><Link to = "/"> MavSmart</Link></h1>
        <nav className="space-x-4">
          <Link to="/buy" className="text-gray-700 hover:text-indigo-600">
            Buy
          </Link>
          <Link to="/sell" className="text-gray-700 hover:text-indigo-600">
            Sell
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default MainHeader;
