import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Cookies from 'js-cookie';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));

        // Store token in cookie
        Cookies.set('token', token, {
          expires: 30,
          secure: window.location.protocol === 'https:',
          sameSite: 'strict',
        });

        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));

        // Update auth context
        login({ success: true, data: { user, token } });

        // Redirect to dashboard after short delay
        const timeout = setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);

        return () => clearTimeout(timeout);
      } catch (err) {
        console.error('Error processing OAuth success:', err);
        setError('Failed to process authentication data.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Authentication failed - missing token or user data');
      setIsLoading(false);
    }
  }, [location.search, navigate, login]);

  // shared container style for desktop/mobile consistency
  const containerStyle = "min-h-[100dvh] flex items-center justify-center p-4 md:p-6";

  return (
    <div className={`bg-slate-50 ${containerStyle}`}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm text-center"
          >
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">Verifying...</h2>
            <p className="text-gray-500 text-sm md:text-base">Securing your session, please wait.</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white p-6 md:p-10 rounded-2xl shadow-xl shadow-red-100 border border-red-50 text-center"
          >
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Login Failed</h2>
            <p className="text-gray-600 mb-8 text-sm md:text-base">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl hover:bg-black transition-all font-semibold shadow-lg active:scale-[0.98]"
            >
              Return to Login
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white p-6 md:p-10 rounded-3xl shadow-2xl shadow-blue-100 text-center border border-gray-50"
          >
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <motion.svg 
                initial={{ pathLength: 0 }} 
                animate={{ pathLength: 1 }} 
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </motion.svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-500 mb-8 text-sm md:text-base">Welcome to Fast Hire Mela.<br/>Redirecting you now...</p>
            
            <div className="flex items-center justify-center gap-2 text-blue-600 font-medium bg-blue-50 py-3 px-4 rounded-xl">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span className="text-sm">Entering Dashboard</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OAuthSuccess;