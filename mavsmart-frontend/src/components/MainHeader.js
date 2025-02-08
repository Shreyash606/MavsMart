import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth"; // Import Firebase auth methods
import DropdownMenu from "./DropDown";

const MainHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [userName, setUserName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const getInitials = (name) => {
    if (!name) return "U";

    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }

    return initials;
  };

  // Generate background color based on name
  const generateBackgroundColor = (name) => {
    if (!name) return "#0064b1"; // Default color

    const colors = [
      "#0064b1", // Blue
      "#2ecc71", // Green
      "#e74c3c", // Red
      "#f1c40f", // Yellow
      "#9b59b6", // Purple
      "#e67e22", // Orange
    ];

    const hash = name
      .split("")
      .reduce((acc, char) => char.charCodeAt(0) + acc, 0);

    return colors[hash % colors.length];
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const token = await user.getIdToken();

          // Fetch user data from your backend
          const response = await fetch("http://localhost:5002/api/UserData", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const currentUser = data.find((u) => u.uid === user.uid); // Match user by UID

            if (currentUser) {
              setUserData(currentUser);
              setUserName(currentUser.name || "User"); // Set user's name or default to "User"
              setIsLoggedIn(true); // Set logged-in state after verifying user
            }
          } else {
            console.error("Failed to fetch user data");
          }
        } else {
          setIsLoggedIn(false);
          setUserName("");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
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
        <div className="flex flex-row items-center space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 "
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
          <h1 className="text-4xl font-bold text-[#0064b1] font-sans-serif">
            <Link to="/">MavsMart</Link>
          </h1>
        </div>

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
              {/* Avatar with initials */}
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full cursor-pointer flex items-center justify-center text-white font-semibold"
                style={{
                  backgroundColor: generateBackgroundColor(userName),
                  fontSize: "1rem",
                }}
              >
                {getInitials(userName)}
              </div>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <DropdownMenu
                  userName={userName || "User"}
                  handleLogout={handleLogout}
                />
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
