import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ReportsAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.data.success) setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading analytics report...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Platform Reports & Analytics</h1>

      {data && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6 border-b border-gray-100 pb-6">
            <div>
              <p className="text-sm font-semibold text-gray-500">Registered Users</p>
              <p className="text-4xl font-extrabold text-gray-900">{data.totalUsers}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-500">Total Revenue (Delivered Orders)</p>
              <p className="text-4xl font-extrabold text-emerald-700">₹{data.totalRevenue}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Farmers</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalFarmers}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Buyers</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalBuyers}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Active Products</p>
              <p className="text-2xl font-bold text-emerald-700">{data.activeProducts} / {data.totalProducts}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Delivered Orders</p>
              <p className="text-2xl font-bold text-emerald-700">{data.deliveredOrders} / {data.totalOrders}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;
