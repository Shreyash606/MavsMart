import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setLoading(true);
    // Add signup logic here (e.g., API call)

    // Simulate a successful signup
    setTimeout(() => {
      setLoading(false);
      navigate("/login"); // Redirect to login page after successful signup
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader showLoginButton={false} />
      <main className="bg-gray-50 flex-grow flex items-center justify-center">
        <div className="w-full bg-white rounded-lg shadow sm:max-w-md xl:p-0">
          <div className="p-6 space-y-6 md:space-y-8 sm:p-8">
            <h1 className="text-2xl font-bold text-center text-gray-900 md:text-3xl">
              Create Account for <span className="text-[#0064b1]">Mavs</span>
              Mart!
            </h1>
            <form onSubmit={handleSignup} className="space-y-6">
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

              {/* Display error message if signup fails */}
              {error && (
                <div className="text-red-500 text-sm text-center mt-4">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full text-white bg-[#0064b1] hover:bg-[#0064b1]-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>

              <p className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <a
                  onClick={() => navigate("/login")}
                  className="font-medium text-[#0064b1] hover:underline cursor-pointer"
                >
                  Log in
                </a>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignupPage;
