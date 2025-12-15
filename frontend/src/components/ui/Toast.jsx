import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

// Toast context
const ToastContext = createContext();

// Custom hook for using toast
const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider component
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      ...toast,
      duration: toast.duration || 4000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [removeToast]);

  const toast = {
    success: (message, options = {}) => {
      return addToast({ type: 'success', message, ...options });
    },
    error: (message, options = {}) => {
      return addToast({ type: 'error', message, ...options });
    },
    info: (message, options = {}) => {
      return addToast({ type: 'info', message, ...options });
    },
    warning: (message, options = {}) => {
      return addToast({ type: 'warning', message, ...options });
    },
    loading: (message, options = {}) => {
      return addToast({ type: 'loading', message, duration: 0, ...options });
    },
    dismiss: (id) => {
      removeToast(id);
    },
    dismissAll: () => {
      setToasts([]);
    },
  };

  const value = { toast, toasts, addToast, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(<ToastContainer toasts={toasts} onRemove={removeToast} />, document.body)}
    </ToastContext.Provider>
  );
};

// Toast Container component
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Toast Item component
const ToastItem = ({ toast, onRemove }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'loading':
        return (
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'loading':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-white border-gray-200 text-gray-800';
    }
  };

  const getIconStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      case 'loading':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={cn(
        'max-w-sm w-full bg-white border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out transform',
        getStyles(),
        isLeaving ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100',
        !isLeaving ? 'animate-in slide-in-from-right' : ''
      )}
    >
      <div className="flex items-start">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mr-3', getIconStyles())}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{toast.message}</p>
          {toast.description && (
            <p className="text-sm mt-1 opacity-75">{toast.description}</p>
          )}
        </div>

        {/* Close button */}
        {toast.type !== 'loading' && (
          <button
            onClick={handleRemove}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress bar for auto-dismiss */}
      {toast.duration > 0 && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-gray-600 h-1 rounded-full transition-all ease-linear"
            style={{
              animation: `shrink ${toast.duration}ms linear`,
            }}
          />
        </div>
      )}
    </div>
  );
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  @keyframes slide-in-from-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-in {
    animation-name: slide-in-from-right;
    animation-duration: 300ms;
    animation-timing-function: ease-out;
    animation-fill-mode: both;
  }
`;
document.head.appendChild(style);

export { ToastProvider, useToast, ToastContext };
export default ToastProvider;
