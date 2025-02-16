import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import MainHeader from "../components/MainHeader";
import Toast from "../components/Toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState([]); // Toast state
  const navigate = useNavigate();

  // Utility function for displaying toast messages
  const showToastMessage = (message, type) => {
    const id = Date.now(); // Unique ID for each toastz
    setShowToast((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setShowToast((prevToasts) =>
        prevToasts.filter((toast) => toast.id !== id)
      );
    }, 3000); // Remove toast after 3 seconds
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading spinner

    // Check if the email is from the allowed domain
    if (!email.endsWith("@mavs.uta.edu")) {
      showToastMessage(
        "Login with your UTA email address only. Please try again.",
        "error"
      );
      setLoading(false);
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Store user info securely (use sessionStorage for session-based storage)
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("token", user.accessToken);

      showToastMessage(
        "Login successful! Welcome back to MavsMart.",
        "success"
      );

      // Navigate to Buy page after successful login
      setTimeout(() => navigate("/buy"), 2000);
    } catch (error) {
      const errorMessage =
        error.code === "auth/wrong-password"
          ? "Incorrect password. Please try again."
          : error.code === "auth/user-not-found"
          ? "No account found with this email."
          : "Failed to log in. Please check your credentials.";

      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen flex flex-col">
      <MainHeader showLoginButton={false} />

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50">
        {showToast.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() =>
              setShowToast((prevToasts) =>
                prevToasts.filter((t) => t.id !== toast.id)
              )
            }
          />
        ))}
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="w-5/6 bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0">
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
                  autoComplete="email"
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
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* Login button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="text-white bg-[#0064b1] hover:bg-[#005599] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>

              <p className="text-sm text-center text-gray-500">
                Don’t have an account yet?{" "}
                <span
                  onClick={() => navigate("/signup")}
                  className="font-medium text-[#0064b1] hover:underline cursor-pointer"
                >
                  Sign up
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
