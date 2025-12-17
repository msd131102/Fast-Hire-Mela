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
  Settings
} from 'lucide-react';
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
  const menuRef = useRef(null);

  // Logic - Preserved Exactly
  useEffect(() => {
    const handleScroll = () => { setIsScrolled(window.scrollY > 20); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileDropdownOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
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

  // Mapping Icons to Data (Data preserved exactly)
  const getIcon = (name) => {
    const icons = {
      'Find Jobs': <Briefcase size={18} />,
      'Companies': <Building2 size={18} />,
      'Categories': <FolderTree size={18} />,
      'About': <Info size={18} />,
      'Contact': <Phone size={18} />,
      'Home': <Home size={18} />,
      'Jobs': <Briefcase size={18} />,
      'Saved Jobs': <Star size={18} />,
      'Dashboard': <LayoutDashboard size={18} />,
      'Profile': <UserIcon size={18} />,
      'Premium': <Crown size={18} />
    };
    return icons[name] || <Info size={18} />;
  };

  const navigation = [
    { name: 'Find Jobs', href: '/jobs', mobileOnly: false },
    { name: 'Companies', href: '/companies', mobileOnly: false },
    { name: 'Categories', href: '/categories', mobileOnly: false },
    { name: 'About', href: '/about', mobileOnly: false },
    { name: 'Contact', href: '/contact', mobileOnly: true },
  ];

  const dashboardNavigation = [
    { name: 'Home', href: '/', mobileOnly: false },
    { name: 'Jobs', href: '/jobs', mobileOnly: false },
    { name: 'Saved Jobs', href: '/saved-jobs', mobileOnly: false },
    { name: 'Dashboard', href: '/dashboard', mobileOnly: false },
    { name: 'Profile', href: '/profile', mobileOnly: false },
    ...(isPremium ? [{ name: 'Premium', href: '/premium', mobileOnly: false }] : []),
  ];

  const isActivePath = useCallback((path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    toast({
      title: "Logged Out",
      description: "Come back soon!",
      type: "success"
    });
  }, [logout, navigate, toast]);

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
          isScrolled 
            ? "py-3 bg-gray-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl" 
            : "py-5 bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Brand Logo */}
            <Link to="/" className="relative group flex items-center gap-3">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                <img src={logo} alt="Logo" className="h-7 w-7 object-contain brightness-0 invert" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-gray-950 shadow-sm" />
              </div>
              <span className="hidden sm:block text-xl font-black text-white tracking-tighter">
                PORTAL<span className="text-blue-500">.</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl ring-1 ring-white/10 backdrop-blur-md">
              {(isAuthenticated ? dashboardNavigation : navigation)
                .filter(item => !item.mobileOnly)
                .map(item => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "relative px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 font-bold text-sm",
                      isActivePath(item.href) ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span className="relative z-10">{getIcon(item.name)}</span>
                    <span className="relative z-10">{item.name}</span>
                    {isActivePath(item.href) && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                  </Link>
                ))}
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={cn(
                      "flex items-center gap-3 p-1 pl-1 pr-3 rounded-full transition-all border",
                      isProfileDropdownOpen ? "bg-white/15 border-white/20" : "bg-white/5 border-white/10 hover:border-white/30"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shadow-inner",
                      isPremium 
                        ? "bg-[conic-gradient(from_180deg_at_50%_50%,#eab308_0deg,#ca8a04_360deg)] ring-2 ring-yellow-500/50" 
                        : "bg-gradient-to-br from-blue-500 to-indigo-600"
                    )}>
                      {user?.first_name?.[0] || 'U'}
                    </div>
                    <span className="hidden md:block text-sm font-bold text-white uppercase tracking-wider">
                      {user?.first_name || 'Account'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-72 bg-gray-900/95 border border-white/10 rounded-3xl shadow-2xl py-3 z-50 backdrop-blur-2xl overflow-hidden"
                      >
                        <div className="px-6 py-4 border-b border-white/5 mb-2 flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl">🚀</div>
                           <div className="flex flex-col">
                             <span className="text-white font-black">{user?.first_name}</span>
                             <span className="text-gray-500 text-xs truncate w-40">{user?.email}</span>
                           </div>
                        </div>
                        <div className="px-3 space-y-1">
                          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 rounded-2xl transition-all font-bold group">
                            <UserIcon size={18} className="group-hover:text-blue-400" /> My Profile
                          </Link>
                          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 rounded-2xl transition-all font-bold group">
                            <LayoutDashboard size={18} className="group-hover:text-blue-400" /> Dashboard
                          </Link>
                          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 rounded-2xl transition-all font-bold group">
                            <Settings size={18} className="group-hover:text-blue-400" /> Settings
                          </Link>
                          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black">
                            <LogOut size={18} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors">Sign in</Link>
                  <Link to="/register" className="px-6 py-2.5 rounded-xl bg-white text-gray-950 text-sm font-black hover:bg-blue-50 transition-all shadow-lg hover:scale-105 active:scale-95">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-3 rounded-2xl bg-white/5 text-white border border-white/10 active:scale-90 transition-all"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Fullscreen Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="lg:hidden fixed inset-0 top-0 bg-gray-950/98 backdrop-blur-3xl z-[90] flex flex-col pt-32 px-6"
            >
              <div className="flex flex-col gap-3">
                <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2 px-4">Navigation</p>
                {(isAuthenticated ? dashboardNavigation : navigation).map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between p-5 rounded-3xl transition-all",
                        isActivePath(item.href) ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "bg-white/5 text-gray-400"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className={cn("p-2 rounded-xl bg-white/10", isActivePath(item.href) && "bg-white/20")}>
                          {getIcon(item.name)}
                        </span>
                        <span className="text-lg font-black">{item.name}</span>
                      </div>
                      <ChevronRight size={20} className="opacity-30" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {!isAuthenticated && (
                <div className="mt-auto mb-12 space-y-4">
                  <Link to="/register" className="block w-full py-5 rounded-3xl bg-blue-600 text-center text-white font-black text-lg shadow-lg">Create Account</Link>
                  <Link to="/login" className="block w-full py-5 rounded-3xl bg-white/5 text-center text-gray-300 font-bold border border-white/10">Sign In</Link>
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