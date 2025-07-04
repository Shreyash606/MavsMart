import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  ShoppingBag,
  Package,
  AlertCircle,
} from "lucide-react";
import ItemCard from "../components/itemCard";
import MainHeader from "../components/MainHeader";
import Toast from "../components/Toast";
import Spinner from "../components/Spinner";

const BuyPage = () => {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();

  const categories = [
    { value: "All", label: "All Categories", icon: "📦" },
    { value: "Laptop", label: "Laptops", icon: "💻" },
    { value: "Phone", label: "Phones", icon: "📱" },
    { value: "Furniture", label: "Furniture", icon: "🪑" },
    { value: "Books", label: "Books", icon: "📚" },
    { value: "Clothing", label: "Clothing", icon: "👕" },
    { value: "Others", label: "Others", icon: "🔧" },
  ];

  const showToastMessage = (message, type) => {
    const id = Date.now();
    setShowToast((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setShowToast((prevToasts) =>
        prevToasts.filter((toast) => toast.id !== id)
      );
    }, 3000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        fetchItems(user);
      } else {
        setIsLoggedIn(false);
        setItems([]);
        setLoading(false);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchItems = async (user) => {
    try {
      setLoading(true);
      const token = await user.getIdToken();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const ItemsData = await axios.get(
        "https://api.mavsmart.uta.cloud/api/items",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const UserData = await axios.get(
        "https://api.mavsmart.uta.cloud/api/UserData",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("UserData:", UserData.data);

      const combinedData = ItemsData.data.map((item) => {
        const seller = UserData.data.find((user) => user.uid === item.userId);
        return {
          ...item,
          sellerEmail: seller?.email || "N/A",
          sellerPhone: seller?.phoneNumber || "N/A",
        };
      });

      console.log("Combined Data:", combinedData);
      setItems(combinedData);
    } catch (error) {
      console.error("Error fetching data:", error.response || error.message);
      setError("Failed to fetch items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  const handleDelete = async (itemId) => {
    try {
      const token = await auth.currentUser.getIdToken();

      const response = await axios.delete(
        `https://api.mavsmart.uta.cloud/api/items/${itemId}`,
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

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      category === "All" ||
      item.category.toLowerCase().includes(category.toLowerCase());
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const EmptyState = ({ title, description, icon }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md">{description}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">Loading amazing deals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MainHeader />

      {/* Toast Messages */}
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

      {/* Main Container with proper padding for small screens */}
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600" />
                Marketplace
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Discover great deals from fellow Mavericks
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {items.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Total Items
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {filteredItems.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="text-red-700 text-sm sm:text-base">{error}</span>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills - Responsive scrolling on mobile */}
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-3 sm:mt-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                  category === cat.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid/List - Fixed responsive grid */}
        {filteredItems.length > 0 ? (
          <div
            className={`grid gap-3 sm:gap-4 lg:gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {filteredItems.map((item) => (
              <div key={item._id} className="w-full min-w-0">
                <ItemCard
                  item={item}
                  isLoggedIn={isLoggedIn}
                  navigate={navigate}
                  handleDelete={handleDelete}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm">
            {searchTerm || category !== "All" ? (
              <EmptyState
                icon="🔍"
                title="No items found"
                description={`No items match your search${
                  category !== "All" ? ` in ${category}` : ""
                }. Try adjusting your filters or search terms.`}
              />
            ) : (
              <EmptyState
                icon="📦"
                title="No items available"
                description="Be the first one to list an item! Other Mavericks are waiting for great deals."
              />
            )}
          </div>
        )}

        {/* Quick Actions - Responsive positioning */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6">
          <button
            onClick={() => navigate("/sell")}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            title="Sell an item"
          >
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Bottom padding to account for fixed button */}
        <div className="h-20 sm:h-24"></div>
      </div>
    </div>
  );
};

export default BuyPage;
