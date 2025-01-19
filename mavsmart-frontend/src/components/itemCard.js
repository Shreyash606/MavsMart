import React from "react";
import { useNavigate } from "react-router-dom";

const ItemCard = ({ image, title, description, onBuy, sellerInfo, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleContactSeller = () => {
    // Add logic to contact the seller (e.g., show seller details or open a contact form)
    alert(`Contacting ${sellerInfo.name}...`);
  };

  const handleBuy = () => {
    if (isLoggedIn) {
      onBuy();
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="border p-4 rounded-md shadow-sm">
      <img src={image} alt={title} className="mb-2 rounded" />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
      <button
        onClick={handleBuy}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
      >
        Buy
      </button>
      {isLoggedIn && (
        <button
          onClick={handleContactSeller}
          className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Contact Seller
        </button>
      )}
    </div>
  );
};

export default ItemCard;
