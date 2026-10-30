import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { adminApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication on mount
  useEffect(() => {
    const token = Cookies.get('admin_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await adminApi.get('/auth/verify');
      if (response.data.success) {
        setUser(response.data.data.admin);
        setIsAuthenticated(true);
      } else {
        Cookies.remove('admin_token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      Cookies.remove('admin_token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await adminApi.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { admin, token } = response.data.data;
        
        // Set token in cookie
        Cookies.set('admin_token', token, {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        setUser(admin);
        setIsAuthenticated(true);
        
        toast.success('Login successful!');
        
        // Redirect to intended page or dashboard
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await adminApi.post('/auth/signup', { name, email, password });
      
      if (response.data.success) {
        const { admin, token } = response.data.data;
        
        // Set token in cookie
        Cookies.set('admin_token', token, {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        setUser(admin);
        setIsAuthenticated(true);
        
        toast.success('Account created successfully!');
        
        // Redirect to dashboard
        navigate('/admin/dashboard', { replace: true });
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Signup failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminApi.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      Cookies.remove('admin_token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await adminApi.put('/auth/profile', profileData);
      
      if (response.data.success) {
        setUser(response.data.data.admin);
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Profile update failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      const response = await adminApi.put('/auth/change-password', passwordData);
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
