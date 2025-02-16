import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import MainHeader from "../components/MainHeader";
import Toast from "../components/Toast";
import Spinner from "../components/Spinner";

const SellPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(false); // Track submission process

  const [user, setUser] = useState(null); // Store user state
  const [formData, setFormData] = useState({
    category: "",

    title: "",
    description: "",
    usedDuration: "",
    uploadedBy: "",
    price: "",
    sold: false, // Default to unsold
    photo: null,
    photoPreview: null,
  });
  const [showToast, setShowToast] = useState([]);

  const showToastMessage = (message, type) => {
    const id = Date.now(); // Unique ID for each toast
    setShowToast((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setShowToast((prevToasts) =>
        prevToasts.filter((toast) => toast.id !== id)
      );
    }, 3000);
  };

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
      const file = files[0];

      // Immediately return if no file selected
      if (!file) {
        setFormData((prev) => ({
          ...prev,
          photo: null,
          photoPreview: null,
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        showToastMessage("Please upload an image file", "error");
        e.target.value = ""; // Clear the file input
        setFormData((prev) => ({
          ...prev,
          photo: null,
          photoPreview: null,
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showToastMessage("File size must be less than 5MB", "error");
        e.target.value = ""; // Clear the file input
        setFormData((prev) => ({
          ...prev,
          photo: null,
          photoPreview: null,
        }));
        return;
      }

      // Update state with valid file
      setFormData((prev) => ({
        ...prev,
        [name]: file,
        photoPreview: URL.createObjectURL(file),
      }));
    } else {
      // Handle non-file inputs
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // When submitting the form:
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation for required fields
    if (
      !formData.category ||
      !formData.title ||
      !formData.description ||
      !formData.usedDuration ||
      !formData.price
    ) {
      showToastMessage("Please fill in all required fields", "error");
      return;
    }

    if (!user) {
      alert("You must be logged in to sell an item.");
      navigate("/login");
      return;
    }
    if (!formData.photo) {
      showToastMessage("Please upload a product photo", "error");
      return;
    }

    setLoading(true); // Start loading spinner

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("category", formData.category);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("usedDuration", formData.usedDuration);
      // Set uploadedBy to user's display name or email
      formDataToSend.append("uploadedBy", user.displayName);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("sold", formData.sold);
      if (formData.photo) {
        formDataToSend.append("photo", formData.photo);
      }

      // Log FormData entries for debugging
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      const token = await user.getIdToken();
      const response = await fetch("https://44.203.114.198:5002/api/items", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from backend:", errorData);
        throw new Error(
          errorData.error || "Failed to submit the item. Please try again."
        );
      }

      showToastMessage("Item added successfully!", "success");
      setTimeout(() => {
        navigate("/buy");
      }, 2000);
    } catch (error) {
      console.error("Error submitting item:", error);
      showToastMessage(error.message, "error");
    } finally {
      setLoading(false); // Stop loading spinner
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
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Spinner /> {/* Replace this with your spinner component */}
        </div>
      ) : (
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
                <option value="Clothing">Clothing</option>
                <option value="Others">Others</option>
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
            {/* Photo Upload */}
            <div>
              <label htmlFor="photo" className="block font-medium mb-2">
                Item Photo
              </label>
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              {formData.photoPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Preview:</p>
                  <img
                    src={formData.photoPreview}
                    alt="Preview"
                    className="max-w-[200px] h-auto rounded-lg"
                  />
                </div>
              )}
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

            {/* Uploaded By 
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
          </div> */}

            {/* Sold */}
            <div>
              <label className="block font-medium mb-2">
                Is the item sold?
              </label>
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
      )}
    </div>
  );
};

export default SellPage;
