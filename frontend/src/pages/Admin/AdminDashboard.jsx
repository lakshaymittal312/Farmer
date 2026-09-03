import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.data.success) setAnalytics(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Control Panel</h1>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Total System Users</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Farmers / Buyers</p>
            <p className="text-2xl font-bold text-emerald-700">{analytics.totalFarmers} / {analytics.totalBuyers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalProducts}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Platform Revenue</p>
            <p className="text-3xl font-bold text-emerald-700">₹{analytics.totalRevenue}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/users" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-amber-500 transition">
          <h3 className="font-bold text-lg text-gray-900 mb-2">Manage Users</h3>
          <p className="text-sm text-gray-600">View, activate, and deactivate accounts.</p>
        </Link>

        <Link to="/admin/farmers" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-amber-500 transition">
          <h3 className="font-bold text-lg text-gray-900 mb-2">Manage Farmers</h3>
          <p className="text-sm text-gray-600">Review and verify farmer profiles.</p>
        </Link>

        <Link to="/admin/buyers" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-amber-500 transition">
          <h3 className="font-bold text-lg text-gray-900 mb-2">Manage Buyers</h3>
          <p className="text-sm text-gray-600">View registered buyer accounts.</p>
        </Link>

        <Link to="/admin/products" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-amber-500 transition">
          <h3 className="font-bold text-lg text-gray-900 mb-2">Manage Products</h3>
          <p className="text-sm text-gray-600">Inspect system products catalog.</p>
        </Link>

        <Link to="/admin/orders" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-amber-500 transition">
          <h3 className="font-bold text-lg text-gray-900 mb-2">Manage Orders</h3>
          <p className="text-sm text-gray-600">Overview of all orders placed.</p>
        </Link>

        <Link to="/admin/categories" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-amber-500 transition">
          <h3 className="font-bold text-lg text-gray-900 mb-2">Manage Categories</h3>
          <p className="text-sm text-gray-600">Create and edit product categories.</p>
        </Link>

        <Link to="/admin/analytics" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-amber-500 transition">
          <h3 className="font-bold text-lg text-gray-900 mb-2">Reports & Analytics</h3>
          <p className="text-sm text-gray-600">Platform performance and statistics.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
