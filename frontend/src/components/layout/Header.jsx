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

  // Handle scroll effect - Preserved
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside for dropdowns - Preserved
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (mobileProfileRef.current && !mobileProfileRef.current.contains(event.target)) {
        setIsMobileProfileOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key - Preserved
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

  // Handle body scroll lock - Preserved
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  // Navigation items - Preserved
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

  const isActivePath = useCallback((path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }, [location.pathname]);

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

  const closeAllMenus = useCallback(() => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setIsMobileProfileOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    setIsProfileDropdownOpen(false);
    setIsMobileProfileOpen(false);
  }, []);

  const toggleProfileDropdown = useCallback(() => {
    setIsProfileDropdownOpen(prev => !prev);
    setIsMobileProfileOpen(false);
    setIsMenuOpen(false);
  }, []);

  const toggleMobileProfile = useCallback(() => {
    setIsMobileProfileOpen(prev => !prev);
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
  }, []);

  // Visual classes
  const headerBgClass = isScrolled
    ? 'bg-gray-900/90 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
    : 'bg-gray-900 border-b border-gray-800';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Section */}
            <Link 
              to="/" 
              className="flex items-center gap-3 group flex-shrink-0" 
              onClick={closeAllMenus}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <img
                  src={logo}
                  alt="Fast Hire Mela Logo"
                  className="relative h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
              </div>
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center space-x-2 flex-1 justify-center mx-8">
              {(isAuthenticated ? dashboardNavigation : navigation)
                .filter(item => !item.mobileOnly)
                .map(item => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                      isActivePath(item.href)
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`text-xl transition-transform duration-300 group-hover:scale-125 ${isActivePath(item.href) ? 'scale-110' : ''}`}>
                        {item.icon}
                      </span>
                      <span className="font-semibold text-sm tracking-wide">{item.name}</span>
                    </span>
                    {isActivePath(item.href) && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                      />
                    )}
                  </Link>
                ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={toggleProfileDropdown}
                    className={`flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full border transition-all duration-300 ${
                      isProfileDropdownOpen ? 'bg-gray-800 border-gray-600' : 'bg-gray-800/40 border-gray-700 hover:border-gray-500'
                    }`}
                    aria-label="User profile menu"
                    aria-expanded={isProfileDropdownOpen}
                  >
                    <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 ${isPremium ? 'border-yellow-400' : 'border-transparent'}`}>
                      {user?.first_name ? user.first_name[0].toUpperCase() : user?.name ? user.name[0].toUpperCase() : 'U'}
                      {isPremium && <span className="absolute -top-1 -right-1 text-[10px]">⭐</span>}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-xs font-bold text-white leading-none mb-1">
                        {user?.first_name || user?.name || 'User'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium leading-none">Account Settings</p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-4 w-64 bg-gray-900 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 z-50 overflow-hidden animate-scale-in origin-top-right backdrop-blur-xl">
                      <div className="px-5 py-4 bg-white/5 border-b border-white/5 mb-1">
                        <p className="text-sm font-bold text-white mb-0.5">{user?.first_name || user?.name || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate font-medium">{user?.email || 'user@example.com'}</p>
                        {isPremium && (
                          <span className="inline-block mt-2 px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-500 text-[10px] font-black uppercase tracking-wider border border-yellow-400/20">
                            Premium Member
                          </span>
                        )}
                      </div>
                      {[
                        { label: 'Dashboard', icon: '📊', href: '/dashboard' },
                        { label: 'Profile', icon: '👤', href: '/profile' },
                        ...(isPremium ? [{ label: 'Premium Features', icon: '🌟', href: '/premium' }] : []),
                      ].map((link) => (
                        <Link
                          key={link.label}
                          to={link.href}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors font-medium"
                        >
                          <span className="text-lg">{link.icon}</span>
                          {link.label}
                        </Link>
                      ))}
                      <div className="border-t border-white/5 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors font-bold"
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
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all duration-300 shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:shadow-blue-500/40"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Navigation Interface */}
            <div className="flex lg:hidden items-center gap-3">
              {isAuthenticated && (
                <div className="relative" ref={mobileProfileRef}>
                  <button
                    onClick={toggleMobileProfile}
                    className="flex items-center p-1 rounded-full border-2 border-gray-700 hover:border-blue-500 transition-colors"
                    aria-label="User profile menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white">
                      {user?.first_name ? user.first_name[0].toUpperCase() : user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  </button>

                  {isMobileProfileOpen && (
                    <div className="absolute right-0 mt-4 w-52 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-scale-in origin-top-right">
                      <Link to="/dashboard" onClick={() => setIsMobileProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 font-bold">
                        <span className="text-lg">📊</span> Dashboard
                      </Link>
                      <Link to="/profile" onClick={() => setIsMobileProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 font-bold">
                        <span className="text-lg">👤</span> Profile
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-400 font-black">
                        <span className="text-lg">🚪</span> Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={toggleMobileMenu}
                className={`p-2.5 rounded-xl transition-all duration-300 ${isMenuOpen ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Fullscreen Menu */}
          {isMenuOpen && (
            <div 
              ref={menuRef}
              className="lg:hidden fixed inset-x-0 top-20 bg-gray-900/95 backdrop-blur-2xl border-t border-white/5 h-[calc(100vh-5rem)] overflow-y-auto animate-slide-down"
            >
              <div className="px-6 py-8 space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</p>
                {(isAuthenticated ? dashboardNavigation : navigation).map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base transition-all duration-300 ${
                      isActivePath(item.href)
                        ? 'text-white bg-blue-600 shadow-lg shadow-blue-600/20'
                        : 'text-gray-300 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-bold tracking-wide">{item.name}</span>
                  </Link>
                ))}
                
                {!isAuthenticated && (
                  <div className="grid grid-cols-1 gap-4 mt-8 pt-8 border-t border-white/5">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-6 py-4 rounded-2xl border border-gray-700 text-center text-white font-bold bg-white/5"
                    >
                      Sign in to Account
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-6 py-4 rounded-2xl bg-blue-600 text-center text-white font-black shadow-xl"
                    >
                      Create Free Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      {/* Spacer to prevent content from jumping behind fixed header */}
      <div className="h-20"></div>
    </>
  );
};

export default Header;