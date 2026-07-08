import React from 'react';
import { Link } from 'react-router-dom';
import AntiGravityLogo from '../common/AntiGravityLogo';
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
    <footer className="bg-surface text-text border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Company Info */}
          <div className="flex flex-col space-y-6">
            <Link to="/" className="inline-block transition-transform duration-300 hover:scale-105">
              <AntiGravityLogo variant="compact" className="h-14 sm:h-16 w-auto" />
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              Your trusted platform for finding the best job opportunities.
              Connect with top companies and accelerate your career journey.
            </p>
            <div className="flex items-center space-x-3">
              <a
                href="https://www.linkedin.com/company/fasthiremela/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-10 h-10 bg-surface rounded-xl hover:bg-primary-600 hover:shadow-adventure transition-all duration-300 shadow-sm border border-border"
              >
                <Linkedin className="h-5 w-5 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-text font-game text-sm mb-6 flex items-center tracking-wider uppercase font-bold">
              <span className="w-2 h-2 bg-primary-400 mr-3 rounded-full"></span>
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
                    className="text-muted hover:text-primary-400 hover:translate-x-1 transition-all duration-200 text-sm inline-flex items-center font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-text font-game text-sm mb-6 flex items-center tracking-wider uppercase font-bold">
              <span className="w-2 h-2 bg-primary-400 mr-3 rounded-full"></span>
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
                    className="text-muted hover:text-primary-400 hover:translate-x-1 transition-all duration-200 text-sm inline-flex items-center font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-text font-game text-sm mb-6 flex items-center tracking-wider uppercase font-bold">
              <span className="w-2 h-2 bg-primary-400 mr-3 rounded-full"></span>
              Contact Info
            </h3>
            <div className="space-y-5">
              <div className="flex items-start space-x-4">
                <div className="bg-primary-50 border border-primary-100 p-2 rounded-xl mt-0.5 shadow-sm">
                  <MapPin className="h-5 w-5 text-primary-500 flex-shrink-0" />
                </div>
                <address className="text-muted text-sm not-italic leading-relaxed">
                  Kakinada, Andhra Pradesh, India<br />
                  <span className="font-semibold text-muted">PIN: 533003</span>
                </address>
              </div>

              <div className="flex items-center space-x-4 group">
                <div className="bg-primary-50 border border-primary-100 p-2 rounded-xl shadow-sm">
                  <Mail className="h-5 w-5 text-primary-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-muted text-sm break-all group-hover:text-primary-400 transition-colors">fasthiremela@gmail.com</p>
              </div>

              <div className="flex items-center space-x-4 group">
                <div className="bg-primary-50 border border-primary-100 p-2 rounded-xl shadow-sm">
                  <Globe className="h-5 w-5 text-primary-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-muted text-sm group-hover:text-primary-400 transition-colors">www.fasthiremela.online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="relative overflow-hidden bg-background border border-border rounded-3xl p-8 sm:p-10 mb-12 shadow-adventure">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-game font-bold tracking-wide text-text mb-2">Stay Updated</h3>
              <p className="text-muted text-lg max-w-md mx-auto lg:mx-0">
                Subscribe to our newsletter for the latest job updates and career tips directly in your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-5 py-3.5 bg-surface border-2 border-border rounded-2xl text-text placeholder-muted focus:outline-none focus:border-primary-400 transition-all shadow-sm"
                />
              </div>
              <a
                href="https://www.linkedin.com/company/fasthiremela"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <button className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 text-text rounded-xl hover:bg-primary-500 hover:shadow-adventure active:scale-95 transition-all font-bold text-sm tracking-wide">
                  Subscribe
                </button>
              </a>
            </div>
          </div>
          {/* Subtle decoration */}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted text-sm font-medium">
              © {currentYear} <span className="text-primary-500 font-bold">FastHireMela.online</span> | Jobs Across India
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted italic">
                Made with <span className="text-danger-500 animate-pulse">❤️</span> for job seekers
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
