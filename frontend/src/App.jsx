import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import SEO from './components/seo/SEO';
import RouteTracker from './components/seo/RouteTracker';
import { trackPageView } from './utils/analytics';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages (Eagerly Loaded for fast initial paint)
import AntiGravityLogo from './components/common/AntiGravityLogo';
import Home from './pages/Home';

// Pages (Lazy Loaded for code splitting)
const JobsList = React.lazy(() => import('./pages/Jobs/JobsList'));
const JobDetails = React.lazy(() => import('./pages/Jobs/JobDetails'));
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Register = React.lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = React.lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/Auth/ResetPassword'));
const OAuthCallback = React.lazy(() => import('./pages/Auth/OAuthCallback'));
const OAuthSuccess = React.lazy(() => import('./pages/Auth/OAuthSuccess'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const SavedJobs = React.lazy(() => import('./pages/Dashboard/SavedJobs'));
const Applications = React.lazy(() => import('./pages/Dashboard/Applications'));
const Profile = React.lazy(() => import('./pages/Dashboard/Profile'));
const Premium = React.lazy(() => import('./pages/Premium/Premium'));
const PremiumPlans = React.lazy(() => import('./pages/Premium/PremiumPlans'));
const PremiumCheckout = React.lazy(() => import('./pages/Premium/PremiumCheckout'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const Categories = React.lazy(() => import('./pages/Categories'));
const Companies = React.lazy(() => import('./pages/Companies'));
const UserGuidance = React.lazy(() => import('./pages/UserGuidance'));
const Referral = React.lazy(() => import('./pages/Premium/Referral'));
const Settings = React.lazy(() => import('./pages/Settings'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Global Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="spinner w-8 h-8"></div>
      <span className="text-sm font-bold text-muted uppercase tracking-widest animate-pulse">Loading Quest...</span>
    </div>
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ThemeProvider>
            <AuthProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <SEO />
                <RouteTracker />
                <div className="min-h-screen bg-background text-text transition-colors">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/logo-preview" element={<AntiGravityLogo />} />
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
                        <Route path="jobs/:slug" element={
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
                  </Suspense>
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
