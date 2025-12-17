import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Building2, FolderTree, Info, Home, 
  LayoutDashboard, User as UserIcon, LogOut, Menu, X,
  ChevronRight, Settings, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/toastUtils';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import logo from '../../assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, isAuthenticated, logout, isPremium } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigation = [
    { name: 'Find Jobs', href: '/jobs', icon: <Briefcase size={16} /> },
    { name: 'Companies', href: '/companies', icon: <Building2 size={16} /> },
    { name: 'Categories', href: '/categories', icon: <FolderTree size={16} /> },
    { name: 'About', href: '/about', icon: <Info size={16} /> },
  ];

  const dashboardNavigation = [
    { name: 'Home', href: '/', icon: <Home size={16} /> },
    { name: 'Jobs', href: '/jobs', icon: <Briefcase size={16} /> },
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Profile', href: '/profile', icon: <UserIcon size={16} /> },
    { name: 'SaveJobs', href: '/saved-jobs', icon: <UserIcon size={16} /> },
    { name: 'Settings', href: '/settings', icon: <Settings size={16} /> },
  ];

  const isActivePath = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    toast({ title: "Logged Out", type: "success" });
  }, [logout, navigate, toast]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-200 border-b border-white/10 bg-black",
      scrolled ? "h-14 shadow-xl" : "h-16" // Decreased heights
    )}>
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6">
        <div className="flex justify-between items-center h-full">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center shrink-0">
            <img src={logo} alt="Logo" className="h-6 w-auto sm:h-8 object-contain" />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full">
            {(isAuthenticated ? dashboardNavigation : navigation).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "relative px-4 py-1.5 rounded-full transition-all text-[12px] font-medium tracking-wide",
                  isActivePath(item.href) ? "text-white" : "text-gray-400 hover:text-white"
                )}
              >
                <span className="relative z-10">{item.name}</span>
                {isActivePath(item.href) && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-blue-600 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isPremium && (
                  <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20">
                    <Zap size={10} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[9px] font-bold text-yellow-500 uppercase">Pro</span>
                  </div>
                )}
                
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-1 p-0.5 pr-1.5 rounded-full border border-white/10 bg-white/5"
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white",
                      isPremium ? "bg-gradient-to-tr from-amber-400 to-yellow-600" : "bg-blue-600"
                    )}>
                      {user?.first_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <ChevronRight size={12} className={cn("text-gray-500 transition-transform", isProfileDropdownOpen && "rotate-90")} />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-[#0F0F0F] border border-white/10 rounded-xl shadow-2xl py-1 overflow-hidden"
                      >
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-[12px] text-gray-400 hover:text-white hover:bg-white/5 transition-colors"><UserIcon size={14} /> Profile</Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-[12px] text-red-400 hover:bg-red-500/5 transition-colors font-bold border-t border-white/5"><LogOut size={14} /> Sign Out</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-3 py-1.5 text-[12px] font-medium text-gray-400 hover:text-white">Login</Link>
                <Link to="/register" className="px-4 py-1.5 rounded-full bg-white text-black text-[12px] font-bold hover:bg-gray-200">Join Free</Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-1.5 text-white bg-white/5 rounded-md border border-white/10"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU - Solid Black Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="lg:hidden fixed inset-0 z-[110] bg-black flex flex-col"
          >
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center h-14 px-4 border-b border-white/10">
              <img src={logo} alt="Logo" className="h-6 w-auto" />
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-white bg-white/5 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-1 p-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Menu</span>
              {(isAuthenticated ? dashboardNavigation : navigation).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-lg border transition-all",
                    isActivePath(item.href) ? "bg-blue-600/10 border-blue-500/50 text-white" : "bg-white/5 border-transparent text-gray-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActivePath(item.href) ? "text-blue-400" : "text-gray-500"}>{item.icon}</span>
                    <span className="font-semibold text-[14px]">{item.name}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-40" />
                </Link>
              ))}
            </div>

            <div className="mt-auto p-4 border-t border-white/10 bg-[#050505]">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => {navigate('/login'); setIsMenuOpen(false);}} variant="outline" className="text-xs py-3">Sign In</Button>
                  <Button onClick={() => {navigate('/register'); setIsMenuOpen(false);}} variant="primary" className="text-xs py-3">Join Free</Button>
                </div>
              ) : (
                <Button onClick={handleLogout} variant="ghost" className="w-full py-3 text-red-500 bg-red-500/5 flex items-center justify-center gap-2">
                  <LogOut size={16} /> Sign Out
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;