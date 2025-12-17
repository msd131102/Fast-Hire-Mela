import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Building2,
  FolderTree,
  Info,
  Phone,
  Home,
  Star,
  LayoutDashboard,
  User as UserIcon,
  Crown,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/toastUtils';
import { cn } from '../../utils/cn';
import logo from '../../assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { user, isAuthenticated, logout, isPremium } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileDropdownOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const navigation = [
    { name: 'Find Jobs', href: '/jobs', icon: <Briefcase size={18} />, mobileOnly: false },
    { name: 'Companies', href: '/companies', icon: <Building2 size={18} />, mobileOnly: false },
    { name: 'Categories', href: '/categories', icon: <FolderTree size={18} />, mobileOnly: false },
    { name: 'About', href: '/about', icon: <Info size={18} />, mobileOnly: false },
    { name: 'Contact', href: '/contact', icon: <Phone size={18} />, mobileOnly: true },
  ];

  const dashboardNavigation = [
    { name: 'Home', href: '/', icon: <Home size={18} />, mobileOnly: false },
    { name: 'Jobs', href: '/jobs', icon: <Briefcase size={18} />, mobileOnly: false },
    { name: 'Saved Jobs', href: '/saved-jobs', icon: <Star size={18} />, mobileOnly: false },
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} />, mobileOnly: false },
    { name: 'Profile', href: '/profile', icon: <UserIcon size={18} />, mobileOnly: false },
    ...(isPremium ? [{ name: 'Premium', href: '/premium', icon: <Crown size={18} />, mobileOnly: false }] : []),
  ];

  const isActivePath = useCallback((path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    toast({ title: "Logged Out", description: "See you again soon!", type: "success" });
  }, [logout, navigate, toast]);

  // Background state: Always Pure Black
  const headerBgClass = 'bg-black border-b border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.8)]';

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out", headerBgClass)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-20 sm:h-24">

          {/* Brand Logo: Original Style Restored */}
          <Link to="/" className="flex items-center gap-3 group shrink-0" onClick={() => setIsMenuOpen(false)}>
            <div className="relative">
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-auto sm:h-12 object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black" />
            </div>
            {/* <div className="hidden sm:block">
              <span className="text-xl font-black text-white tracking-tighter block leading-none">PORTAL</span>
              <span className="text-[9px] font-bold text-blue-500 tracking-[0.2em] uppercase opacity-80">Workspace</span>
            </div> */}
          </Link>

          {/* Desktop Nav: Elegant Glass Pill */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
            {(isAuthenticated ? dashboardNavigation : navigation)
              .filter(item => !item.mobileOnly)
              .map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "relative px-5 py-2.5 rounded-xl transition-all duration-300 group flex items-center gap-2.5 font-bold text-sm",
                    isActivePath(item.href) ? "text-white" : "text-gray-400 hover:text-white"
                  )}
                >
                  <span className="relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                  <span className="relative z-10 tracking-tight">{item.name}</span>
                  {isActivePath(item.href) && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
          </nav>

          {/* Right Section: Profile & Actions */}
          <div className="hidden lg:flex items-center gap-5">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className={cn(
                    "flex items-center gap-3 p-1.5 pr-4 rounded-full border transition-all duration-300",
                    isProfileDropdownOpen ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10 hover:border-blue-500/50"
                  )}
                >
                  <div className={cn(
                    "relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shadow-xl",
                    isPremium
                      ? "bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600"
                      : "bg-gradient-to-br from-blue-600 to-indigo-700"
                  )}>
                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                    {isPremium && <div className="absolute inset-0 rounded-full border border-white/30 animate-pulse" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-white tracking-wide uppercase leading-tight">{user?.name || 'User'}</p>
                    <p className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">
                      {isPremium ? 'Premium' : 'Member'}
                    </p>
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-4 w-64 bg-black border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 z-50 backdrop-blur-3xl overflow-hidden"
                    >
                      <div className="px-5 py-4 bg-white/[0.02] border-b border-white/5 mb-1">
                        <p className="text-sm font-black text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-all font-bold"><UserIcon size={16} /> My Profile</Link>
                      <Link to="/dashboard" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-all font-bold"><LayoutDashboard size={16} /> Dashboard</Link>
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all font-black"><LogOut size={16} /> Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-all">Sign in</Link>
                <Link to="/register" className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black transition-all shadow-xl shadow-blue-900/20 active:scale-95">Join Free</Link>
              </div>
            )}
          </div>

          {/* Mobile UI */}
          <div className="flex lg:hidden items-center gap-3">
            {isAuthenticated && (
              <Link to="/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xs font-black text-white shadow-lg border border-white/10">
                {user?.name?.[0]?.toUpperCase()}
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn("p-3 rounded-xl transition-all active:scale-90", isMenuOpen ? "bg-white text-black" : "bg-white/5 text-white")}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 top-0 bg-black z-50 flex flex-col pt-24 px-6 overflow-y-auto"
          >
            {/* Close (X) button for mobile menu */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-50"
              aria-label="Close menu"
            >
              <X size={28} />
            </button>
            <div className="space-y-3 mt-4">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 ml-2">Navigation</p>
              {(isAuthenticated ? dashboardNavigation : navigation).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-2xl transition-all",
                    isActivePath(item.href) ? "bg-blue-600 text-white shadow-xl shadow-blue-600/40" : "bg-white/5 text-gray-400 border border-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-lg font-black tracking-tight">{item.name}</span>
                  </div>
                  <ChevronRight size={18} className="opacity-30" />
                </Link>
              ))}
            </div>

            {!isAuthenticated && (
              <div className="mt-auto mb-10 space-y-4">
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block w-full py-5 rounded-2xl bg-blue-600 text-center text-white font-black text-lg">Create Account</Link>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full py-5 rounded-2xl bg-white/5 text-center text-gray-300 font-bold border border-white/10">Sign In</Link>
              </div>
            )}
            {isAuthenticated && (
              <button onClick={handleLogout} className="mt-auto mb-10 w-full py-5 rounded-2xl bg-red-500/10 text-red-500 font-black flex items-center justify-center gap-3">
                <LogOut size={20} /> Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;