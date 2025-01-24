import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../Authentication/firebase-config"; // Import your Firebase Firestore instance
import MainHeader from "../components/MainHeader";

const SellPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  // Simulating login status (replace with actual auth)
  const user = auth.currentUser; // Get the logged-in user
  const isLoggedIn = !!user;

  const [formData, setFormData] = useState({
    category: "",
    photo: "",
    title: "",
    description: "",
    usedDuration: "",
    uploadedBy: user?.displayName || "", // Pre-fill if user has a display name
    price: "",
    sold: false, // Default to unsold
  });

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Submit the form data
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      alert("You must be logged in to sell an item.");
      navigate("/login");
      return;
    }

    try {
      // Save data to Firestore
      await addDoc(collection(db, "items"), {
        ...formData,
        userId: user.uid, // Save user ID for association
        timestamp: new Date(), // Add a timestamp
      });
      console.log("Item successfully added to the database!");
      alert("Item added successfully!");
      navigate("/buy"); // Redirect to buy page after submission
    } catch (error) {
      console.error("Error saving item to database: ", error);
      alert("Failed to add item. Please try again.");
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login"); // Redirect to login if not logged in
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Sell Your Item</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block font-medium mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full"
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Laptop">Laptop</option>
              <option value="Phone">Phone</option>
              <option value="Furniture">Furniture</option>
              <option value="Books">Books</option>
              {/* Add more categories as needed */}
            </select>
          </div>

          {/* Photo */}
          <div>
            <label htmlFor="photo" className="block font-medium mb-2">
              Photo URL
            </label>
            <input
              type="url"
              id="photo"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              required
              placeholder="Enter a URL for the item photo"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter a title for your item"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter a detailed description"
              className="border p-2 rounded w-full"
              rows="3"
            ></textarea>
          </div>

          {/* Used Duration */}
          <div>
            <label htmlFor="usedDuration" className="block font-medium mb-2">
              Used For
            </label>
            <input
              type="text"
              id="usedDuration"
              name="usedDuration"
              value={formData.usedDuration}
              onChange={handleChange}
              required
              placeholder="e.g., 6 months, 1 year"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Uploaded By */}
          <div>
            <label htmlFor="uploadedBy" className="block font-medium mb-2">
              Uploaded By
            </label>
            <input
              type="text"
              id="uploadedBy"
              name="uploadedBy"
              value={formData.uploadedBy}
              onChange={handleChange}
              required
              placeholder="Your name"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Sold */}
          <div>
            <label className="block font-medium mb-2">Is the item sold?</label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="sold"
                checked={formData.sold}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="ml-2">Mark as sold</span>
            </label>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block font-medium mb-2">
              Price (in $)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="Enter the price"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
            >
              Submit Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellPage;
