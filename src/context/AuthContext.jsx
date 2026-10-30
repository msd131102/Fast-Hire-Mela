import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import Cookies from 'js-cookie';
import { useToast } from '../components/ui/toastUtils';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isPremium: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isPremium: action.payload.user.is_premium || false,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isPremium: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isPremium: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        isPremium: action.payload.isPremium || state.isPremium,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'INITIALIZE':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token,
        isPremium: action.payload.user?.is_premium || false,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();

  // Initialize auth state from cookies/localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = Cookies.get('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          const user = JSON.parse(storedUser);
          
          // Verify token with server
          try {
            const response = await authAPI.verifyToken();
            if (response.success) {
              dispatch({
                type: 'INITIALIZE',
                payload: { user, token },
              });
              
              // Profile completion modal removed - users go directly to dashboard
            } else {
              // Token invalid, clear everything
              Cookies.remove('token');
              localStorage.removeItem('user');
              dispatch({ type: 'INITIALIZE', payload: { user: null, token: null } });
            }
          } catch (error) {
            // Token verification failed
            Cookies.remove('token');
            localStorage.removeItem('user');
            dispatch({ type: 'INITIALIZE', payload: { user: null, token: null } });
          }
        } else {
          dispatch({ type: 'INITIALIZE', payload: { user: null, token: null } });
        }
      } catch (error) {
        dispatch({ type: 'INITIALIZE', payload: { user: null, token: null } });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    console.log('🔐 AuthContext login called with:', email);
    dispatch({ type: 'LOGIN_START' });
    
    try {
      console.log('📡 Making API call to authAPI.login...');
      const response = await authAPI.login({ email, password });
      console.log('📨 API response received:', response);
      
      if (response.success) {
        const { user, token } = response.data;
        console.log('✅ Login successful, user:', user, 'token length:', token?.length);
        
        // Store token in cookie
        Cookies.set('token', token, {
          expires: 30, // 30 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        
        // Profile completion modal removed - users go directly to dashboard
        
        toast.success('Login successful! Welcome back.');
        console.log('🎯 Returning success: true');
        return { success: true };
      } else {
        console.log('❌ Login failed:', response.message);
        dispatch({ type: 'LOGIN_FAILURE' });
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.log('💥 Login error:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authAPI.register(userData);
      
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
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        
        // Profile completion modal removed - users go directly to dashboard
        
        toast.success('Registration successful! Welcome to Fast Hire Mela.');
        return { success: true };
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
        toast.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const logout = () => {
    // Clear cookie and localStorage
    Cookies.remove('token');
    localStorage.removeItem('user');
    
    dispatch({ type: 'LOGOUT' });
    toast.info('You have been logged out successfully.');
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    });
    
    // Profile completion modal removed - no action needed
  };

  const upgradeToPremium = () => {
    updateUser({ isPremium: true });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    upgradeToPremium,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { useAuth };
