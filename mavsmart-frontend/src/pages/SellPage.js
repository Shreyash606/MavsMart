import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import MainHeader from "../components/MainHeader";
import Toast from "../components/Toast";

const SellPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [user, setUser] = useState(null); // Store user state
  const [formData, setFormData] = useState({
    category: "",
    photo: "",
    title: "",
    description: "",
    usedDuration: "",
    uploadedBy: "",
    price: "",
    sold: false, // Default to unsold
  });
  const [showToast, setShowToast] = useState([]);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update user state
      if (!currentUser) {
        navigate("/login"); // Redirect to login if not logged in
      }
    });

    return () => unsubscribe(); // Clean up the listener
  }, [auth, navigate]);

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData({
        ...formData,
        [name]: files[0], // Store the file object
        photoPreview: files[0] ? URL.createObjectURL(files[0]) : null, // Generate preview URL
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const showToastMessage = (message, type) => {
    const id = Date.now(); // Unique ID for each toast
    setShowToast((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setShowToast((prevToasts) =>
        prevToasts.filter((toast) => toast.id !== id)
      );
    }, 3000);
  };

  // When submitting the form:
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to sell an item.");
      navigate("/login");
      return;
    }

    try {
      let imageUrl = null;

      if (formData.photo) {
        imageUrl = formData.photo; // Assign the photo directly or a valid URL
      }

      // Match backend field names
      const itemData = {
        title: formData.title, // Map title to name
        description: formData.description,
        price: parseFloat(formData.price), // Ensure price is a number
        category: formData.category,
        photo: formData.photo || null,
        // sold: formData.sold || false, // Default to false if not provided
      };

      console.log("Submitting itemData:", itemData);

      const token = await user.getIdToken();
      const response = await fetch("http://localhost:5000/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Firebase token
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from backend:", errorData);
        throw new Error(
          errorData.error || "Failed to submit the item. Please try again."
        );
      }

      showToastMessage("Item added successfully!", "success");
      navigate("/buy");
    } catch (error) {
      console.error("Error submitting item:", error);
      showToastMessage(error.message, "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
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
            </select>
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
              id="uploadedBy"
              name="uploadedBy"
              value={formData.uploadedBy}
              onChange={handleChange}
              required
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
