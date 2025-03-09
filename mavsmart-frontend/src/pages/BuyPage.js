import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ItemCard from "../components/itemCard";
import MainHeader from "../components/MainHeader";
import Toast from "../components/Toast";
import Spinner from "../components/Spinner";

const BuyPage = () => {
  const [items, setItems] = useState([]); // Items fetched from the database

  const [category, setCategory] = useState("All"); // Filter by category
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Check if user is logged in
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error message
  const [showToast, setShowToast] = useState([]); // Toast state
  const navigate = useNavigate();
  const auth = getAuth();

  const showToastMessage = (message, type) => {
    const id = Date.now(); // Unique ID for each toast
    setShowToast((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setShowToast((prevToasts) =>
        prevToasts.filter((toast) => toast.id !== id)
      );
    }, 3000);
  };

  useEffect(() => {
    // Check user login status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        fetchItems(user); // Fetch items when user is logged in
      } else {
        setIsLoggedIn(false);
        setItems([]); // Clear items if logged out
        setLoading(false);

        navigate("/login"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe(); // Clean up the listener
  }, [auth, navigate]);

  const fetchItems = async (user) => {
    try {
      setLoading(true);
      const token = await user.getIdToken(); // Get Firebase token

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch items

      const ItemsData = await axios.get(
        "https://mavsmart.uta.cloud/api/items",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch all user data
      const UserData = await axios.get(
        "https://mavsmart.uta.cloud/api/UserData",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("UserData:", UserData.data);

      // Combine items and user data
      const combinedData = ItemsData.data.map((item) => {
        const seller = UserData.data.find((user) => user.uid === item.userId); // Match `uid` with `uploadedBy`
        return {
          ...item,
          sellerEmail: seller?.email || "N/A", // Add seller's email
          sellerPhone: seller?.phoneNumber || "N/A", // Add seller's phone number
        };
      });

      console.log("Combined Data:", combinedData); // Debug: Check combined data
      setItems(combinedData); // Update state
    } catch (error) {
      console.error("Error fetching data:", error.response || error.message);
      setError("Failed to fetch items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value); // Update selected category
  };

  // Filter items by category
  const filteredItems =
    category === "All"
      ? items
      : items.filter((item) =>
          item.category.toLowerCase().includes(category.toLowerCase())
        );

  const handleDelete = async (itemId) => {
    try {
      const token = await auth.currentUser.getIdToken();

      const response = await axios.delete(
        `https://mavsmart.uta.cloud/api/items/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        showToastMessage("Item deleted successfully!", "success");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      showToastMessage("Failed to delete the item. Please try again.", "error");
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
        <h1 className="text-2xl font-bold mb-4">Buy Items</h1>

        {/* Error Message */}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner /> {/* Display Spinner while loading */}
          </div>
        ) : (
          <>
            {/* Filter by Category */}
            <div className="mb-4">
              <label htmlFor="category" className="block mb-2 font-medium">
                Filter by Category:
              </label>
              <select
                id="category"
                value={category}
                onChange={handleCategoryChange}
                className="border p-2 rounded bg-[#0064b1] text-white"
              >
                <option value="All">All</option>
                <option value="Laptop">Laptop</option>
                <option value="Phone">Phone</option>
                <option value="Furniture">Furniture</option>
                <option value="Books">Books</option>
                <option value="Clothing">Clothing</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Display Items */}
            <div className="grid grid-cols-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <ItemCard
                    key={item._id} // Use `_id` as the unique identifier from MongoDB
                    item={item}
                    isLoggedIn={isLoggedIn}
                    navigate={navigate} // Pass navigate for redirection
                    handleDelete={handleDelete} // Pass delete handler
                  />
                ))
              ) : (
                <div className="text-center text-gray-500">No items found.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuyPage;
