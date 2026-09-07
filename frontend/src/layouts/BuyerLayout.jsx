import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardSidebar from '../components/DashboardSidebar';
import Footer from '../components/Footer';

const BuyerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-slate-100 font-sans">
      <Navbar />
      <div className="flex flex-grow max-w-7xl w-full mx-auto">
        <DashboardSidebar role="buyer" />
        <main className="flex-grow p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BuyerLayout;
