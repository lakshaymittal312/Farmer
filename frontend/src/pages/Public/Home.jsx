import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center bg-emerald-50 rounded-2xl p-12 shadow-sm border border-emerald-100 mb-12">
        <h1 className="text-4xl font-extrabold text-emerald-900 mb-4">Direct Farm to Market Access</h1>
        <p className="text-lg text-emerald-700 max-w-2xl mx-auto mb-8">
          Connecting local farmers directly with buyers. Fresh produce, transparent pricing, and zero middleman markup.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/marketplace" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow">
            Explore Marketplace
          </Link>
          <Link to="/register" className="bg-white text-emerald-700 hover:bg-emerald-100 font-semibold px-6 py-3 rounded-lg border border-emerald-300">
            Join as Farmer or Buyer
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
