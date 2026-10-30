import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('🛡️ Admin ProtectedRoute check:', { 
    path: location.pathname, 
    loading, 
    isAuthenticated, 
    user: !!user, 
    userEmail: user?.email 
  });

  if (loading) {
    console.log('⏳ Admin ProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('🚫 Admin ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  console.log('✅ Admin ProtectedRoute: User authenticated, rendering children');
  return children;
};

export default ProtectedRoute;
