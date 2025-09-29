import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationToast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300); // Animation duration
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300";

    if (isExiting) {
      return `${baseStyles} transform translate-x-full opacity-0`;
    }

    return `${baseStyles} transform translate-x-0 opacity-100`;

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white border-green-600`;
      case 'error':
        return `${baseStyles} bg-red-500 text-white border-red-600`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white border-yellow-600`;
      default:
        return `${baseStyles} bg-blue-500 text-white border-blue-600`;
    }
  };

  return (
    <div className={getStyles()}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-2 hover:opacity-75 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default NotificationToast;
