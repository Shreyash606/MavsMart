import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Shield,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  ShoppingBag,
} from "lucide-react";
import MainHeader from "../components/MainHeader"; // Import your MainHeader component

const RevampedLandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Transactions",
      description:
        "Your purchases are protected with industry-standard security",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Trusted Community",
      description:
        "Join thousands of Mavericks buying and selling with confidence",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Best Prices",
      description: "Find great deals or earn more from your sales",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      text: "Found exactly what I needed at an amazing price. Super easy to use!",
    },
    {
      name: "Mike R.",
      rating: 5,
      text: "Sold my textbooks in minutes. The process couldn't be simpler.",
    },
    {
      name: "Jessica L.",
      rating: 5,
      text: "Love supporting fellow Mavericks. Great community marketplace!",
    },
  ];

  // Navigation handlers
  const handleStartShopping = () => {
    navigate("/buy");
  };

  const handleListItem = () => {
    navigate("/sell");
  };

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleBrowseItems = () => {
    navigate("/buy");
  };

  const handleSellItem = () => {
    navigate("/sell");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Use MainHeader component instead of duplicate header */}
      <MainHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className={`space-y-6 ${
              isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 mr-1" />
              Trusted by 10,000+ Mavericks
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              The Marketplace
              <span className="block text-blue-600">Made for Mavericks</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Buy and sell with confidence in UTA's most trusted student
              marketplace. From textbooks to tech, furniture to fashion – find
              what you need or turn your items into cash.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartShopping}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Start Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={handleListItem}
                className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
              >
                List Your Item
              </button>
            </div>

            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-600">Items Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.9★</div>
                <div className="text-sm text-gray-600">User Rating</div>
              </div>
            </div>
          </div>

          <div
            className={`relative ${
              isVisible ? "animate-fade-in-right" : "opacity-0"
            }`}
          >
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl p-8 transform rotate-3 shadow-2xl">
              <div className="bg-white rounded-2xl p-6 transform -rotate-3">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">
                      Popular Items
                    </h3>
                    <button
                      onClick={handleBrowseItems}
                      className="text-blue-600 text-sm hover:text-blue-700 transition-colors"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {[
                      "MacBook Pro - $899",
                      "Calculus Textbook - $45",
                      "Mini Fridge - $120",
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={handleBrowseItems}
                      >
                        <span className="text-gray-700">{item}</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose MavsMart?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've built the safest, easiest way for UTA students to buy and
              sell
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Mavericks Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">
                  - {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join the MavsMart Community?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Start buying and selling today. It's free to join and takes less
            than 2 minutes.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingBag className="w-6 h-6" />
                <span className="text-xl font-bold">MavsMart</span>
              </div>
              <p className="text-gray-400">
                The trusted marketplace for UTA Mavericks
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Marketplace</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={handleBrowseItems}
                    className="hover:text-white transition text-left"
                  >
                    Browse Items
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleSellItem}
                    className="hover:text-white transition text-left"
                  >
                    Sell Item
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleBrowseItems}
                    className="hover:text-white transition text-left"
                  >
                    Categories
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button className="hover:text-white transition text-left">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition text-left">
                    Safety Tips
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition text-left">
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button className="hover:text-white transition text-left">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition text-left">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition text-left">
                    Community Guidelines
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MavsMart. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
};

export default RevampedLandingPage;
