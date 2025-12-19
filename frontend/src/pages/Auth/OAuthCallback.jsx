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
  const [debugInfo, setDebugInfo] = useState(null);

  // LinkedIn OAuth error handling utilities
  const getLinkedInErrorInfo = (urlParams) => {
    const errorCode = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    const errorMap = {
      'access_denied': {
        title: 'Access Denied',
        message: 'You declined the permissions required for LinkedIn authentication.',
        solution: 'Please try again and grant the necessary permissions.',
        type: 'permission'
      },
      'invalid_request': {
        title: 'Invalid Request',
        message: 'The redirect URI or configuration is invalid.',
        solution: 'Please contact support or try again later.',
        type: 'configuration'
      },
      'unauthorized_client': {
        title: 'Client Authentication Failed',
        message: 'The LinkedIn app configuration is invalid.',
        solution: 'Please contact support to resolve this issue.',
        type: 'configuration'
      },
      'unsupported_response_type': {
        title: 'Unsupported OAuth Version',
        message: 'The OAuth version is not supported.',
        solution: 'Please contact support about this issue.',
        type: 'configuration'
      },
      'invalid_scope': {
        title: 'Invalid Permissions',
        message: 'The requested permissions are not valid.',
        solution: 'Please contact support about permission requirements.',
        type: 'permission'
      },
      'server_error': {
        title: 'LinkedIn Service Unavailable',
        message: 'LinkedIn services are temporarily unavailable.',
        solution: 'Please try again in a few minutes.',
        type: 'temporary'
      },
      'temporarily_unavailable': {
        title: 'LinkedIn Temporarily Unavailable',
        message: 'LinkedIn services are temporarily down for maintenance.',
        solution: 'Please try again later.',
        type: 'temporary'
      }
    };

    return errorMap[errorCode] || {
      title: 'Authentication Failed',
      message: 'An unknown error occurred during authentication.',
      solution: 'Please try again or contact support.',
      type: 'unknown'
    };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const formatDebugInfo = () => {
    const urlParams = new URLSearchParams(location.search);
    const pathname = window.location.pathname;

    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      searchParams: Object.fromEntries(urlParams.entries()),
      pathname,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      cookies: document.cookie
    };
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      const errorCode = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      const state = urlParams.get('state');

      // Set debug information
      setDebugInfo(formatDebugInfo());

      if (errorCode) {
        // Handle LinkedIn OAuth errors specifically
        const errorInfo = getLinkedInErrorInfo(urlParams);
        setError({
          type: 'linkedin_oauth',
          title: errorInfo.title,
          message: errorInfo.message,
          solution: errorInfo.solution,
          errorCode,
          errorDescription,
          debugInfo: formatDebugInfo()
        });
        setIsLoading(false);
        return;
      }

      if (!code) {
        setError({
          type: 'missing_code',
          title: 'Authorization Code Missing',
          message: 'No authorization code was received from LinkedIn.',
          solution: 'Please try the authentication process again.',
          debugInfo: formatDebugInfo()
        });
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
          setError({
            type: 'backend_error',
            title: 'Authentication Failed',
            message: response.message || 'LinkedIn authentication failed.',
            solution: 'Please check your credentials and try again.',
            debugInfo: {
              ...formatDebugInfo(),
              backendResponse: response
            }
          });
        }
      } catch (error) {
        setError({
          type: 'network_error',
          title: 'Network Error',
          message: 'Unable to connect to authentication service.',
          solution: 'Please check your internet connection and try again.',
          debugInfo: {
            ...formatDebugInfo(),
            error: {
              message: error.message,
              stack: error.stack,
              response: error.response?.data
            }
          }
        });
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{error.title || 'Authentication Failed'}</h2>
              <p className="text-gray-600 mb-4">{error.message}</p>
              
              {error.solution && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Solution:</h3>
                  <p className="text-blue-800 text-sm">{error.solution}</p>
                </div>
              )}

              {error.errorCode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                  <h3 className="font-semibold text-yellow-900 mb-2">Error Code:</h3>
                  <p className="text-yellow-800 text-sm font-mono">{error.errorCode}</p>
                  {error.errorDescription && (
                    <p className="text-yellow-700 text-sm mt-2">{error.errorDescription}</p>
                  )}
                </div>
              )}

              {/* Conditional Action Buttons */}
              {error.type === 'linkedin_oauth' || error.type === 'permission' ? (
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try LinkedIn Login Again
                  </button>
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Use Email Login Instead
                  </button>
                </div>
              ) : error.type === 'configuration' ? (
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again Later
                  </button>
                  <button
                    onClick={() => window.location.href = 'mailto:support@fasthiremela.online'}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              ) : error.type === 'temporary' ? (
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again in 5 Minutes
                  </button>
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Back to Login
                </button>
              )}

              {/* Debug Information */}
              {error.debugInfo && (
                <div className="mt-6 border-t pt-6">
                  <button
                    onClick={() => {
                      const debugEl = document.getElementById('debug-info');
                      debugEl.classList.toggle('hidden');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 mb-3"
                  >
                    {document.getElementById('debug-info')?.classList.contains('hidden') ? 'Show' : 'Hide'} Debug Information
                  </button>
                  <div id="debug-info" className="hidden">
                    <div className="bg-gray-100 rounded-md p-4 text-left">
                      <h3 className="font-semibold text-gray-900 mb-2">Debug Information:</h3>
                      <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(error.debugInfo, null, 2)}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(error.debugInfo, null, 2))}
                        className="mt-3 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                      >
                        Copy Debug Info
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
