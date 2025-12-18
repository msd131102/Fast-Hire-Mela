import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Linkedin,
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B0F19] text-gray-300 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Company Info */}
          <div className="flex flex-col space-y-6">
            <Link to="/" className="inline-block transition-transform duration-300 hover:scale-105">
              <img src={logo} alt="FastHireMela Logo" className="h-14 sm:h-16 w-auto" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Your trusted platform for finding the best job opportunities.
              Connect with top companies and accelerate your career journey.
            </p>
            <div className="flex items-center space-x-3">
              <a 
                href="https://www.linkedin.com/company/fasthiremela/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-10 h-10 bg-gray-800/50 rounded-xl hover:bg-blue-600 transition-all duration-300 shadow-sm"
              >
                <Linkedin className="h-5 w-5 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Browse Jobs', path: '/jobs' },
                { name: 'Top Companies', path: '/companies' },
                { name: 'Job Categories', path: '/categories' },
                { name: 'Premium Features', path: '/premium' },
                { name: 'Dashboard', path: '/dashboard' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-200 text-sm inline-flex items-center"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              Support
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Contact Us', path: '/contact' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'FAQ', path: '/faq' },
                { name: 'User Guidance', path: '/user-guidance' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-200 text-sm inline-flex items-center"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              Contact Info
            </h3>
            <div className="space-y-5">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/10 p-2 rounded-lg mt-0.5">
                  <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0" />
                </div>
                <address className="text-gray-400 text-sm not-italic leading-relaxed">
                  Kakinada, Andhra Pradesh, India<br />
                  <span className="font-semibold text-gray-300">PIN: 533003</span>
                </address>
              </div>
              
              <div className="flex items-center space-x-4 group">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-gray-400 text-sm break-all group-hover:text-blue-400 transition-colors">fasthiremela@gmail.com</p>
              </div>

              <div className="flex items-center space-x-4 group">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-gray-400 text-sm group-hover:text-blue-400 transition-colors">www.fasthiremela.online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="relative overflow-hidden bg-gray-800/30 border border-gray-700/50 rounded-3xl p-8 sm:p-10 mb-12">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto lg:mx-0">
                Subscribe to our newsletter for the latest job updates and career tips directly in your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-5 py-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm shadow-inner"
                />
              </div>
              <a
                href="https://www.linkedin.com/company/fasthiremela"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <button className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all font-bold text-sm tracking-wide">
                  Subscribe
                </button>
              </a>
            </div>
          </div>
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 text-sm font-medium">
              © {currentYear} <span className="text-blue-500">FastHireMela.online</span> | Jobs Across India
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500 italic">
                Made with <span className="text-red-500 animate-pulse">❤️</span> for job seekers
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;