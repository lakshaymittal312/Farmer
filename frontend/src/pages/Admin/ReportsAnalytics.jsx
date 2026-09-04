import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, ShoppingBag, Shield } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { LineChart, DonutChart } from '../../components/ui/Charts';
import { ErrorState } from '../../components/ui/EmptyState';

const ReportsAnalytics = () => {
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
      setError(e.message || 'Failed to load analytics summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto">
        <div className="border-b border-dark-border pb-6">
          <h1 className="text-3xl font-black text-slate-100">Reports & Analytics Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">Platform gross merchandise volume, crop trading metrics, and user growth</p>
        </div>

        {loading ? (
          <div className="bg-dark-card border border-dark-border rounded-3xl h-96 animate-pulse" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchAnalytics} />
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-2">
                <span className="text-xs font-semibold text-slate-400">Total Revenue Volume</span>
                <p className="text-3xl font-black text-primary-400">₹{analytics?.totalRevenue || 0}</p>
              </div>

              <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-2">
                <span className="text-xs font-semibold text-slate-400">Active Farmers</span>
                <p className="text-3xl font-black text-slate-100">{analytics?.totalFarmers || 0}</p>
              </div>

              <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-2">
                <span className="text-xs font-semibold text-slate-400">Registered Buyers</span>
                <p className="text-3xl font-black text-slate-100">{analytics?.totalBuyers || 0}</p>
              </div>

              <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-2">
                <span className="text-xs font-semibold text-slate-400">Orders Processed</span>
                <p className="text-3xl font-black text-slate-100">{analytics?.totalOrders || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <LineChart title="Gross Transaction Value Trend (GTV)" data={[2000, 4500, 8900, 14200, 22000, 31000]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} />
              </div>
              <div className="lg:col-span-4">
                <DonutChart
                  title="Category Transaction Share"
                  data={[
                    { label: 'Vegetables', value: 45, color: '#10B981' },
                    { label: 'Fruits', value: 30, color: '#F59E0B' },
                    { label: 'Grains', value: 25, color: '#14B8A6' },
                  ]}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportsAnalytics;
