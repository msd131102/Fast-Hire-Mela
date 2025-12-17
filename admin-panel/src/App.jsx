import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages - Lazy loaded for code splitting
import { Suspense, lazy } from 'react';

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const JobsManagement = lazy(() => import('./pages/JobsManagement'));
const CategoriesManagement = lazy(() => import('./pages/CategoriesManagement'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const CompaniesManagement = lazy(() => import('./pages/CompaniesManagement'));
const LocationsManagement = lazy(() => import('./pages/LocationsManagement'));
const UsersManagement = lazy(() => import('./pages/UsersManagement'));
const RolesManagement = lazy(() => import('./pages/RolesManagement'));
const ApplicationsManagement = lazy(() => import('./pages/ApplicationsManagement'));
const SubscriptionsManagement = lazy(() => import('./pages/SubscriptionsManagement'));
const PaymentsManagement = lazy(() => import('./pages/PaymentsManagement'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Logs = lazy(() => import('./pages/Logs'));
const DatabaseManagement = lazy(() => import('./pages/DatabaseManagement'));
const PagesManagement = lazy(() => import('./pages/PagesManagement'));
const SEOManagement = lazy(() => import('./pages/SEOManagement'));
const MediaManagement = lazy(() => import('./pages/MediaManagement'));
const Support = lazy(() => import('./pages/Support'));
const FAQManagement = lazy(() => import('./pages/FAQManagement'));
const ContactManagement = lazy(() => import('./pages/ContactManagement'));
const ReferralsManagement = lazy(() => import('./pages/ReferralsManagement'));

// Loading component for lazy loaded routes
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Suspense fallback={<LoadingSpinner />}><Login /></Suspense>} />
              <Route path="/admin/login" element={<Suspense fallback={<LoadingSpinner />}><Login /></Suspense>} />
              <Route path="/signup" element={<Suspense fallback={<LoadingSpinner />}><Signup /></Suspense>} />
              <Route path="/admin/signup" element={<Suspense fallback={<LoadingSpinner />}><Signup /></Suspense>} />

              {/* Root redirect to admin */}
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

              {/* Legacy routes redirect */}
              <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
                <Route path="dashboard" element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
                <Route path="jobs" element={<Suspense fallback={<LoadingSpinner />}><JobsManagement /></Suspense>} />
                <Route path="categories" element={<Suspense fallback={<LoadingSpinner />}><CategoriesManagement /></Suspense>} />
                <Route path="companies" element={<Suspense fallback={<LoadingSpinner />}><CompaniesManagement /></Suspense>} />
                <Route path="locations" element={<Suspense fallback={<LoadingSpinner />}><LocationsManagement /></Suspense>} />
                <Route path="users" element={<Suspense fallback={<LoadingSpinner />}><UsersManagement /></Suspense>} />
                <Route path="roles" element={<Suspense fallback={<LoadingSpinner />}><RolesManagement /></Suspense>} />
                <Route path="applications" element={<Suspense fallback={<LoadingSpinner />}><ApplicationsManagement /></Suspense>} />
                <Route path="subscriptions" element={<Suspense fallback={<LoadingSpinner />}><SubscriptionsManagement /></Suspense>} />
                <Route path="revenue" element={<Suspense fallback={<LoadingSpinner />}><PaymentsManagement /></Suspense>} />
                <Route path="notifications" element={<Suspense fallback={<LoadingSpinner />}><Notifications /></Suspense>} />
                <Route path="logs" element={<Suspense fallback={<LoadingSpinner />}><Logs /></Suspense>} />
                <Route path="database" element={<Suspense fallback={<LoadingSpinner />}><DatabaseManagement /></Suspense>} />
                <Route path="pages" element={<Suspense fallback={<LoadingSpinner />}><PagesManagement /></Suspense>} />
                <Route path="blog" element={<Suspense fallback={<LoadingSpinner />}><PagesManagement /></Suspense>} />
                <Route path="seo" element={<Suspense fallback={<LoadingSpinner />}><SEOManagement /></Suspense>} />
                <Route path="media" element={<Suspense fallback={<LoadingSpinner />}><MediaManagement /></Suspense>} />
                <Route path="support" element={<Suspense fallback={<LoadingSpinner />}><Support /></Suspense>} />
                <Route path="faq" element={<Suspense fallback={<LoadingSpinner />}><FAQManagement /></Suspense>} />
                <Route path="contact" element={<Suspense fallback={<LoadingSpinner />}><ContactManagement /></Suspense>} />
                <Route path="referrals" element={<Suspense fallback={<LoadingSpinner />}><ReferralsManagement /></Suspense>} />
                <Route path="analytics" element={<Suspense fallback={<LoadingSpinner />}><Analytics /></Suspense>} />
                <Route path="settings" element={<Suspense fallback={<LoadingSpinner />}><Settings /></Suspense>} />
              </Route>

              <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1><p className="text-gray-600">Page not found</p></div></div>} />
            </Routes>

            {/* Global Components */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
