import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../common/ScrollToTop';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100 overflow-x-hidden">
      {/* Ensures page starts at top on route change */}
      <ScrollToTop />
      
      {/* Header Wrapper 
          Z-index 50 ensures it stays above all page content.
          The Header component itself is fixed, so this wrapper maintains structural integrity.
      */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Main Content Area
          pt-[72px] (Mobile) and lg:pt-[80px] (Desktop) 
          Matches the exact height of the header to prevent content overlap.
      */}
      <main className="flex-grow flex flex-col w-full mx-auto pt-[64px] lg:pt-[80px] transition-all duration-300"> 
        <div className="flex-grow w-full animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Footer stays at the bottom of the flex column */}
      <Footer />
    </div>
  );
};

export default Layout;