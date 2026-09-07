import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
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
      const res = await adminApi.getAnalytics();
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
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
              <span className="text-xs font-semibold text-slate-400">Total Orders Settled</span>
              <p className="text-3xl font-black text-slate-100">{analytics?.totalOrders || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <LineChart
                title="Gross Transaction Volume Trend (₹)"
                data={[12000, 28000, 45000, 72000, 110000, 165000, 240000]}
                labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']}
              />
            </div>

            <div className="lg:col-span-4">
              <DonutChart
                title="Trading Breakdown"
                data={[
                  { label: 'Organic Crops', value: 65, color: '#10B981' },
                  { label: 'Conventional Crops', value: 35, color: '#F59E0B' },
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;
