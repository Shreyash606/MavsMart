import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ItemCard from "../components/itemCard";
import MainHeader from "../components/MainHeader";

const BuyPage = () => {
  const [items, setItems] = useState([]); // Items fetched from the database
  const [category, setCategory] = useState("All"); // Filter by category
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Check if user is logged in
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error message
  const navigate = useNavigate();
  const auth = getAuth();

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
      const token = await user.getIdToken(); // Get Firebase token
      const response = await axios.get("http://localhost:5000/api/items", {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token in the header
        },
      });
      setItems(response.data); // Update state with fetched items
    } catch (error) {
      console.error("Error fetching items:", error);
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

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Buy Items</h1>

        {/* Error Message */}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Loading State */}
        {loading ? (
          <div className="text-center">Loading items...</div>
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
