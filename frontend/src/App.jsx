import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import JobsList from './pages/Jobs/JobsList';
import JobDetails from './pages/Jobs/JobDetails';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import OAuthCallback from './pages/Auth/OAuthCallback';
import OAuthSuccess from './pages/Auth/OAuthSuccess';
import Dashboard from './pages/Dashboard/Dashboard';
import SavedJobs from './pages/Dashboard/SavedJobs';
import Applications from './pages/Dashboard/Applications';
import Profile from './pages/Dashboard/Profile';
import Premium from './pages/Premium/Premium';
import PremiumPlans from './pages/Premium/PremiumPlans';
import PremiumCheckout from './pages/Premium/PremiumCheckout';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import Categories from './pages/Categories';
import Companies from './pages/Companies';
import UserGuidance from './pages/UserGuidance';
import Referral from './pages/Premium/Referral';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ThemeProvider>
            <AuthProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <div className="min-h-screen bg-gray-50 transition-colors">
                  <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={
                    <ErrorBoundary>
                      <Layout />
                    </ErrorBoundary>
                  }>
                    <Route index element={<Home />} />
                    <Route path="jobs" element={
                      <ErrorBoundary>
                        <JobsList />
                      </ErrorBoundary>
                    } />
                    <Route path="jobs/:id" element={
                      <ErrorBoundary>
                        <JobDetails />
                      </ErrorBoundary>
                    } />
                    <Route path="categories" element={<Categories />} />
                    <Route path="companies" element={<Companies />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="auth/callback/github" element={<OAuthCallback />} />
                    <Route path="auth/callback/linkedin" element={<OAuthCallback />} />
                    <Route path="auth/oauth-success" element={<OAuthSuccess />} />
                    <Route path="premium" element={<PremiumPlans />} />
                    <Route path="premium/plans" element={<PremiumPlans />} />
                    <Route path="premium/checkout" element={
                      <ProtectedRoute>
                        <PremiumCheckout />
                      </ProtectedRoute>
                    } />
                    <Route path="premium-checkout" element={
                      <ProtectedRoute>
                        <PremiumCheckout />
                      </ProtectedRoute>
                    } />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="privacy" element={<Privacy />} />
                    <Route path="terms" element={<Terms />} />
                    <Route path="faq" element={<FAQ />} />
                    <Route path="user-guidance" element={<UserGuidance />} />

                    {/* Protected Routes */}
                    <Route path="dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="dashboard/saved-jobs" element={
                      <ProtectedRoute>
                        <SavedJobs />
                      </ProtectedRoute>
                    } />
                    <Route path="saved-jobs" element={
                      <ProtectedRoute>
                        <SavedJobs />
                      </ProtectedRoute>
                    } />
                    <Route path="applications" element={
                      <ProtectedRoute>
                        <Applications />
                      </ProtectedRoute>
                    } />
                    <Route path="profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="premium/dashboard" element={
                      <ProtectedRoute>
                        <Premium />
                      </ProtectedRoute>
                    } />
                    <Route path="premium/referral" element={
                      <ProtectedRoute>
                        <Referral />
                      </ProtectedRoute>
                    } />
                    <Route path="settings" element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } />

                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </div>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
