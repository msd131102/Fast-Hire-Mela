import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../common/ScrollToTop';
import { cn } from '../../utils/cn';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] selection:bg-blue-600 selection:text-white">
      {/* Utility to reset scroll position on route change */}
      <ScrollToTop />
      
      {/* Header Wrapper: 
          Reduced height wrapper to match the sleeker Header component.
          The z-index ensures dropdowns stay above main content.
      */}
      <header className="fixed top-0 left-0 w-full z-[100]">
        <Header />
      </header>

      {/* Main Content Area:
        - pt-16 (64px) exactly matches a sleek "Pro" header height.
        - Using 'min-h-[calc(100vh-64px)]' ensures the content fills the screen perfectly.
      */}
      <main className={cn(
        "flex-grow flex flex-col w-full mx-auto",
        "pt-16 sm:pt-20", // Matches the condensed Header heights
        "p-0 m-0 overflow-x-hidden"
      )}> 
        <Outlet />
      </main>

      {/* Footer: Clean, minimalist separation */}
      <footer className="w-full border-t border-black/[0.03] bg-white">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;