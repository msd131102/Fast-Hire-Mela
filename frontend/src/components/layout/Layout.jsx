import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../common/ScrollToTop';
import { cn } from '../../utils/cn';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 selection:bg-blue-100 selection:text-blue-900">
      {/* Utility to reset scroll position on route change */}
      <ScrollToTop />
      
      {/* Header Wrapper: 
        Uses backdrop-blur for a modern glass effect if the Header component 
        supports transparency, and ensures it stays on top of all content.
      */}
      <header className="fixed top-0 left-0 w-full z-[100] transition-all duration-300">
        <Header />
      </header>

      {/* Main Content Area:
        - pt-[72px] ensures content isn't hidden behind the fixed header.
        - flex-grow ensures the footer is pushed to the bottom even on empty pages.
        - overflow-x-hidden prevents accidental horizontal scrolling on mobile.
      */}
      <main className={cn(
        "flex-grow flex flex-col w-full mx-auto",
        "pt-[72px] sm:pt-[80px]", // Adaptive padding for mobile vs desktop header heights
        "p-0 m-0 overflow-x-hidden"
      )}> 
        <Outlet />
      </main>

      {/* Footer is naturally pushed to the bottom by flex-grow on main */}
      <footer className="w-full border-t border-gray-100 bg-white">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;