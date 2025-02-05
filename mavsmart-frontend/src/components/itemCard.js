// components/ItemCard.jsx
import React from "react";

const ItemCard = ({ item, isLoggedIn, navigate }) => {
  // Construct image URL based on backend structure
  const imageUrl = item.photo
    ? `http://localhost:5002/uploads/${item.photo}`
    : "/placeholder-image.jpg";

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      {/* Product Image */}
      <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "mavsmart-frontend/src/fallback.png"; // Fallback for broken images
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
      </div>
    </div>
  );
};

export default ItemCard;
