// components/ItemCard.jsx
import React, { useState } from "react";
import { auth } from "../Authentication/firebase-config";
import {
  Trash2,
  Mail,
  MessageCircle,
  DollarSign,
  Clock,
  User,
  Tag,
  Heart,
  Share2,
  Eye,
  Star,
} from "lucide-react";

const ItemCard = ({
  item,
  isLoggedIn,
  navigate,
  handleDelete,
  viewMode = "grid",
}) => {
  const [showContact, setShowContact] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const isOwner =
    isLoggedIn && item.uploadedBy === auth.currentUser?.displayName;

  // Determine if this is a "good deal" based on simple heuristics
  const isGoodDeal = item.price < 100 && item.usedDuration?.includes("month");

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-6">
        <div className="flex gap-6">
          {/* Image Section - List View */}
          <div className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden relative">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}

            {imageError ? (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="w-8 h-8 mx-auto mb-1">📦</div>
                  <span className="text-xs">No Image</span>
                </div>
              </div>
            ) : (
              <img
                src={item.photo}
                alt={item.title}
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}

            {isGoodDeal && (
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Great Deal!
              </div>
            )}
          </div>

          {/* Content Section - List View */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
                  {item.title}
                </h3>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    {item.category}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Used: {item.usedDuration}
                  </span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {item.uploadedBy}
                  </span>
                </div>
              </div>

              {/* Actions - List View */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-full transition-colors ${
                    isLiked
                      ? "text-red-500 bg-red-50"
                      : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                  />
                </button>

                {isOwner && (
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {item.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">
                ${item.price.toFixed(2)}
              </div>

              {!showContact ? (
                <button
                  onClick={handleBuyClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      window.open(`mailto:${item.sellerEmail}`, "_self")
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://wa.me/${item.sellerPhone.replace(/\D/g, "")}`,
                        "_blank"
                      )
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      {/* Image Section - Grid View */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {imageError ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 mx-auto mb-2">📦</div>
              <span className="text-sm">No Image Available</span>
            </div>
          </div>
        ) : (
          <img
            src={item.photo}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Overlay Actions */}
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isLiked
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          </button>

          {isOwner && (
            <button
              onClick={() => handleDelete(item._id)}
              className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white backdrop-blur-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          {isGoodDeal && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Great Deal!
            </span>
          )}
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {item.category}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-lg font-bold text-blue-600">
              ${item.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section - Grid View */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 truncate mb-2">
          {item.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
          {item.description}
        </p>

        {/* Item Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Used: {item.usedDuration}
            </span>
            <span className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {item.uploadedBy}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!showContact ? (
            <button
              onClick={handleBuyClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Contact Seller</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  window.open(`mailto:${item.sellerEmail}`, "_self")
                }
                className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://wa.me/${item.sellerPhone.replace(/\D/g, "")}`,
                    "_blank"
                  )
                }
                className="bg-green-600 hover:bg-green-700 text-white py-2.5 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
