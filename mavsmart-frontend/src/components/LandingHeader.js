import React from "react";
import { Link } from "react-router-dom";

const LandingHeader = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <h1 className="text-4xl font-bold text-[#0064b1] font-sans-serif">
          <Link href="#">MavsMart</Link>
        </h1>

        <a
          href="/login"
          className="px-4 py-2 bg-[#0064b1] text-white rounded hover:bg-slate-500 hover:text-black"
        >
          Login
        </a>
      </div>
    </header>
  );
};

export default LandingHeader;
