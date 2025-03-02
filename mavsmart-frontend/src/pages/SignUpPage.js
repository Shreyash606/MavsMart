import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Authentication/firebase-config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import MainHeader from "../components/MainHeader";
import Toast from "../components/Toast";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState([]); // Manage toast notifications

  const navigate = useNavigate();

  // Utility function to handle toast messages
  const showToastMessage = (message, type) => {
    const id = Date.now(); // Unique ID for each toast
    setShowToast((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setShowToast((prevToasts) =>
        prevToasts.filter((toast) => toast.id !== id)
      );
    }, 3000); // Auto-remove after 3 seconds
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check for UTA email domain
    if (!email.endsWith("@mavs.uta.edu")) {
      showToastMessage(
        "Sign up with your UTA email address only. Please try again.",
        "error"
      );
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });

      // Prepare user data for backend
      const userData = {
        uid: user.uid,
        name,
        email,
        phoneNumber,
      };

      // Save user data in MongoDB via backend API
      const response = await fetch("http://localhost:5002/api/UserData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Failed to save user data");

      // Show success toast
      showToastMessage(
        "Your account has been successfully created!",
        "success"
      );

      // Redirect to login after a short delay to let the toast display
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      showToastMessage(err.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader showLoginButton={false} />

      {/* Toast Container */}
      <div className="fixed top-6 right-4 z-50">
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

      <main className="bg-gray-50 flex-grow flex items-center justify-center">
        <div className="w-5/6 bg-white rounded-lg shadow sm:max-w-md xl:p-0">
          <div className="p-6 space-y-6 md:space-y-8 sm:p-8">
            <h1 className="text-2xl font-bold text-center text-gray-900 md:text-3xl">
              Create Account for <span className="text-[#0064b1]">Mavs</span>
              Mart!
            </h1>
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Enter your full name"
                  required
                />
              </div>
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
                  htmlFor="phoneNumber"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="123-456-7890"
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
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
              <div className="flex justify-center">
                <button
                  type="submit"
                  className=" text-white bg-[#0064b1] hover:bg-[#005599] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  disabled={loading}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </div>
              <p className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/buy")}
                  className="font-medium text-[#0064b1] hover:underline cursor-pointer"
                >
                  Log in
                </span>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignupPage;
