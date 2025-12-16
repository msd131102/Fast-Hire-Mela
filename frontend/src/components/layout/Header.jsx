import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/toastUtils';
import logo from '../../assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  
  const { user, isAuthenticated, logout, isPremium } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);
  const mobileProfileRef = useRef(null);
  const menuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Desktop profile dropdown
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      
      // Mobile profile dropdown
      if (mobileProfileRef.current && !mobileProfileRef.current.contains(event.target)) {
        setIsMobileProfileOpen(false);
      }
      
      // Mobile menu
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
        setIsMobileProfileOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Navigation items
  const navigation = [
    { name: 'Find Jobs', href: '/jobs', icon: '💼', mobileOnly: false },
    { name: 'Companies', href: '/companies', icon: '🏢', mobileOnly: false },
    { name: 'Categories', href: '/categories', icon: '📁', mobileOnly: false },
    { name: 'About', href: '/about', icon: 'ℹ️', mobileOnly: false },
    { name: 'Contact', href: '/contact', icon: '📞', mobileOnly: true },
  ];

  const dashboardNavigation = [
    { name: 'Home', href: '/', icon: '🏠', mobileOnly: false },
    { name: 'Jobs', href: '/jobs', icon: '💼', mobileOnly: false },
    { name: 'Saved Jobs', href: '/saved-jobs', icon: '⭐', mobileOnly: false },
    { name: 'Dashboard', href: '/dashboard', icon: '📊', mobileOnly: false },
    { name: 'Profile', href: '/profile', icon: '👤', mobileOnly: false },
    ...(isPremium ? [{ name: 'Premium', href: '/premium', icon: '🌟', mobileOnly: false }] : []),
  ];

  // Check if path is active
  const isActivePath = useCallback((path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }, [location.pathname]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
    setIsMobileProfileOpen(false);
    setIsMenuOpen(false);
    toast({ 
      title: "Logged Out", 
      description: "You have been logged out successfully.",
      type: "success" 
    });
  }, [logout, navigate, toast]);

  // Close all menus
  const closeAllMenus = useCallback(() => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setIsMobileProfileOpen(false);
  }, []);

  // Handle mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    setIsProfileDropdownOpen(false);
    setIsMobileProfileOpen(false);
  }, []);

  // Handle profile dropdown toggle
  const toggleProfileDropdown = useCallback(() => {
    setIsProfileDropdownOpen(prev => !prev);
    setIsMobileProfileOpen(false);
    setIsMenuOpen(false);
  }, []);

  // Handle mobile profile toggle
  const toggleMobileProfile = useCallback(() => {
    setIsMobileProfileOpen(prev => !prev);
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
  }, []);

  // Header background classes
  const headerBgClass = isScrolled
    ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg'
    : 'bg-gray-900 border-b border-gray-800 shadow-sm';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${headerBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Header Row */}
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 group flex-shrink-0" 
              onClick={closeAllMenus}
            >
              <div className="relative">
                <img
                  src={logo}
                  alt="Fast Hire Mela Logo"
                  className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="hidden sm:block text-white font-bold text-lg group-hover:text-blue-400 transition-colors">
                {/* Fast Hire Mela */}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center ml-8">
              {(isAuthenticated ? dashboardNavigation : navigation)
                .filter(item => !item.mobileOnly)
                .map(item => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-4 py-2 rounded-lg transition-all duration-200 group ${
                      isActivePath(item.href)
                        ? 'text-blue-400 bg-gray-800/50'
                        : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800/30'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium text-sm">{item.name}</span>
                    </span>
                    <div
                      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-400 rounded-full transition-all duration-200 ${
                        isActivePath(item.href)
                          ? 'opacity-100 scale-x-100'
                          : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={toggleProfileDropdown}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group"
                    aria-label="User profile menu"
                    aria-expanded={isProfileDropdownOpen}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white shadow-lg group-hover:shadow-xl transition-shadow">
                      {user?.first_name ? user.first_name[0].toUpperCase() : user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">
                      {user?.first_name || user?.name || 'User'}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isProfileDropdownOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Desktop Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 z-[60] animate-scale-in">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm font-medium text-white">
                          {user?.first_name || user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        <span className="text-lg">📊</span>
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        <span className="text-lg">👤</span>
                        Profile
                      </Link>
                      {isPremium && (
                        <Link
                          to="/premium"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        >
                          <span className="text-lg">🌟</span>
                          Premium Features
                        </Link>
                      )}
                      <div className="border-t border-gray-700 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                        >
                          <span className="text-lg">🚪</span>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg border border-gray-600 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              {isAuthenticated && (
                <div className="relative" ref={mobileProfileRef}>
                  <button
                    onClick={toggleMobileProfile}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200"
                    aria-label="User profile menu"
                    aria-expanded={isMobileProfileOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white shadow-lg">
                      {user?.first_name ? user.first_name[0].toUpperCase() : user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  </button>

                  {/* Mobile Profile Dropdown */}
                  {isMobileProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 z-50 animate-scale-in">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        <span className="text-lg">📊</span>
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        <span className="text-lg">👤</span>
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                      >
                        <span className="text-lg">🚪</span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200"
                aria-label="Toggle mobile menu"
                aria-expanded={isMenuOpen}
              >
                <svg
                  className="w-6 h-6 text-gray-300 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div 
              ref={menuRef}
              className="lg:hidden bg-gray-900 border-t border-gray-800 animate-slide-down"
            >
              <div className="px-4 py-4 space-y-2">
                {(isAuthenticated ? dashboardNavigation : navigation).map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                      isActivePath(item.href)
                        ? 'text-blue-400 bg-gray-800/50'
                        : 'text-gray-300 hover:bg-gray-800/30 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                
                {!isAuthenticated && (
                  <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-700">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-lg border border-gray-600 text-center text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-lg bg-blue-600 text-center text-white hover:bg-blue-700 transition-all duration-200 shadow-lg"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
