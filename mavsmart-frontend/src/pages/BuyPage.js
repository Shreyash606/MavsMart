import React, { useState, useEffect } from "react";
import MainHeader from "../components/MainHeader";
import ItemCard from "../components/itemCard";
import { useNavigate } from "react-router-dom";

const BuyPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Assuming you have a way to check login status
  const [items, setItems] = useState([
    {
      id: 1,
      image: "https://via.placeholder.com/150",
      title: "Item 1",
      description: "Description for Item 1",
      sellerInfo: { name: "Seller 1", contact: "seller1@email.com" },
    },
    {
      id: 2,
      image: "https://via.placeholder.com/150",
      title: "Item 2",
      description: "Description for Item 2",
      sellerInfo: { name: "Seller 2", contact: "seller2@email.com" },
    },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock check for login status (use your actual logic here)
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedInStatus);
  }, []);

  const handleBuy = (itemId) => {
    console.log(`Buy item with ID: ${itemId}`);
    // After login logic, you can handle the item buying action here
  };

  return (
    <div>
      <MainHeader />
      <main className="container mx-auto mt-10">
        <h1 className="text-3xl font-bold">Items for Sale</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              image={item.image}
              title={item.title}
              description={item.description}
              onBuy={() => handleBuy(item.id)}
              sellerInfo={item.sellerInfo}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default BuyPage;
