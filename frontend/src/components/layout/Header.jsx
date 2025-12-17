import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Building2, FolderTree, Info, Phone, Home, Star,
  LayoutDashboard, User as UserIcon, Crown, LogOut, Menu, X,
  ChevronRight, Settings, Bell, Zap
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

  // Handle scroll effect for a sleeker look on movement
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

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
  ];

  const isActivePath = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    toast({ title: "Logged Out", description: "See you again soon!", type: "success" });
  }, [logout, navigate, toast]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b",
      scrolled 
        ? "h-16 bg-black/80 backdrop-blur-xl border-white/10 shadow-2xl" 
        : "h-20 bg-black border-transparent"
    )}>
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-8">
        <div className="flex justify-between items-center h-full">
          
          {/* LOGO SECTION */}
          <Link to="/" className="relative flex items-center group shrink-0">
            <div className="relative flex items-center justify-center">
               <img src={logo} alt="Logo" className="h-8 w-auto sm:h-10 object-contain" />
               {isPremium && (
                 <div className="absolute -inset-2 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
               )}
            </div>
          </Link>

          {/* DESKTOP NAVIGATION - Sleek Pill Design */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-full">
            {(isAuthenticated ? dashboardNavigation : navigation).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "relative px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 text-[13px] font-medium tracking-wide",
                  isActivePath(item.href) ? "text-white" : "text-gray-400 hover:text-white"
                )}
              >
                <span className="relative z-10">{item.name}</span>
                {isActivePath(item.href) && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* ACTION SECTION */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Premium Badge (Desktop Only) */}
                {isPremium && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-yellow-500/20">
                    <Zap size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-tighter">Pro Plan</span>
                  </div>
                )}
                
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="group flex items-center gap-2 p-0.5 pr-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner",
                      isPremium ? "bg-gradient-to-tr from-amber-400 to-yellow-600" : "bg-blue-600"
                    )}>
                      {user?.first_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <ChevronRight size={14} className={cn("text-gray-500 transition-transform", isProfileDropdownOpen && "rotate-90")} />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium"><UserIcon size={14} /> Profile</Link>
                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium"><Settings size={14} /> Dashboard</Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/5 transition-colors font-bold"><LogOut size={14} /> Sign Out</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/login" className="px-4 py-2 text-[13px] font-medium text-gray-400 hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="px-5 py-2 rounded-full bg-white text-black text-[13px] font-bold hover:bg-gray-200 transition-all active:scale-95">Join Free</Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white bg-white/5 rounded-lg border border-white/10"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU - Modern Fullscreen Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-0 z-[90] bg-black pt-24 px-6 flex flex-col"
          >
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 px-2">Navigation</span>
              {(isAuthenticated ? dashboardNavigation : navigation).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                    isActivePath(item.href) ? "bg-blue-600/10 border-blue-500/50 text-white" : "bg-white/5 border-white/5 text-gray-400"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className={isActivePath(item.href) ? "text-blue-400" : "text-gray-500"}>{item.icon}</span>
                    <span className="font-bold tracking-tight text-[15px]">{item.name}</span>
                  </div>
                  <ChevronRight size={16} className="opacity-20" />
                </Link>
              ))}
            </div>

            <div className="mt-auto mb-10 space-y-3">
              {!isAuthenticated ? (
                <>
                  <Button 
                    onClick={() => {
                      navigate('/register');
                      setIsMenuOpen(false);
                    }} 
                    className="w-full py-4 rounded-xl bg-blue-600 text-center text-white font-bold"
                    variant="primary"
                  >
                    Get Started
                  </Button>
                  <Button 
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }} 
                    className="w-full py-4 rounded-xl border border-white/10 text-center text-gray-300 font-bold"
                    variant="outline"
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleLogout} 
                  className="w-full py-4 rounded-xl bg-red-500/10 text-red-500 font-bold flex items-center justify-center gap-2"
                  variant="ghost"
                >
                  <LogOut size={18} /> Logout
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
