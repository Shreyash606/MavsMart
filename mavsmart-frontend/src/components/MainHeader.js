import React from "react";
import { Link, useLocation } from "react-router-dom";

const MainHeader = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="bg-[#d6d6db]">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Show MavsMart logo on all pages */}
        <h1 className="text-4xl font-bold text-[#0064b1] font-sans-serif">
          <Link to="/">MavsMart</Link>
        </h1>

        {/* Handle navigation based on the current path */}
        <nav className="space-x-4 flex items-center">
          
          

          {/* On Login or Signup page, show only MavsMart logo */}
          {(currentPath === "/signup") && null}

          {/* On Buy and Sell pages, show respective links (Sell on Buy page, Buy on Sell page) */}
          {currentPath !== "/login" &&
            currentPath !== "/" &&
            currentPath !== "/signup" && (
              <>
                {currentPath !== "/buy" && (
                  <Link
                    to="/buy"
                    className="text-gray-700 font-sans-serif hover:text-[#0064b1]"
                  >
                    Buy
                  </Link>
                )}
                {currentPath !== "/sell" && (
                  <Link
                    to="/sell"
                    className="text-gray-700 font-sans-serif hover:text-[#0064b1]"
                  >
                    Sell
                  </Link>
                )}
              </>
            )}

          {/* On any page except Login and Signup, show Login button */}
          {currentPath !== "/login" && currentPath !== "/signup" && (
            <button
              type="button"
              className="text-white bg-[#0064b1] hover:bg-slate-500 hover:text-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2"
            >
              <Link to="/login">Login</Link>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default MainHeader;
