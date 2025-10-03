import { useState, useCallback } from 'react';

// Simple toast hook for notifications
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      title,
      description,
      variant
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);

    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toast,
    toasts,
    dismiss
  };
};

// For direct usage without hook
let globalToastFunction = null;

export const setGlobalToastFunction = (toastFunction) => {
  globalToastFunction = toastFunction;
};

export { globalToastFunction as toast };