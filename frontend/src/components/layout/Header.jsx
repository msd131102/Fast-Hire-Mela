import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Building2, FolderTree, Info, Home,
  LayoutDashboard, User as UserIcon, LogOut, Menu, X,
  ChevronRight, Settings, Zap,
  User, Gift,
  PhoneCallIcon,
  Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../ui/toastUtils';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import AntiGravityLogo from '../common/AntiGravityLogo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, isAuthenticated, logout, isPremium } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
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
    { name: 'User Guidance', href: '/user-guidance', icon: <User size={16} /> },
    { name: 'About', href: '/about', icon: <Info size={16} /> },
    { name: 'Referrals', href: '/premium/referral', icon: <Gift size={16} /> }
  ];

  const dashboardNavigation = [
    { name: 'Home', href: '/', icon: <Home size={16} /> },
    { name: 'Jobs', href: '/jobs', icon: <Briefcase size={16} /> },
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Profile', href: '/profile', icon: <UserIcon size={16} /> },
    { name: 'SaveJobs', href: '/saved-jobs', icon: <UserIcon size={16} /> },
    { name: 'Referrals', href: '/premium/referral', icon: <Gift size={16} /> },
    { name: 'Contact', href: '/contact', icon: <PhoneCallIcon size={16} /> }
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
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
      scrolled ? "h-16 bg-surface/90 backdrop-blur-sm border-b border-border shadow-soft" : "h-20 bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6">
        <div className="flex justify-between items-center h-full">

          {/* LOGO */}
          <Link to="/" className="flex items-center shrink-0">
            <AntiGravityLogo variant="compact" className="h-6 w-auto sm:h-8" />
          </Link>

          {/* DESKTOP NAV (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center gap-2">
            {(isAuthenticated ? dashboardNavigation : navigation).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "relative px-4 py-2 rounded-2xl transition-all text-sm font-semibold tracking-wide",
                  isActivePath(item.href) ? "text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10" : "text-muted hover:text-text hover:bg-surface/50 dark:hover:bg-surface/50"
                )}
              >
                <span className="relative z-10">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* ACTIONS AREA */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full border border-border bg-surface text-muted hover:text-primary-500 hover:shadow-adventure transition-all"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* MOBILE ONLY ACTIONS (Shown when LOGGED IN) */}
            {isAuthenticated && (
              <div className="flex lg:hidden items-center gap-2 mr-1">
                {/* Added Jobs Icon Link below */}
                <Link to="/jobs" className="p-1.5 text-muted bg-surface rounded-full border border-border">
                  <Briefcase size={16} />
                </Link>

                <Link to="/dashboard" className="p-1.5 text-muted bg-surface rounded-full border border-border">
                  <LayoutDashboard size={16} />
                </Link>

                {/* Added Contact Icon here */}
                <Link to="/contact" className="p-1.5 text-muted bg-surface rounded-full border border-border">
                  <PhoneCallIcon size={16} />
                </Link>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center p-0.5 rounded-full border border-border bg-surface"
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-text shadow-glow-primary",
                      isPremium ? "bg-gradient-to-tr from-warning-400 to-warning-600" : "bg-primary-600"
                    )}>
                      {user?.first_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* MOBILE ONLY ACTIONS (Shown when NOT LOGGED IN) */}
            {!isAuthenticated && (
              <div className="flex lg:hidden items-center gap-2 mr-1">
                <Link to="/login" className="px-3 py-2 text-xs font-semibold text-text hover:text-primary-500 transition-colors">Log In</Link>
                <Link to="/register" className="px-4 py-2 bg-primary-500 hover:bg-primary-400 text-white text-xs font-bold rounded-xl shadow-adventure transition-all">Join</Link>
              </div>
            )}

            {/* DESKTOP ACTIONS (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  {isPremium && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning-500/10 border border-warning-500/20 text-warning-600">
                      <Zap size={12} className="fill-current" />
                      <span className="text-xs font-bold uppercase tracking-wider">Pro</span>
                    </div>
                  )}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-border bg-surface hover:shadow-adventure transition-all"
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm",
                        isPremium ? "bg-warning-500" : "bg-primary-500"
                      )}>
                        {user?.first_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <ChevronRight size={14} className={cn("text-muted transition-transform", isProfileDropdownOpen && "rotate-90")} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="px-4 py-2.5 text-sm font-semibold text-text hover:text-primary-500 transition-colors">Log In</Link>
                  <Link to="/register" className="px-5 py-2.5 bg-primary-500 text-white text-sm font-bold rounded-2xl hover:bg-primary-400 shadow-adventure transition-all hover:-translate-y-0.5">Start Quest</Link>
                </div>
              )}
            </div>

            {/* Profile Dropdown (Shared for both Desktop and Mobile Profile Clicks) */}
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-4 lg:right-auto mt-2 w-56 bg-surface border border-border rounded-2xl shadow-adventure py-2 overflow-hidden z-[110]"
                  style={{ top: scrolled ? '3.5rem' : '4rem' }}
                >
                  <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-text hover:text-primary-500 hover:bg-primary-50 transition-colors"><UserIcon size={16} className="text-muted" /> Character Sheet</Link>
                  <Link to="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-text hover:text-primary-500 hover:bg-primary-50 transition-colors"><LayoutDashboard size={16} className="text-muted" /> Tavern Menu</Link>
                  <div className="border-t border-border mt-1 pt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-danger-500 hover:bg-danger-50 hover:text-danger-600 transition-colors"><LogOut size={16} /> Retreat</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-1.5 text-text bg-surface rounded-md border border-border"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="lg:hidden fixed inset-0 z-[120] bg-background flex flex-col"
          >
            <div className="flex justify-between items-center h-14 px-4 border-b border-border">
              <AntiGravityLogo variant="compact" className="h-6 w-auto" />
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-text bg-surface rounded-full hover:bg-secondary-800 transition-colors"><X size={20} /></button>
            </div>

            <div className="flex flex-col gap-1 p-4 overflow-y-auto">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 px-2">Menu</span>
              {(isAuthenticated ? dashboardNavigation : navigation).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-xl border transition-all",
                  isActivePath(item.href) ? "bg-primary-500/10 border-primary-500/50 text-primary-600 dark:text-primary-400 shadow-glow-card" : "bg-surface border-transparent text-muted hover:text-text"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActivePath(item.href) ? "text-primary-600 dark:text-primary-400" : "text-muted"}>{item.icon}</span>
                    <span className="font-semibold text-[14px]">{item.name}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-40" />
                </Link>
              ))}
            </div>

            <div className="mt-auto p-4 border-t border-border bg-surface">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} variant="outline" className="text-xs py-3">Sign In</Button>
                  <Button onClick={() => { navigate('/register'); setIsMenuOpen(false); }} variant="primary" className="text-xs py-3">Join Free</Button>
                </div>
              ) : (
                <Button onClick={handleLogout} variant="ghost" className="w-full py-3 text-danger-500 bg-danger-500/10 hover:bg-danger-500/20 flex items-center justify-center gap-2">
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
