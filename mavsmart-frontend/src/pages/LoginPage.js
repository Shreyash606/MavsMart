import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingHeader from "../components/MainHeader";
import MainHeader from "../components/MainHeader";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // For showing error messages
  const navigate = useNavigate();

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    // Clear previous error messages
    setErrorMessage("");

    // Simulate an API call to authenticate the user
    try {
      // Example: replace with real API call
      const response = await fetch("https://your-backend-api.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming the API returns a token or a success status
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", data.token); // Save the token for further requests
        navigate("/buy"); // Redirect to the buy page after login
      } else {
        // If credentials are invalid or there's an error from the server
        setErrorMessage(
          data.message || "Invalid credentials. Please try again."
        );
      }
    } catch (error) {
      // Handle network errors or any issues with the API call
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen flex flex-col">
      <MainHeader showLoginButton={false} />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0">
          <div className="p-6 space-y-6 md:space-y-8 sm:p-8">
            <h1 className="text-2xl font-bold text-center text-gray-900 md:text-3xl">
              Welcome Back to <span className="text-[#0064b1]">Mavs</span>Mart!
            </h1>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Display error message if login fails */}
              {errorMessage && (
                <div className="text-red-500 text-sm text-center mt-4">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full text-white bg-[#0064b1] hover:bg-[#0064b1]-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Sign In
              </button>

              <p className="text-sm text-center text-gray-500">
                Don’t have an account yet?{" "}
                <a
                  onClick={() => navigate("/signup")}
                  className="font-medium text-[#0064b1] hover:underline cursor-pointer"
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
