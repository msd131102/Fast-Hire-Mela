import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  Users,
  User,
  Tag,
  Settings,
  FileText,
  DollarSign,
  GraduationCap,
  MapPin,
  Store,
  X,
  Menu,
  Home,
  Newspaper,
  CreditCard,
  Shield,
  Bell,
  HelpCircle,
  Image,
  Layout,
  Palette,
  Database,
  Server,
  Globe,
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Users2,
  UserPlus,
  UserMinus,
  ClipboardList,
  ClipboardCheck,
  Filter,
  ArrowUp,
  Download,
  Upload,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Copy,
  Archive,
  RefreshCw,
  Save,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Flame,
  Star,
  Heart,
  Bookmark,
  Share2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Search,
  Sliders,
  Grid,
  List,
  Table,
  PieChart,
  Coins,
  Receipt,
  Calculator,
  Scale,
  Building,
  Truck,
  Package,
  Box,
  Euro,
  PoundSterling,
  Banknote,
  Bitcoin,
  Wallet
} from 'lucide-react';
import { cn } from '../../utils/cn';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    'Main': true,
    'Content Management': true,
    'User Management': true
  });

  // Navigation menu items with categories
  const menuItems = [
    // Main Navigation
    {
      category: 'Main',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Home, description: 'Overview and statistics' },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, description: 'Detailed analytics and reports' },
      ]
    },
    // Content Management
    {
      category: 'Content Management',
      items: [
        { name: 'Jobs', href: '/admin/jobs', icon: Briefcase, description: 'Manage job listings' },
        { name: 'Categories', href: '/admin/categories', icon: Tag, description: 'Manage job categories' },
        { name: 'Companies', href: '/admin/companies', icon: Store, description: 'Manage companies' },
        { name: 'Locations', href: '/admin/locations', icon: MapPin, description: 'Manage job locations' },
      ]
    },
    // User Management
    {
      category: 'User Management',
      items: [
        { name: 'Users', href: '/admin/users', icon: Users, description: 'Manage user accounts' },
        { name: 'User Roles', href: '/admin/roles', icon: Shield, description: 'Manage user roles and permissions' },
        { name: 'Applications', href: '/admin/applications', icon: FileText, description: 'View job applications' },
        { name: 'Referrals', href: '/admin/referrals', icon: UserPlus, description: 'Manage referral program' },
      ]
    },
    // Financial Management
    {
      category: 'Financial',
      items: [
        { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard, description: 'Manage user subscriptions' },
        { name: 'Revenue', href: '/admin/revenue', icon: TrendingUp, description: 'Revenue analytics' },
      ]
    },
    // System Management
    {
      category: 'System',
      items: [
        { name: 'Settings', href: '/admin/settings', icon: Settings, description: 'System settings' },
        { name: 'Notifications', href: '/admin/notifications', icon: Bell, description: 'Manage notifications' },
        { name: 'Logs', href: '/admin/logs', icon: FileText, description: 'System logs' },
        { name: 'Database', href: '/admin/database', icon: Database, description: 'Database management' },
      ]
    },
    // Content & SEO
    {
      category: 'Content & SEO',
      items: [
        { name: 'Pages', href: '/admin/pages', icon: FileText, description: 'Manage static pages' },
        { name: 'Blog', href: '/admin/blog', icon: Newspaper, description: 'Manage blog posts' },
        { name: 'SEO', href: '/admin/seo', icon: Globe, description: 'SEO settings and optimization' },
        { name: 'Media', href: '/admin/media', icon: Image, description: 'Media library' },
      ]
    },
    // Support & Help
    {
      category: 'Support',
      items: [
        { name: 'Support Tickets', href: '/admin/support', icon: HelpCircle, description: 'Customer support tickets' },
        { name: 'FAQ', href: '/admin/faq', icon: Info, description: 'Manage FAQ section' },
        { name: 'Contact Messages', href: '/admin/contact', icon: Mail, description: 'Contact form messages' },
      ]
    }
  ];

  // Toggle section expansion
  const toggleSection = (category) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Check if a menu item is active
  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-indigo-600 rounded-lg p-2">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-500">Fast Hire Mela</p>
              </div>
            </div>
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
            {menuItems.map((section) => (
              <div key={section.category}>
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.category)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 focus:outline-none"
                >
                  <span>{section.category}</span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transform transition-transform duration-200",
                      expandedSections[section.category] && "rotate-90"
                    )}
                  />
                </button>

                {/* Section items */}
                <div className={cn(
                  "mt-2 space-y-1",
                  !expandedSections[section.category] && "hidden"
                )}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                          active
                            ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0",
                          active ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500"
                        )} />
                        <div className="flex-1">
                          <span className="block">{item.name}</span>
                          <span className="text-xs text-gray-500">{item.description}</span>
                        </div>
                        {active && (
                          <ChevronRight className="h-4 w-4 text-indigo-500" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <p className="text-sm text-gray-500 truncate">admin@fasthiremela.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
