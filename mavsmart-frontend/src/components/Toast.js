import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

const Toast = ({
  id,
  message,
  type = "info",
  onClose,
  duration = 3000,
  position = "top-right",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  // Auto-dismiss functionality
  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (duration / 100);
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    // Auto-dismiss timer
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
      clearInterval(progressTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  // Icon configuration
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  // Color schemes
  const colorSchemes = {
    success: {
      bg: "bg-white border-l-4 border-green-500",
      icon: "text-green-500 bg-green-50",
      text: "text-gray-800",
      progress: "bg-green-500",
    },
    error: {
      bg: "bg-white border-l-4 border-red-500",
      icon: "text-red-500 bg-red-50",
      text: "text-gray-800",
      progress: "bg-red-500",
    },
    warning: {
      bg: "bg-white border-l-4 border-yellow-500",
      icon: "text-yellow-600 bg-yellow-50",
      text: "text-gray-800",
      progress: "bg-yellow-500",
    },
    info: {
      bg: "bg-white border-l-4 border-blue-500",
      icon: "text-blue-500 bg-blue-50",
      text: "text-gray-800",
      progress: "bg-blue-500",
    },
  };

  // Position classes
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
  };

  // Animation classes
  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-300 ease-in-out";

    if (isExiting) {
      return `${baseClasses} opacity-0 transform scale-95 translate-x-full`;
    }

    if (isVisible) {
      return `${baseClasses} opacity-100 transform scale-100 translate-x-0`;
    }

    return `${baseClasses} opacity-0 transform scale-95 translate-x-full`;
  };

  const scheme = colorSchemes[type] || colorSchemes.info;

  return (
    <div
      id={`toast-${id}`}
      className={`
        fixed z-50 flex flex-col w-full max-w-sm
        ${positionClasses[position]}
        ${getAnimationClasses()}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Main Toast Content */}
      <div
        className={`
        ${scheme.bg} 
        rounded-lg shadow-lg backdrop-blur-sm
        overflow-hidden
      `}
      >
        <div className="flex items-start p-4">
          {/* Icon */}
          <div
            className={`
            inline-flex items-center justify-center shrink-0 w-10 h-10 rounded-lg mr-3
            ${scheme.icon}
          `}
          >
            {icons[type]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div
              className={`text-sm font-medium ${scheme.text} leading-relaxed`}
            >
              {message}
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="ml-3 inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className={`h-full ${scheme.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Toast Container Component for managing multiple toasts
export const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * 80}px)`, // Stack toasts
          }}
        >
          <Toast {...toast} onClose={() => onClose(toast.id)} />
        </div>
      ))}
    </div>
  );
};

// Hook for using toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info", options = {}) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration: options.duration || 3000,
      position: options.position || "top-right",
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration + animation
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration + 300);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const showSuccess = (message, options) =>
    showToast(message, "success", options);
  const showError = (message, options) => showToast(message, "error", options);
  const showWarning = (message, options) =>
    showToast(message, "warning", options);
  const showInfo = (message, options) => showToast(message, "info", options);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    removeAllToasts,
  };
};

export default Toast;
