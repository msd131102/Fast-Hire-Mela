import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-gray-300">404</div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                onClick={() => window.history.back()}
                className="flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center">
                  <Home className="h-4 w-4 mr-2" />
                  Home Page
                </Button>
              </Link>
            </div>
            
            <Link to="/jobs">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 flex items-center justify-center mx-auto">
                <Search className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Helpful Links */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Looking for something?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              to="/jobs" 
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Job Listings
            </Link>
            <Link 
              to="/dashboard" 
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            <Link 
              to="/premium" 
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <span className="h-4 w-4 mr-2">⭐</span>
              Premium Plans
            </Link>
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <span className="h-4 w-4 mr-2">👤</span>
              Login/Register
            </Link>
          </div>
        </div>
        
        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Still can't find what you're looking for?{' '}
            <a 
              href="mailto:support@fasthiremela.com" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
