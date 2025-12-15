import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../common/ScrollToTop';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col p-0 m-0">
      <ScrollToTop />
      
      {/* Remove default spacing caused by header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Push content below header height */}
      <main className="flex-grow p-0 m-0 pt-[72px]"> 
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
