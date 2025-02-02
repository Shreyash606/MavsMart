import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Authentication/firebase-config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import MainHeader from "../components/MainHeader";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check for UTA email domain
    if (!email.endsWith("@mavs.uta.edu")) {
      setError("Sign up with your UTA email address only. Please try again.");
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

      // Update user's display name in Firebase
      await updateProfile(user, { displayName: name });

      // Prepare user data for backend
      const userData = {
        uid: user.uid,
        name,
        email,
        phoneNumber,
      };

      console.log("Sending user data to backend:", userData);

      // Save user data in MongoDB via backend API
      const response = await fetch("http://localhost:5000/api/UserData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from backend:", errorData);
        throw new Error(
          errorData.error || "Failed to save user details in the database."
        );
      }

      console.log("User saved in database successfully.");
      setLoading(false);
      navigate("/login");
    } catch (err) {
      setLoading(false);
      console.error("Error during signup:", err);
      setError(err.message || "Failed to sign up. Please try again.");
    }
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

              {error && (
                <div className="text-red-500 text-sm text-center mt-4">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full text-white bg-[#0064b1] hover:bg-[#005599] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>

              <p className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/login")}
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
