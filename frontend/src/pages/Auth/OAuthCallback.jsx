import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { oauthAPI } from '../../services/api';
import Cookies from 'js-cookie';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      const provider = urlParams.get('provider') || 'github';
      const state = urlParams.get('state');

      if (!code) {
        setError('Authorization code not found');
        setIsLoading(false);
        return;
      }

      try {
        // Extract provider from URL path
        const pathname = window.location.pathname;
        let provider = 'github';
        if (pathname.includes('linkedin')) {
          provider = 'linkedin';
        } else if (pathname.includes('github')) {
          provider = 'github';
        }

        // Add state parameter from URL for LinkedIn
        const urlState = urlParams.get('state');
        
        // Call backend to handle OAuth callback
        const response = await oauthAPI.callback(code, provider, urlState);

        if (response.success) {
          const { user, token } = response.data;
          
          // Store token in cookie
          Cookies.set('token', token, {
            expires: 30,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });
          
          // Store user in localStorage
          localStorage.setItem('user', JSON.stringify(user));
          
          // Update auth context by dispatching login action
          // We need to trigger a re-render of the auth context
          window.location.href = '/dashboard';
        } else {
          setError(response.message || 'Authentication failed');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };

    handleOAuthCallback();
  }, [location.search, navigate, authLogin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Completing authentication...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7M7 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Successful</h2>
            <p className="text-gray-600 mb-6">You have been successfully authenticated!</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OAuthCallback;
