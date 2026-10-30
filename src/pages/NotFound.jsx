import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import SEO from '../components/seo/SEO';

const NotFound = () => {
  const seoConfig = {
    title: 'Page Not Found - 404 Error | FastHireMela',
    description: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
    keywords: '404 error, page not found, broken link, FastHireMela',
    noIndex: true
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <SEO {...seoConfig} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center">
          
          {/* 404 Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-12"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 mx-auto mb-8 rounded-full bg-blue-100 flex items-center justify-center"
              >
                <span className="text-6xl font-black text-blue-600">4</span>
              </motion.div>
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center"
              >
                <span className="text-4xl font-black text-indigo-600">0</span>
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -left-6 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center"
              >
                <span className="text-5xl font-black text-purple-600">4</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-2">
              The page you're looking for seems to have vanished into thin air.
            </p>
            <p className="text-gray-500">
              But don't worry, your dream job is still waiting for you!
            </p>
          </motion.div>

          {/* Search Suggestions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              What were you looking for?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <Link to="/jobs">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Search className="w-4 h-4" />
                  Browse All Jobs
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Search className="w-4 h-4" />
                  Explore Categories
                </Button>
              </Link>
              <Link to="/companies">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Search className="w-4 h-4" />
                  Top Companies
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Try searching for jobs, companies, or skills..."
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    window.location.href = `/jobs?q=${encodeURIComponent(e.target.value)}`;
                  }
                }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </Button>
            <Link to="/">
              <Button className="gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <p className="text-sm text-gray-500 mb-4">
              Popular searches right now:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Fresher Jobs', 'Remote Jobs', 'IT Jobs', 'MBA Jobs', 'Engineering Jobs'].map((term) => (
                <Link
                  key={term}
                  to={`/jobs?q=${encodeURIComponent(term)}`}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
