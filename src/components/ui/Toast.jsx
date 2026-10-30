import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

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

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [removeToast]);

  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    loading: (message, options = {}) => addToast({ type: 'loading', message, duration: 0, ...options }),
    dismiss: (id) => removeToast(id),
    dismissAll: () => setToasts([]),
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, addToast, removeToast }}>
      {children}
      {createPortal(<ToastContainer toasts={toasts} onRemove={removeToast} />, document.body)}
    </ToastContext.Provider>
  );
};

// Updated Container: Responsive positioning (Bottom on Mobile, Top-Right on Desktop)
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-auto md:top-6 md:right-6 md:left-auto z-[9999] flex flex-col items-center md:items-end gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    const iconBase = "w-5 h-5 sm:w-6 sm:h-6";
    switch (toast.type) {
      case 'success': return <svg className={iconBase} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>;
      case 'error': return <svg className={iconBase} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>;
      case 'warning': return <svg className={iconBase} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
      case 'info': return <svg className={iconBase} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'loading': return <svg className={`${iconBase} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth={4} /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>;
      default: return null;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success': return 'border-green-100 bg-white/95 text-green-900 shadow-green-900/5';
      case 'error': return 'border-red-100 bg-white/95 text-red-900 shadow-red-900/5';
      case 'warning': return 'border-yellow-100 bg-white/95 text-yellow-900 shadow-yellow-900/5';
      case 'info': return 'border-blue-100 bg-white/95 text-blue-900 shadow-blue-900/5';
      case 'loading': return 'border-gray-100 bg-white/95 text-gray-900 shadow-gray-900/5';
      default: return 'border-gray-100 bg-white/95 text-gray-900';
    }
  };

  const getIconStyles = () => {
    switch (toast.type) {
      case 'success': return 'bg-green-100 text-green-600';
      case 'error': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-yellow-100 text-yellow-600';
      case 'info': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div
      className={cn(
        'pointer-events-auto group relative overflow-hidden',
        'max-w-md w-full md:w-80 border rounded-2xl p-4 shadow-2xl backdrop-blur-md transition-all duration-300 ease-out',
        getStyles(),
        isLeaving ? 'opacity-0 translate-y-2 md:translate-x-12' : 'opacity-100 translate-y-0 translate-x-0',
        !isLeaving ? 'animate-in' : ''
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn('flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center', getIconStyles())}>
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold tracking-tight">{toast.message}</p>
          {toast.description && (
            <p className="text-xs mt-0.5 font-medium opacity-60 line-clamp-2">{toast.description}</p>
          )}
        </div>

        {toast.type !== 'loading' && (
          <button
            onClick={handleRemove}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100/50">
          <div
            className={cn("h-full transition-all ease-linear", 
              toast.type === 'success' ? 'bg-green-500' : 
              toast.type === 'error' ? 'bg-red-500' : 
              'bg-blue-500'
            )}
            style={{ animation: `shrink ${toast.duration}ms linear forwards` }}
          />
        </div>
      )}
    </div>
  );
};

// Refined Animations
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink { from { width: 100%; } to { width: 0%; } }
  @keyframes toast-in {
    from { transform: translateY(1rem); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @media (min-width: 768px) {
    @keyframes toast-in {
      from { transform: translateX(2rem); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  }
  .animate-in { animation: toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
`;
document.head.appendChild(style);

export { ToastProvider, ToastContext };
export default ToastProvider;