import React from "react";
import { useNavigate } from "react-router-dom";

const ItemCard = ({
  photo,
  title,
  description,
  usedDuration,
  uploadedBy,
  sold,
  price,
  isLoggedIn, // Pass this prop to determine login status
  itemId, // Pass a unique ID for the item
}) => {
  const navigate = useNavigate();

  const handleBuy = () => {
    if (!isLoggedIn) {
      // Redirect to login with a return path to this item's detail page
      navigate("/login", { state: { returnTo: `/details/${itemId}` } });
    } else {
      // Redirect to the item's details page
      navigate(`/details/${itemId}`);
    }
  };

  return (
    <div className="flex bg-white border border-gray-200 rounded-lg shadow mb-5">
      {/* Image Section */}
      <div className="w-1/3 p-4 flex-shrink-0">
        <img
          className="h-64 w-full object-cover rounded-l-lg"
          src={photo}
          alt={title}
        />
      </div>

      {/* Data Section */}
      <div className="w-2/3 p-4">
        <h5 className="text-xl font-semibold tracking-tight text-gray-900">
          {title}
        </h5>
        <p className="text-gray-500 text-sm mt-1">{description}</p>
        <p className="text-gray-500 text-sm mt-1">Used: {usedDuration}</p>
        <p className="text-gray-500 text-sm mt-1">Seller: {uploadedBy}</p>
        <p
          className={`mt-2 font-bold ${
            sold ? "text-red-500" : "text-green-500"
          }`}
        >
          {sold ? "Sold" : "Unsold"}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-gray-900">${price}</span>
          <span className="text-sm font-semibold text-500">( Negotiable )</span>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={handleBuy}
            className="mt-3 w-1/6 bg-[#0064b1] text-white py-2 rounded hover:bg-blue-800"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
