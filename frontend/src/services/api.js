import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from cookie using js-cookie (consistent with AuthContext)
    const token = Cookies.get('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding token to request headers');
    } else {
      console.log('⚠️ No token found in cookies');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      const errorMessage = 'Network error. Please check your connection.';
      return Promise.reject({ ...error, message: errorMessage });
    }

    // Handle token expiration
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/login';
      return Promise.reject({ ...error, message: 'Session expired. Please login again.' });
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      const errorMessage = 'Server error. Please try again later.';
      return Promise.reject({ ...error, message: errorMessage });
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const errorMessage = 'Too many requests. Please try again later.';
      return Promise.reject({ ...error, message: errorMessage });
    }

    // Return the error with the server message if available
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return Promise.reject({ ...error, message: errorMessage });
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// OTP API
export const otpAPI = {
  sendOtp: (email) => api.post('/otp/send', { email }),
  verifyOtp: (email, otp) => api.post('/otp/verify', { email, otp }),
  registerWithOtp: (userData, otp) => api.post('/auth/register-with-otp', { userData, otp }),
};

// Jobs API
export const jobsAPI = {
  getJobs: async (params) => {
    const response = await api.get('/jobs', { params });
    // Handle the response structure properly
    if (response.success && response.data) {
      return response.data;
    }
    // If response is already the data (for compatibility)
    return response;
  },
  getJob: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    return response;
  },
  getFeaturedJobs: async () => {
    const response = await api.get('/jobs/featured');
    if (response.success && response.data) {
      return response.data;
    }
    return response;
  },
  getLatestJobs: async (limit) => {
    const response = await api.get('/jobs/latest', { params: { limit } });
    if (response.success && response.data) {
      return response.data;
    }
    return response;
  },
  getSimilarJobs: async (id) => {
    const response = await api.get(`/jobs/${id}/similar`);
    if (response.success && response.data) {
      return response.data;
    }
    return response;
  },
  searchJobs: async (query, filters) => {
    const response = await api.get('/jobs/search', { params: { q: query, ...filters } });
    if (response.success && response.data) {
      return response.data;
    }
    return response;
  },
  getJobsByCategory: async (category, params) => {
    const response = await api.get(`/jobs/category/${category}`, { params });
    if (response.success && response.data) {
      return response.data;
    }
    return response;
  },
  getJobsByCompany: async (company, params) => {
    const response = await api.get(`/jobs/company/${company}`, { params });
    if (response.success && response.data) {
      return response.data;
    }
    return response;
  },
  trackApplication: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/track-application`);
    if (response.success && response.data) {
      return response.data;
    }
    return response;
  },
};

// Categories API
export const categoriesAPI = {
  getCategories: (params = {}) => api.get('/categories', { params }),
  getCategory: (id) => api.get(`/categories/${id}`),
  getPopularCategories: () => api.get('/categories/popular'),
};

// User Dashboard API
export const userAPI = {
  getSavedJobs: () => api.get('/users/saved-jobs'),
  saveJob: (jobId) => api.post(`/jobs/${jobId}/save`),
  unsaveJob: (jobId) => api.delete(`/jobs/${jobId}/save`),
  getViewedJobs: () => api.get('/users/viewed-jobs'),
  getJobAlerts: () => api.get('/users/job-alerts'),
  createJobAlert: (alertData) => api.post('/users/job-alerts', alertData),
  updateJobAlert: (id, alertData) => api.put(`/users/job-alerts/${id}`, alertData),
  deleteJobAlert: (id) => api.delete(`/users/job-alerts/${id}`),
  getProfile: () => {
    console.log('🔍 API: Getting user profile...');
    return api.get('/users/profile');
  },
  updateProfile: (userData) => {
    console.log('🔧 API: Updating user profile with data:', userData);
    return api.put('/users/profile', userData);
  },
  updateProfileForm: (formData) => api.put('/users/profile-form', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadResume: (formData) => api.post('/users/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getApplicationHistory: () => api.get('/users/applications'),
  getStats: () => api.get('/users/my-stats'),
  getActivity: () => api.get('/users/my-activity'),
};

// Premium API
export const premiumAPI = {
  getPlans: () => api.get('/payments/plans'),
  createSubscription: (planId) => api.post('/payments/subscribe', { planId }),
  getSubscriptionStatus: () => api.get('/payments/status'),
  cancelSubscription: () => api.post('/payments/cancel'),
  upgradePlan: (planId) => api.post('/payments/upgrade', { planId }),
  getPremiumJobs: () => api.get('/payments/premium-jobs'),
  getPremiumStats: () => api.get('/payments/stats'),
};

// Payment API
export const paymentAPI = {
  createOrder: (amount, currency = 'INR') => api.post('/payments/create-order', { amount, currency }),
  verifyPayment: (paymentData) => api.post('/payments/verify', paymentData),
  getPaymentHistory: () => api.get('/payments/history'),
  getInvoice: (paymentId) => api.get(`/payments/invoice/${paymentId}`),
  getPlans: () => api.get('/payments/plans'),
  processPayment: (paymentData) => api.post('/payments/process', paymentData),
};

// Analytics API (for tracking user interactions)
export const analyticsAPI = {
  trackEvent: (eventName, eventData) => api.post('/analytics/track', { eventName, eventData }),
  trackPageView: (pageName, pageData) => api.post('/analytics/page-view', { pageName, pageData }),
  trackJobView: (jobId, jobData) => api.post('/analytics/job-view', { jobId, ...jobData }),
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings/user'),
  updateSettings: (settingsData) => api.put('/settings/user', settingsData),
  getNotifications: () => api.get('/settings/notifications'),
  updateNotifications: (notificationSettings) => api.put('/settings/notifications', notificationSettings),
  getGeneral: () => api.get('/settings/general'),
  updateGeneral: (settingsData) => api.put('/settings/general', settingsData),
};

// Newsletter API (using auth routes for now)
export const newsletterAPI = {
  subscribe: (email) => api.post('/auth/newsletter/subscribe', { email }),
  unsubscribe: (email) => api.post('/auth/newsletter/unsubscribe', { email }),
  verifySubscription: (token) => api.post('/auth/newsletter/verify', { token }),
};

// Contact API (using auth routes for contact)
export const contactAPI = {
  submitContact: (contactData) => api.post('/auth/contact', contactData),
  getCompanies: () => api.get('/companies'),
};

// Individual job functions for components
export const getJobDetails = (id) => api.get(`/jobs/${id}`);
export const saveJob = (jobId) => api.post(`/jobs/${jobId}/save`);
export const applyJob = (jobId, applicationData) => api.post(`/jobs/${jobId}/apply`, applicationData);
export const trackApplication = (jobId) => api.post(`/jobs/${jobId}/track-application`);

// Auth functions
export const login = (credentials) => authAPI.login(credentials);
export const register = (userData) => authAPI.register(userData);
export const forgotPassword = (email) => authAPI.forgotPassword(email);
export const resetPassword = (token, password) => authAPI.resetPassword(token, password);

// Job functions
export const getSimilarJobs = (id) => jobsAPI.getSimilarJobs(id);

// User functions
export const getSavedJobs = () => userAPI.getSavedJobs();
export const unsaveJob = (jobId) => userAPI.unsaveJob(jobId);

// Simplified API functions for Home component
export const getJobs = (params) => api.get('/jobs', { params });
export const getCategories = () => api.get('/categories');
export const getCompanies = (params) => api.get('/companies', { params });

// Utility functions
export const utils = {
  // Format salary display
  formatSalary: (min, max, currency = '₹') => {
    if (!min && !max) return 'Not disclosed';
    if (min === max) return `${currency}${min.toLocaleString()}`;
    if (min && max) return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
    return min ? `${currency}${min.toLocaleString()}+` : `Up to ${currency}${max.toLocaleString()}`;
  },

  // Format experience
  formatExperience: (min, max) => {
    if (!min && !max) return 'Any experience';
    if (min === max) return `${min} years`;
    if (min && max) return `${min}-${max} years`;
    return min ? `${min}+ years` : `Up to ${max} years`;
  },

  // Format posted date
  formatPostedDate: (date) => {
    const now = new Date();
    const postedDate = new Date(date);
    const diffTime = Math.abs(now - postedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  },

  // Debounce function for search
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Generate slug from string
  generateSlug: (str) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
};

// Dashboard APIs
export const getUserStats = async () => {
  return await api.get('/users/my-stats');
};

export const getUserActivity = async () => {
  return await api.get('/users/my-activity');
};

export const getRecommendedJobs = async () => {
  return await api.get('/jobs/recommended');
};

// Application APIs
export const applicationAPI = {
  applyToJob: (jobId, applicationData) => api.post(`/applications`, { jobId, ...applicationData }),
  getMyApplications: () => api.get('/applications'),
  updateApplication: (applicationId, data) => api.put(`/applications/${applicationId}`, data),
  deleteApplication: (applicationId) => api.delete(`/applications/${applicationId}`),
  trackApplication: (jobId) => api.post(`/jobs/${jobId}/track-application`),
};

// Saved Jobs APIs
export const savedJobAPI = {
  getSavedJobs: () => api.get('/users/saved-jobs'),
  saveJob: (jobId) => api.post(`/jobs/${jobId}/save`),
  unsaveJob: (jobId) => api.delete(`/jobs/${jobId}/save`),
  checkIfSaved: (jobId) => api.get(`/jobs/${jobId}/saved`),
};

// Company APIs
export const companyAPI = {
  getCompanies: (params) => api.get('/companies', { params }),
  getCompany: (id) => api.get(`/companies/${id}`),
  getCompanyJobs: (id, params) => api.get(`/companies/${id}/jobs`, { params }),
  getFeaturedCompanies: () => api.get('/companies/featured'),
};

export default api;
