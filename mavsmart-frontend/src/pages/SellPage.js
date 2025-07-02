import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { 
  Upload, 
  DollarSign, 
  Tag, 
  FileText, 
  Clock, 
  Camera, 
  Package,
  CheckCircle,
  AlertCircle,
  X,
  ArrowLeft
} from "lucide-react";
import MainHeader from "../components/MainHeader";
import Toast from "../components/Toast";
import Spinner from "../components/Spinner";

const SellPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(undefined);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    usedDuration: "",
    price: "",
    sold: false,
    photo: null,
    photoPreview: null,
  });
  const [showToast, setShowToast] = useState([]);

  const categories = [
    { value: "Laptop", label: "Laptops", icon: "💻", description: "MacBooks, PCs, Gaming laptops" },
    { value: "Phone", label: "Phones & Tablets", icon: "📱", description: "iPhones, Android, iPads" },
    { value: "Furniture", label: "Furniture", icon: "🪑", description: "Desks, chairs, storage" },
    { value: "Books", label: "Textbooks", icon: "📚", description: "Course materials, novels" },
    { value: "Clothing", label: "Clothing", icon: "👕", description: "Shirts, shoes, accessories" },
    { value: "Others", label: "Other Items", icon: "🔧", description: "Everything else" }
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser === null) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  if (user === undefined) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];

      if (!file) {
        setFormData((prev) => ({
          ...prev,
          photo: null,
          photoPreview: null,
        }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        showToastMessage("Please upload an image file", "error");
        e.target.value = "";
        setFormData((prev) => ({
          ...prev,
          photo: null,
          photoPreview: null,
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToastMessage("File size must be less than 5MB", "error");
        e.target.value = "";
        setFormData((prev) => ({
          ...prev,
          photo: null,
          photoPreview: null,
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: file,
        photoPreview: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.category ||
      !formData.title ||
      !formData.description ||
      !formData.usedDuration ||
      !formData.price
    ) {
      showToastMessage("Please fill in all required fields", "error");
      return;
    }

    if (!user) {
      showToastMessage("You must be logged in to sell an item", "error");
      navigate("/login");
      return;
    }

    if (!formData.photo) {
      showToastMessage("Please upload a product photo", "error");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("category", formData.category);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("usedDuration", formData.usedDuration);
      formDataToSend.append("uploadedBy", user.displayName);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("sold", formData.sold);
      if (formData.photo) {
        formDataToSend.append("photo", formData.photo);
      }

      const token = await user.getIdToken();

      const response = await fetch("https://api.mavsmart.uta.cloud/api/items", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const responseData = await response.json();
      console.log("Response Data:", responseData);

      showToastMessage("Item added successfully!", "success");
      setTimeout(() => {
        navigate("/buy");
      }, 2000);
    } catch (error) {
      console.error("Error submitting item:", error);
      showToastMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedStep1 = formData.category && formData.title;
  const canProceedStep2 = formData.description && formData.usedDuration;
  const canSubmit = formData.price && formData.photo;

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm ${
            step === currentStep 
              ? 'bg-blue-600 text-white' 
              : step < currentStep 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-600'
          }`}>
            {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">What are you selling?</h2>
        <p className="text-gray-600">Choose a category and give your item a great title</p>
      </div>

      {/* Category Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          <Tag className="inline w-4 h-4 mr-1" />
          Category *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.value}
              onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                formData.category === cat.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center space-y-2">
                <div className="text-2xl">{cat.icon}</div>
                <div className="font-medium text-sm">{cat.label}</div>
                <div className="text-xs text-gray-500">{cat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          <FileText className="inline w-4 h-4 mr-1" />
          Item Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., MacBook Pro 13-inch 2022, hardly used"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500">Make it descriptive and specific to attract buyers</p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Tell us more details</h2>
        <p className="text-gray-600">Provide a detailed description and usage information</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          <FileText className="inline w-4 h-4 mr-1" />
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="5"
          placeholder="Describe your item's condition, features, and any defects. Be honest and detailed!"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500">
          {formData.description.length}/500 characters - More details = more interest!
        </p>
      </div>

      {/* Used Duration */}
      <div className="space-y-2">
        <label htmlFor="usedDuration" className="block text-sm font-medium text-gray-700">
          <Clock className="inline w-4 h-4 mr-1" />
          How long have you used it? *
        </label>
        <input
          type="text"
          id="usedDuration"
          name="usedDuration"
          value={formData.usedDuration}
          onChange={handleChange}
          placeholder="e.g., 6 months, 1 year, barely used, brand new"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Add photo and price</h2>
        <p className="text-gray-600">A good photo and fair price will help sell faster</p>
      </div>

      {/* Photo Upload */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          <Camera className="inline w-4 h-4 mr-1" />
          Item Photo *
        </label>
        
        {!formData.photoPreview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            <label htmlFor="photo" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">Upload a photo</p>
              <p className="text-sm text-gray-500">
                Click to browse or drag and drop<br />
                JPG, PNG up to 5MB
              </p>
            </label>
          </div>
        ) : (
          <div className="relative">
            <img
              src={formData.photoPreview}
              alt="Preview"
              className="w-full max-w-md mx-auto rounded-xl shadow-lg"
            />
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, photo: null, photoPreview: null }));
                document.getElementById('photo').value = '';
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mt-3">
              <label htmlFor="photo" className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm">
                Change photo
              </label>
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* Price Input */}
      <div className="space-y-2">
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          <DollarSign className="inline w-4 h-4 mr-1" />
          Price (USD) *
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="1"
            placeholder="0"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
          />
        </div>
        <p className="text-xs text-gray-500">
          Research similar items to set a competitive price
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Publishing your item...</p>
            <p className="text-sm text-gray-500">This may take a few seconds</p>
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

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sell Your Item</h1>
          </div>
          <p className="text-gray-600">
            Turn your unused items into cash. It's quick, easy, and secure!
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={currentStep === 1 ? () => navigate('/buy') : prevStep}
                className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep === 1 ? 'Back to Browse' : 'Previous'}
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2)
                  }
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Publish Item
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Tips for a successful sale
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use clear, well-lit photos showing the item from multiple angles</li>
            <li>• Write detailed descriptions and be honest about condition</li>
            <li>• Research similar items to price competitively</li>
            <li>• Respond quickly to interested buyers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SellPage;