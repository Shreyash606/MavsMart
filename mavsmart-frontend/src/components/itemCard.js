// components/ItemCard.jsx
import React, { useState } from "react";
import { auth } from "../Authentication/firebase-config";
import { TrashIcon } from "@heroicons/react/24/outline";

const ItemCard = ({ item, isLoggedIn, navigate, handleDelete }) => {
  const [showContact, setShowContact] = useState(false);

  const imageUrl = item.photo
    ? `https://api.mavsmart.uta.cloud/uploads/${item.photo.filename}`
    : "/placeholder-image.jpg";

  const handleBuyClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setShowContact(true);
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch mb-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
      {/* Product Image */}
      <div className="basis-1/3 flex-shrink-0 overflow-hidden rounded-t-lg md:rounded-s-lg md:rounded-tr-none flex items-center justify-center bg-gray-100">
        <img
          src={item.photo}
          style={{ width: "300px", height: "300px" }}
          alt={item.title}
          className="w-full h-relative object-contain object-center p-1"
          onError={(e) => {
            e.target.src = "";
          }}
        />
      </div>

      {/* Product Details - Now with dynamic height */}
      <div className="flex flex-col md:basis-2/3 justify-between p-4 md:p-6 min-w-0 flex-1 min-h-[200px]">
        <div className="min-w-0">
          <div className="flex justify-between text-xs md:text-sm text-gray-500 gap-2">
            <h5 className="mb-2 text-xl md:text-2xl font-bold text-gray-900 truncate">
              {item.title}
            </h5>
            {/* Delete Button */}
            {isLoggedIn && item.uploadedBy === auth.currentUser.displayName && (
              <TrashIcon
                type="button"
                onClick={() => handleDelete(item._id)} // Call delete handler
                className="w-6 h-6 text-gray-500 hover:text-red-500 cursor-pointer"
              />
            )}
          </div>

          <p className="mb-3 text-sm md:text-base text-gray-600 line-clamp-2 overflow-hidden">
            {item.description}
          </p>
        </div>

        <div className="space-y-3 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <span className="text-lg font-bold text-blue-600 truncate">
              ${item.price.toFixed(2)}
            </span>
            <span className="flex-shrink-0 text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              {item.category}
            </span>
          </div>

          <div className="flex justify-between text-xs md:text-sm text-gray-500 gap-2">
            <span className="truncate">Used: {item.usedDuration}</span>
            <span className="truncate">Seller: {item.uploadedBy}</span>
          </div>

          {/* Conditional Buttons */}
          <div className="transition-all duration-300 flex justify-end">
            {!showContact ? (
              <button
                type="button"
                onClick={handleBuyClick}
                className="text-white w-32 bg-[#0064b1] hover:bg-slate-500 hover:text-black focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
              >
                Buy Now
              </button>
            ) : (
              <div className="flex flex-col">
                <button
                  onClick={() =>
                    window.open(`mailto:${item.sellerEmail}`, "_self")
                  }
                  className="text-white w-32 bg-[#0064b1] hover:bg-slate-500 hover:text-black focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
                >
                  Email
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `http://wa.me/${item.sellerPhone.replace(/\D/g, "")}`,
                      "_blank"
                    )
                  }
                  className="text-white w-32 bg-[#0064b1] hover:bg-slate-500 hover:text-black focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
                >
                  WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
