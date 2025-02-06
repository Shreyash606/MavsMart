// components/ItemCard.jsx
import React, { useState } from "react";

const ItemCard = ({ item, isLoggedIn, navigate }) => {
  const [showContact, setShowContact] = useState(false);
  const imageUrl = item.photo
    ? `http://localhost:5002/uploads/${item.photo.filename}`
    : "/placeholder-image.jpg";

  const handleBuyClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setShowContact(true);
  };

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-md hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/fallback.png";
          }}
        />
      </div>

      {/* Product Details */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold truncate">{item.title}</h3>
        <p className="text-gray-600 line-clamp-2 min-h-[3em]">
          {item.description}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600">
            ${item.price.toFixed(2)}
          </span>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {item.category}
          </span>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <span>Used: {item.usedDuration}</span>
          <span>Seller: {item.uploadedBy}</span>
        </div>

        {/* Conditional Buttons */}
        {!showContact ? (
          <button
            onClick={handleBuyClick}
            className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
          >
            Buy Now
          </button>
        ) : (
          <div className="mt-4 space-y-2">
            {/* Email */}
            <div className="w-full bg-gray-100 p-2 rounded text-center">
              <a
                href={`mailto:${item.sellerEmail}`}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Email: {item.sellerEmail}
              </a>
            </div>

            {/* WhatsApp */}
            <div className="w-full bg-gray-100 p-2 rounded text-center">
              <a
                href={`https://wa.me/${item.sellerPhone.replace(/\D/g, "")}`} // Remove non-numeric characters
                className="text-green-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp: {item.sellerPhone}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
