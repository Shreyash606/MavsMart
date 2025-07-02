import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  ShoppingBag,
  Shield,
  Users,
} from "lucide-react";
import MainHeader from "../components/MainHeader";
import Toast from "../components/Toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState([]); // Toast state
  const navigate = useNavigate();

  // Utility function for displaying toast messages
  const showToastMessage = (message, type) => {
    const id = Date.now(); // Unique ID for each toast
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
        "Login with your mavs.uta.edu email address only. Please try again.",
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
      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      // Store user info securely (use sessionStorage for session-based storage)
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("token", idToken);

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

  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Secure & Safe",
      description: "Your data is protected with enterprise-grade security",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Trusted Community",
      description: "Verified UTA students buying and selling safely",
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: "Easy Trading",
      description: "Simple, fast, and hassle-free marketplace experience",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
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

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Welcome Content */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-800">
                  MavsMart
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Welcome Back to the
                <span className="block text-blue-600">
                  Maverick Marketplace
                </span>
              </h1>
              <p className="text-lg text-gray-600">
                Join thousands of UTA students buying and selling with
                confidence. Your trusted campus marketplace is just a login
                away.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-white/50 rounded-xl"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">50K+</div>
                <div className="text-sm text-gray-600">Items Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">4.9★</div>
                <div className="text-sm text-gray-600">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
              {/* Mobile Header */}
              <div className="lg:hidden text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                  <span className="text-xl font-bold text-gray-800">
                    MavsMart
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome Back!
                </h1>
                <p className="text-gray-600">Sign in to your account</p>
              </div>

              {/* Desktop Header */}
              <div className="hidden lg:block text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                <p className="text-gray-600">Access your MavsMart account</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="your.email@mavs.uta.edu"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Must be a valid @mavs.uta.edu email address
                  </p>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      New to MavsMart?
                    </span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Create Account
                </button>
              </form>

              {/* Help Text */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
