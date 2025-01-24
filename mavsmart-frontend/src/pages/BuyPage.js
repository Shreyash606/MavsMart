import React, { useState, useEffect } from "react";
import axios from "axios";
import ItemCard from "../components/itemCard";
import MainHeader from "../components/MainHeader";

const BuyPage = () => {
  const [items, setItems] = useState([]); // To store fetched items
  const [category, setCategory] = useState("All");

  useEffect(() => {
    // Fetch items when the component mounts
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/items"); // Your backend API
        setItems(response.data); // Set the items in state
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  // Filter items based on the selected category
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

        {/* Filter by Category */}
        <div className="mb-4">
          <div>
            <label htmlFor="category" className="block mb-2 font-medium">
              Filter by Category:
            </label>
          </div>

          <div>
            <select
              id="category"
              value={category}
              onChange={handleCategoryChange}
              className="border p-2 rounded bg-[#0064b1] text-white"
            >
              <option value="All">All</option>
              <option value="Laptop">Laptop</option>
              <option value="Phone">Phone</option>
            </select>
          </div>
        </div>

        {/* Display Items */}
        <div className="grid grid-cols-1">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              photo={item.photo}
              title={item.title}
              description={item.description}
              usedDuration={item.usedDuration}
              uploadedBy={item.uploadedBy}
              sold={item.sold}
              price={item.price}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
