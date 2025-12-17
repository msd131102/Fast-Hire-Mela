import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/toastUtils';
import { cn } from '../../utils/cn';
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

  // Logic - Preserved Exactly
  useEffect(() => {
    const handleScroll = () => { setIsScrolled(window.scrollY > 10); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileDropdownOpen(false);
      if (mobileProfileRef.current && !mobileProfileRef.current.contains(event.target)) setIsMobileProfileOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

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

  // View Optimization: Smooth Blur and Deep Shadow on Scroll
  const headerBgClass = isScrolled
    ? 'bg-gray-900/80 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
    : 'bg-gray-950/40 backdrop-blur-sm border-b border-transparent';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${headerBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-20 sm:h-24">

            {/* Logo: Enhanced with dynamic glow */}
            <Link
              to="/"
              className="flex items-center gap-3 group flex-shrink-0"
              onClick={closeAllMenus}
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition duration-500"></div>
                <img
                  src={logo}
                  alt="Logo"
                  className="relative h-10 w-auto sm:h-12 object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 shadow-sm" />
              </div>
            </Link>

            {/* Desktop Navigation: Centered & Modern pill style */}
            <nav className="hidden lg:flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
              {(isAuthenticated ? dashboardNavigation : navigation)
                .filter(item => !item.mobileOnly)
                .map(item => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-5 py-2 rounded-xl transition-all duration-300 group ${isActivePath(item.href) ? 'text-white' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    <span className="flex items-center gap-2.5 relative z-10">
                      <span className="text-lg group-hover:rotate-12 transition-transform">{item.icon}</span>
                      <span className="font-bold text-sm tracking-tight">{item.name}</span>
                    </span>
                    {isActivePath(item.href) && (
                      <motion.div
                        layoutId="pill"
                        className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                ))}
            </nav>

            {/* Desktop Actions: Premium Profile Button */}
            <div className="hidden lg:flex items-center gap-5">
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className={`flex items-center gap-3 p-1.5 pr-4 rounded-full border transition-all duration-300 ${isProfileDropdownOpen ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:border-blue-500/50'
                      }`}
                  >
                    <div className={cn(
                      "relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shadow-xl transition-transform active:scale-90",
                      isPremium ? "bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600" : "bg-gradient-to-br from-blue-600 to-indigo-700"
                    )}>
                      {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
                      {isPremium && <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse" />}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-white tracking-wide uppercase">{user?.first_name || 'User'}</p>
                      <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">Member</p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-4 w-64 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden backdrop-blur-3xl"
                      >
                        <div className="px-5 py-4 bg-white/5 border-b border-white/5 mb-1">
                          <p className="text-sm font-black text-white">{user?.first_name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <Link to="/profile" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-all font-bold">👤 My Profile</Link>
                        <Link to="/dashboard" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-all font-bold">📊 Dashboard</Link>
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all font-black">🚪 Logout</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all">Sign in</Link>
                  <Link to="/register" className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black transition-all shadow-xl shadow-blue-900/20 active:scale-95">Join Free</Link>
                </div>
              )}
            </div>

            {/* Mobile Interface: Compact & Modern */}
            <div className="flex lg:hidden items-center gap-3">
              {isAuthenticated && (
                <button onClick={toggleMobileProfile} className="relative p-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg" ref={mobileProfileRef}>
                  <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-xs font-black text-white">
                    {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
                  </div>
                </button>
              )}
              <button onClick={toggleMobileMenu} className={cn("p-3 rounded-2xl transition-all active:scale-90 shadow-lg", isMenuOpen ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300")}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8h16M4 16h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Fullscreen Menu: Optimized for thumb reach */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-0 top-0 bg-gray-900/98 backdrop-blur-2xl z-50 flex flex-col pt-24 px-6 overflow-y-auto"
            >
              <div className="space-y-3">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 ml-2">Navigate Portal</p>
                {(isAuthenticated ? dashboardNavigation : navigation).map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-3xl transition-all active:scale-95",
                      isActivePath(item.href) ? "bg-blue-600 text-white shadow-2xl shadow-blue-900/40" : "bg-white/5 text-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-lg font-black tracking-tight">{item.name}</span>
                    </div>
                    <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}
              </div>

              {!isAuthenticated && (
                <div className="mt-auto mb-10 space-y-4">
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block w-full py-5 rounded-3xl bg-blue-600 text-center text-white font-black text-lg shadow-2xl">Create Account</Link>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full py-5 rounded-3xl bg-white/5 text-center text-gray-300 font-bold border border-white/10">Sign In</Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;