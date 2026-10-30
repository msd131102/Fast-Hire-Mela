import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Smart dynamic base URL detection:
// When running in browser on localhost or 127.0.0.1 -> automatically use local backend
// When running in production/cloud -> use Koyeb server API URL
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const DEFAULT_SERVER_URL = 'https://empirical-lucinda-shiva1311-40c75dd1.koyeb.app/api';

const API_BASE_URL = isLocal 
  ? 'http://localhost:5000/api' 
  : (import.meta.env.VITE_API_URL || DEFAULT_SERVER_URL);

const ADMIN_API_BASE_URL = isLocal 
  ? 'http://localhost:5000/api/admin' 
  : (import.meta.env.VITE_ADMIN_API_URL || `${DEFAULT_SERVER_URL}/admin`);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to main API
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const adminApi = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          Cookies.remove('admin_token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          // Forbidden - insufficient permissions
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          // Not found
          toast.error('The requested resource was not found.');
          break;
        case 422:
          // Validation error
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(err.message || err);
            });
          } else {
            toast.error(data.message || 'Validation failed');
          }
          break;
        case 429:
          // Rate limit exceeded
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          // Server error
          toast.error('Server error. Please try again later.');
          break;
        default:
          // Other errors
          toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other errors
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => adminApi.post('/auth/login', credentials),
  signup: (userData) => adminApi.post('/auth/signup', userData),
  logout: () => adminApi.post('/auth/logout'),
  verify: () => adminApi.get('/auth/verify'),
  updateProfile: (data) => adminApi.put('/auth/profile', data),
  changePassword: (data) => adminApi.put('/auth/change-password', data),
};

// Jobs API
export const jobsAPI = {
  getJobs: (params) => adminApi.get('/jobs', { params }),
  getJob: (id) => adminApi.get(`/jobs/${id}`),
  createJob: (data) => adminApi.post('/jobs', data),
  updateJob: (id, data) => adminApi.put(`/jobs/${id}`, data),
  deleteJob: (id) => adminApi.delete(`/jobs/${id}`),
  bulkDelete: (ids) => adminApi.delete('/jobs/bulk', { data: { ids } }),
  bulkImport: (formData) => adminApi.post('/jobs/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, status) => adminApi.patch(`/jobs/${id}/status`, { status }),
  getJobStats: () => adminApi.get('/jobs/stats/overview'),
  searchJobs: (query) => adminApi.get('/jobs/search', { params: { q: query } }),
};

// Categories API
export const categoriesAPI = {
  getCategories: (params) => adminApi.get('/categories', { params }),
  getCategory: (id) => adminApi.get(`/categories/${id}`),
  createCategory: (data) => adminApi.post('/categories', data),
  updateCategory: (id, data) => adminApi.put(`/categories/${id}`, data),
  deleteCategory: (id) => adminApi.delete(`/categories/${id}`),
  getCategoryStats: () => adminApi.get('/categories/stats'),
  reorderCategories: (orders) => adminApi.put('/categories/reorder', { orders }),
};

// Companies API
export const companiesAPI = {
  getCompanies: (params) => adminApi.get('/companies', { params }),
  getCompany: (id) => adminApi.get(`/companies/${id}`),
  createCompany: (data) => adminApi.post('/companies', data),
  updateCompany: (id, data) => adminApi.put(`/companies/${id}`, data),
  deleteCompany: (id) => adminApi.delete(`/companies/${id}`),
  blockCompany: (id) => adminApi.patch(`/companies/${id}/block`),
  unblockCompany: (id) => adminApi.patch(`/companies/${id}/unblock`),
  getCompanyStats: () => adminApi.get('/companies/stats'),
  searchCompanies: (query) => adminApi.get('/companies/search', { params: { q: query } }),
  getFeaturedCompanies: () => adminApi.get('/companies/featured'),
  updateFeaturedStatus: (id, isFeatured) => adminApi.patch(`/companies/${id}/featured`, { isFeatured }),
  getCompanyJobs: (id) => adminApi.get(`/companies/${id}/jobs`),
  uploadLogo: (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return adminApi.post(`/companies/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Users API
export const usersAPI = {
  getUsers: (params) => adminApi.get('/users', { params }),
  getUser: (id) => adminApi.get(`/users/${id}`),
  createUser: (data) => adminApi.post('/users', data),
  updateUser: (id, data) => adminApi.put(`/users/${id}`, data),
  deleteUser: (id) => adminApi.delete(`/users/${id}`),
  blockUser: (id) => adminApi.put(`/users/${id}/block`),
  unblockUser: (id) => adminApi.put(`/users/${id}/unblock`),
  getUserStats: () => adminApi.get('/users/stats'),
  searchUsers: (query) => adminApi.get('/users/search', { params: { q: query } }),
  exportUsers: (params) => adminApi.get('/users/export', { 
    params, 
    responseType: 'blob' 
  }),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => adminApi.get('/analytics/dashboard'),
  getJobStats: (period) => adminApi.get('/analytics/jobs', { params: { period } }),
  getUserStats: (period) => adminApi.get('/analytics/users', { params: { period } }),
  getRevenueStats: (period) => adminApi.get('/analytics/revenue', { params: { period } }),
  getPopularCategories: () => adminApi.get('/analytics/popular-categories'),
  getRecentActivity: () => adminApi.get('/analytics/recent-activity'),
  getSystemMetrics: () => adminApi.get('/analytics/system'),
  exportReport: (type, params) => adminApi.get(`/analytics/export/${type}`, { 
    params, 
    responseType: 'blob' 
  }),
};

// Locations API - uses admin API for management operations
export const locationsAPI = {
  getLocations: (params) => adminApi.get('/locations', { params }),
  getLocation: (location) => adminApi.get(`/locations/${encodeURIComponent(location)}`),
  getLocationStats: () => adminApi.get('/locations/stats'),
  createLocation: (data) => adminApi.post('/locations', data),
  updateLocation: (location, data) => adminApi.put(`/locations/${encodeURIComponent(location)}`, data),
  deleteLocation: (location) => adminApi.delete(`/locations/${encodeURIComponent(location)}`),
  getLocationJobs: (location, params) => adminApi.get(`/locations/${encodeURIComponent(location)}/jobs`, { params }),
  getLocationTrends: (location, params) => adminApi.get(`/locations/${encodeURIComponent(location)}/trends`, { params }),
  searchLocations: (query) => adminApi.get('/locations/search', { params: { q: query } }),
};

// Settings API
export const settingsAPI = {
  getSettings: () => adminApi.get('/settings'),
  updateSettings: (data) => adminApi.put('/settings', data),
  getSiteSettings: () => adminApi.get('/settings/site'),
  updateSiteSettings: (data) => adminApi.put('/settings/site', data),
  getPaymentSettings: () => adminApi.get('/settings/payment'),
  updatePaymentSettings: (data) => adminApi.put('/settings/payment', data),
  getEmailSettings: () => adminApi.get('/settings/email'),
  updateEmailSettings: (data) => adminApi.put('/settings/email', data),
  testEmailSettings: () => adminApi.post('/settings/email/test'),
  getBackupSettings: () => adminApi.get('/settings/backup'),
  createBackup: () => adminApi.post('/settings/backup/create'),
  restoreBackup: (file) => {
    const formData = new FormData();
    formData.append('backup', file);
    return adminApi.post('/settings/backup/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// File Upload API
export const uploadAPI = {
  uploadImage: (file, type = 'general') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    return adminApi.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return adminApi.post('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (filename) => adminApi.delete(`/upload/file/${filename}`),
};

// SEO API
export const seoAPI = {
  // SEO Settings
  getSettings: () => adminApi.get('/seo/settings'),
  updateSettings: (id, data) => adminApi.put(`/seo/settings/${id}`, data),
  createSettings: (data) => adminApi.post('/seo/settings', data),

  // Sitemap Configuration
  getSitemapConfig: () => adminApi.get('/seo/sitemap'),
  updateSitemapConfig: (id, data) => adminApi.put(`/seo/sitemap/${id}`, data),
  createSitemapConfig: (data) => adminApi.post('/seo/sitemap', data),
  generateSitemap: () => adminApi.post('/seo/sitemap/generate'),

  // URL Redirects
  getRedirects: (params) => adminApi.get('/seo/redirects', { params }),
  getRedirect: (id) => adminApi.get(`/seo/redirects/${id}`),
  createRedirect: (data) => adminApi.post('/seo/redirects', data),
  updateRedirect: (id, data) => adminApi.put(`/seo/redirects/${id}`, data),
  deleteRedirect: (id) => adminApi.delete(`/seo/redirects/${id}`),
  bulkDeleteRedirects: (ids) => adminApi.delete('/seo/redirects/bulk', { data: { ids } }),

  // Meta Tags
  getMetaTags: (params) => adminApi.get('/seo/meta-tags', { params }),
  getMetaTag: (id) => adminApi.get(`/seo/meta-tags/${id}`),
  createMetaTag: (data) => adminApi.post('/seo/meta-tags', data),
  updateMetaTag: (id, data) => adminApi.put(`/seo/meta-tags/${id}`, data),
  deleteMetaTag: (id) => adminApi.delete(`/seo/meta-tags/${id}`),
  bulkDeleteMetaTags: (ids) => adminApi.delete('/seo/meta-tags/bulk', { data: { ids } }),

  // SEO Tools
  analyzeSeo: (url) => adminApi.post('/seo/analyze', { url }),
  generateRobots: () => adminApi.post('/seo/robots/generate'),
  validateSitemap: () => adminApi.get('/seo/sitemap/validate'),
};

// Database API
export const databaseAPI = {
  getStats: () => adminApi.get('/database/stats'),
  getTables: () => adminApi.get('/database/tables'),
  getTableDetails: (tableName, params = {}) => adminApi.get(`/database/table/${tableName}`, { params }),
  getBackups: () => adminApi.get('/database/backups'),
  getOperations: () => adminApi.get('/database/operations'),
  createBackup: () => adminApi.post('/database/backup'),
  restoreBackup: (backupId) => adminApi.post(`/database/restore/${backupId}`),
  optimize: () => adminApi.post('/database/optimize'),
  cleanup: () => adminApi.post('/database/cleanup'),
};

// Logs API
export const logsAPI = {
  getLogs: (params) => adminApi.get('/logs', { params }),
  exportLogs: (params) => adminApi.get('/logs/export', { params, responseType: 'blob' }),
};

// Pages API
export const pagesAPI = {
  getPages: (params) => adminApi.get('/pages', { params }),
  getPage: (id) => adminApi.get(`/pages/${id}`),
  createPage: (data) => adminApi.post('/pages', data),
  updatePage: (id, data) => adminApi.put(`/pages/${id}`, data),
  deletePage: (id) => adminApi.delete(`/pages/${id}`),
  getPageStats: () => adminApi.get('/pages/stats'),
};

// Roles API
export const rolesAPI = {
  getRoles: (params) => adminApi.get('/roles', { params }),
  getRole: (id) => adminApi.get(`/roles/${id}`),
  createRole: (data) => adminApi.post('/roles', data),
  updateRole: (id, data) => adminApi.put(`/roles/${id}`, data),
  deleteRole: (id) => adminApi.delete(`/roles/${id}`),
};

// Export the main adminApi instance for custom requests
export { adminApi };

// Contact API
export const contactAPI = {
  getContacts: (params) => adminApi.get('/contact', { params }),
  getContact: (id) => adminApi.get(`/contact/${id}`),
  deleteContact: (id) => adminApi.delete(`/contact/${id}`),
  updateStatus: (id, status) => adminApi.patch(`/contact/${id}/status`, { status }),
  replyToContact: (id, data) => adminApi.post(`/contact/${id}/reply`, data),
  exportContacts: (params) => adminApi.get('/contact/export', { 
    params, 
    responseType: 'blob' 
  }),
};

// Applications API
export const applicationsAPI = {
  getApplications: async (params) => {
    const response = await adminApi.get('/applications', { params });
    return response.data;
  },
  getApplication: async (id) => {
    const response = await adminApi.get(`/applications/${id}`);
    return response.data.data;
  },
  updateApplication: async (id, data) => {
    const response = await adminApi.put(`/applications/${id}`, data);
    return response.data.data;
  },
  updateStatus: async (id, status) => {
    const response = await adminApi.patch(`/applications/${id}/status`, { status });
    return response.data.data;
  },
  deleteApplication: async (id) => {
    const response = await adminApi.delete(`/applications/${id}`);
    return response.data.data;
  },
  getApplicationStats: async () => {
    const response = await adminApi.get('/applications/stats');
    return response.data.data;
  },
  exportApplications: (params) => adminApi.get('/applications/export', { 
    params, 
    responseType: 'blob' 
  }),
};

// Payments API
export const paymentsAPI = {
  getPayments: (params) => adminApi.get('/payments', { params }),
  getPayment: (id) => adminApi.get(`/payments/${id}`),
  updatePayment: (id, data) => adminApi.put(`/payments/${id}`, data),
  updatePaymentStatus: (id, status) => adminApi.patch(`/payments/${id}/status`, { status }),
  deletePayment: (id) => adminApi.delete(`/payments/${id}`),
  getPaymentStats: () => adminApi.get('/payments/stats'),
  exportPayments: (params) => adminApi.get('/payments/export', { 
    params, 
    responseType: 'blob' 
  }),
  
  // Subscriptions
  getSubscriptions: (params) => adminApi.get('/payments/subscriptions', { params }),
  getSubscription: (id) => adminApi.get(`/payments/subscriptions/${id}`),
  updateSubscription: (id, data) => adminApi.put(`/payments/subscriptions/${id}`, data),
  updateSubscriptionStatus: (id, status) => adminApi.patch(`/payments/subscriptions/${id}/status`, { status }),
  cancelSubscription: (id) => adminApi.post(`/payments/subscriptions/${id}/cancel`),
  getSubscriptionStats: () => adminApi.get('/payments/subscription-stats'),
  exportSubscriptions: (params) => adminApi.get('/payments/subscriptions/export', { 
    params, 
    responseType: 'blob' 
  }),
};

// Referrals API - Note: Using main API for referral endpoints since they're not under /admin
export const referralsAPI = {
  getReferrals: (params) => api.get('/referral/admin', { params }),
  getReferral: (id) => api.get(`/referral/${id}`),
  updateReferralStatus: (id, statusData) => api.put(`/referral/${id}`, statusData),
  getReferralStats: () => api.get('/referral/stats'),
  exportReferrals: (params) => api.get('/referral/export', { 
    params, 
    responseType: 'blob' 
  }),
};

// Export all APIs as a default object
export default {
  adminApi,
  auth: authAPI,
  jobs: jobsAPI,
  categories: categoriesAPI,
  companies: companiesAPI,
  users: usersAPI,
  analytics: analyticsAPI,
  locations: locationsAPI,
  pages: pagesAPI,
  database: databaseAPI,
  logs: logsAPI,
  roles: rolesAPI,
  settings: settingsAPI,
  upload: uploadAPI,
  seo: seoAPI,
  contact: contactAPI,
  applications: applicationsAPI,
  payments: paymentsAPI,
  referrals: referralsAPI,
};
