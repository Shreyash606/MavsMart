import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth"; // Import Firebase auth methods

const MainHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState(""); // State for storing user name
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  useEffect(() => {
    // Check if the user is logged in (can also use Firebase auth state for real-time changes)
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setIsLoggedIn(true);
      setUserName(user.displayName || "User"); // Set display name, default to "User"
    } else {
      setIsLoggedIn(false);
      setUserName(""); // Reset name if user is logged out
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth); // Sign out the user
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUserName(""); // Reset name after logout
      navigate("/"); // Redirect to landing page after logout
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  };

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
          {currentPath === "/signup" && null}

          {/* On Buy and Sell pages, show respective links */}
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

          {isLoggedIn ? (
           
            <div className="relative">
              {/* Avatar and dropdown */}
              <img
                id="avatarButton"
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full cursor-pointer"
                src="https://api.dicebear.com/9.x/bottts/svg?seed=random"
                alt="User dropdown"
              />

              {/* Dropdown menu */}

              {isDropdownOpen && (
                <div
                  id="userDropdown"
                  className="z-10 absolute right-0 mt-2 bg-[#d6d6db] divide-y divide-gray-100 rounded-lg shadow-sm w-44 text-center"
                >
                  <div className="px-4 py-3 text-sm text-black-900 text-sm">
                    <div>{userName}</div>
                  </div>

                  <div className="py-1">
                    <a
                      href="#"
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-black-900 hover:bg-[#0064b1] hover:text-white text-sm"
                    >
                      Sign out
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
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
