import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Sprout, ShoppingBag, Package, DollarSign, ArrowUpRight, BarChart3, Layers, FileText } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { LineChart, DonutChart } from '../../components/ui/Charts';
import { ErrorState } from '../../components/ui/EmptyState';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  const donutData = [
    { label: 'Farmers', value: analytics?.totalFarmers || 5, color: '#10B981' },
    { label: 'Buyers', value: analytics?.totalBuyers || 12, color: '#14B8A6' },
    { label: 'Admins', value: 1, color: '#F59E0B' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-100">Admin Control Panel</h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-700">
                System SuperAdmin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Platform management, verification queue, and transaction monitoring</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-dark-card border border-dark-border rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchAnalytics} />
        ) : (
          <>
            {/* KPI STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 shadow-dark-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total System Users</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-100">{analytics?.totalUsers || 0}</p>
                <p className="text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-bold">{analytics?.totalFarmers || 0} Farmers</span> • {analytics?.totalBuyers || 0} Buyers
                </p>
              </div>

              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 shadow-dark-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Listed Products</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-primary-500/30 flex items-center justify-center text-primary-400">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-100">{analytics?.totalProducts || 0}</p>
                <p className="text-[11px] text-slate-400">Active marketplace produce</p>
              </div>

              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 shadow-dark-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total Orders Placed</span>
                  <div className="w-9 h-9 rounded-xl bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-100">{analytics?.totalOrders || 0}</p>
                <p className="text-[11px] text-slate-400">Processed across platform</p>
              </div>

              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 shadow-dark-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Platform GMV Revenue</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-primary-500/30 flex items-center justify-center text-primary-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-primary-400">₹{analytics?.totalRevenue || 0}</p>
                <p className="text-[11px] text-slate-400">Gross transaction volume</p>
              </div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <LineChart
                  title="Platform Monthly User Growth"
                  data={[10, 25, 40, 65, 90, 140, 210]}
                  labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']}
                  color="#F59E0B"
                />
              </div>

              <div className="lg:col-span-5">
                <DonutChart title="User Role Distribution" data={donutData} />
              </div>
            </div>

            {/* QUICK MANAGEMENT TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                to="/admin/farmers"
                className="glass-panel-interactive p-6 rounded-3xl space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-primary-400 mb-2">
                  <Sprout className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 text-base group-hover:text-primary-400 transition">
                  Farmer Verification Queue
                </h3>
                <p className="text-xs text-slate-400">Review pending farm applications, credentials, and verification badges.</p>
              </Link>

              <Link
                to="/admin/users"
                className="glass-panel-interactive p-6 rounded-3xl space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 text-base group-hover:text-amber-400 transition">
                  Manage System Users
                </h3>
                <p className="text-xs text-slate-400">Activate, deactivate, and inspect registered user accounts.</p>
              </Link>

              <Link
                to="/admin/categories"
                className="glass-panel-interactive p-6 rounded-3xl space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-500/40 flex items-center justify-center text-teal-400 mb-2">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 text-base group-hover:text-teal-400 transition">
                  Crop Categories
                </h3>
                <p className="text-xs text-slate-400">Create and modify marketplace produce category taxonomy.</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
