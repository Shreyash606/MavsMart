import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { ShoppingBag, LogOut, Menu, X } from "lucide-react";

const MainHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

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

  const generateBackgroundColor = (name) => {
    if (!name) return "#0064b1";
    const colors = [
      "#0064b1",
      "#2ecc71",
      "#e74c3c",
      "#f1c40f",
      "#9b59b6",
      "#e67e22",
      "#1abc9c",
      "#34495e",
    ];
    const hash = name
      .split("")
      .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  // Handle authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await fetch(
            "https://api.mavsmart.uta.cloud/api/UserData",
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const currentUser = data.find((u) => u.uid === user.uid);

            if (currentUser) {
              setUserName(currentUser.name || "User");
              setUserEmail(currentUser.email || user.email);
              setIsLoggedIn(true);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to Firebase user data
          setUserName(user.displayName || "User");
          setUserEmail(user.email);
          setIsLoggedIn(true);
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserEmail("");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      // Clear any stored data
      localStorage.clear();
      sessionStorage.clear();
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
    };

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isDropdownOpen, isMobileMenuOpen]);

  const isAuthPage = currentPath === "/login" || currentPath === "/signup";

  // Show loading state
  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-blue-600">Mavs</span>Mart
              </h1>
            </Link>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-blue-600">Mavs</span>Mart
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {currentPath !== "/buy" &&
              currentPath !== "/" &&
              currentPath !== "/login" &&
              currentPath !== "/signup" && (
                <Link
                  to="/buy"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Browse
                </Link>
              )}
            {currentPath !== "/sell" &&
              currentPath !== "/" &&
              currentPath !== "/login" &&
              currentPath !== "/signup" && (
                <Link
                  to="/sell"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Sell
                </Link>
              )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center">
              {isLoggedIn ? (
                /* User Profile */
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
                      style={{
                        backgroundColor: generateBackgroundColor(userName),
                      }}
                    >
                      {getInitials(userName)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-500">View Profile</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                            style={{
                              backgroundColor:
                                generateBackgroundColor(userName),
                            }}
                          >
                            {getInitials(userName)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {userName}
                            </p>
                            <p className="text-sm text-gray-500">{userEmail}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Options */}
                      <div className="py-2">
                        <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors">
                          My Profile
                        </button>
                        <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors">
                          My Listings
                        </button>
                        <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors">
                          Settings
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Sign In / Sign Up Buttons */
                !isAuthPage && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => navigate("/login")}
                      className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate("/signup")}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Join Now
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t border-gray-200 py-4 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Links */}
            <div className="space-y-2 px-2 mb-4">
              {currentPath !== "/buy" &&
                currentPath !== "/" &&
                currentPath !== "/login" &&
                currentPath !== "/signup" && (
                  <Link
                    to="/buy"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Browse Items
                  </Link>
                )}
              {currentPath !== "/sell" &&
                currentPath !== "/" &&
                currentPath !== "/login" &&
                currentPath !== "/signup" && (
                  <Link
                    to="/sell"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Sell Item
                  </Link>
                )}
            </div>

            {/* Mobile Auth Section */}
            {isLoggedIn ? (
              /* Mobile User Profile */
              <div className="border-t border-gray-200 pt-4 px-2">
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{
                      backgroundColor: generateBackgroundColor(userName),
                    }}
                  >
                    {getInitials(userName)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-500">{userEmail}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <button className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    My Profile
                  </button>
                  <button className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    My Listings
                  </button>
                  <button className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              /* Mobile Sign In / Sign Up */
              !isAuthPage && (
                <div className="border-t border-gray-200 pt-4 px-2 space-y-3">
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-gray-600 hover:text-blue-600 border border-gray-300 hover:border-blue-600 rounded-lg transition-colors text-center font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate("/signup");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center font-medium"
                  >
                    Join Now
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default MainHeader;
