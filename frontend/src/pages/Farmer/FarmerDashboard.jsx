import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Package, ShoppingBag, DollarSign, Star, PlusCircle, ArrowUpRight, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { OrderStatusBadge, VerificationBadge } from '../../components/ui/Badge';
import { LineChart, DonutChart } from '../../components/ui/Charts';
import { ErrorState } from '../../components/ui/EmptyState';

const FarmerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Farmer Profile
      const pRes = await api.get('/farmer-profiles/me');
      if (pRes.data.success) setProfile(pRes.data.data);

      // 2. Fetch Products
      const prRes = await api.get('/products');
      if (prRes.data.success && pRes.data.data) {
        const myProds = prRes.data.data.filter((p) => p.farmer?._id === pRes.data.data._id);
        setProducts(myProds);
      }

      // 3. Fetch Orders
      const oRes = await api.get('/orders/farmer');
      if (oRes.data.success) setOrders(oRes.data.orders || []);

      // 4. Fetch Unread Notifications
      const nRes = await api.get('/notifications/unread-count');
      if (nRes.data.success) setUnreadCount(nRes.data.unreadCount || 0);
    } catch (e) {
      setError(e.message || 'Failed to load farmer dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const activeProducts = products.filter((p) => p.status === 'active').length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
  const totalRevenue = orders
    .filter((o) => o.orderStatus === 'delivered')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  // Donut chart status data
  const statusCounts = {
    Pending: orders.filter((o) => o.orderStatus === 'pending').length,
    Processing: orders.filter((o) => o.orderStatus === 'processing' || o.orderStatus === 'accepted').length,
    Shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
    Delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
  };

  const donutData = [
    { label: 'Pending', value: statusCounts.Pending, color: '#F59E0B' },
    { label: 'Processing', value: statusCounts.Processing, color: '#14B8A6' },
    { label: 'Shipped', value: statusCounts.Shipped, color: '#6366F1' },
    { label: 'Delivered', value: statusCounts.Delivered, color: '#10B981' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="farmer" unreadCount={unreadCount} />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-100">Farmer Command Center</h1>
              {profile && <VerificationBadge status={profile.verificationStatus} />}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Farm: <span className="text-slate-200 font-semibold">{profile?.farmName || 'Setup Required'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/farmer/products/add"
              className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-primary-500/20"
            >
              <PlusCircle className="w-4 h-4" /> Add New Harvest
            </Link>
          </div>
        </div>

        {/* Profile Alert Banner if profile doesn't exist */}
        {!profile && !loading && (
          <div className="bg-amber-950/40 border border-amber-800/60 p-6 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-amber-200">Complete Your Farm Profile</h4>
              <p className="text-xs text-amber-300/80 mt-1">
                You haven't initialized your farm profile details yet. Set up farm location and crop information for verification.
              </p>
            </div>
            <Link
              to="/farmer/profile/edit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl whitespace-nowrap"
            >
              Create Profile
            </Link>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-dark-card border border-dark-border rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchDashboardData} />
        ) : (
          <>
            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Total Products */}
              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 shadow-dark-card hover:border-primary-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total Inventory</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-primary-500/30 flex items-center justify-center text-primary-400">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-100">{products.length}</p>
                <p className="text-[11px] text-slate-400">
                  <span className="text-primary-400 font-bold">{activeProducts} Active</span> listed on market
                </p>
              </div>

              {/* Card 2: Pending Orders */}
              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 shadow-dark-card hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Pending Orders</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-100">{pendingOrders}</p>
                <p className="text-[11px] text-slate-400">
                  Total <span className="text-slate-200 font-bold">{orders.length}</span> orders received
                </p>
              </div>

              {/* Card 3: Total Revenue */}
              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 shadow-dark-card hover:border-emerald-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Delivered Revenue</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-primary-500/30 flex items-center justify-center text-primary-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-primary-400">₹{totalRevenue}</p>
                <p className="text-[11px] text-slate-400">Direct sales proceeds</p>
              </div>

              {/* Card 4: Farm Rating */}
              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 shadow-dark-card hover:border-accent-gold/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Farm Reputation</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-100">{profile?.rating || 5.0} / 5</p>
                <p className="text-[11px] text-slate-400">Based on buyer feedback</p>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <LineChart
                  title="Revenue & Delivery Growth (₹)"
                  data={orders.map((o) => o.totalAmount || 100).concat([350, 700, 1200])}
                  labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']}
                />
              </div>

              <div className="lg:col-span-5">
                <DonutChart title="Order Status Breakdown" data={donutData} />
              </div>
            </div>

            {/* RECENT ORDERS TABLE */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Recent Customer Orders</h3>
                  <p className="text-xs text-slate-400">Latest produce purchases waiting for fulfillment</p>
                </div>
                <Link to="/farmer/orders" className="text-xs font-bold text-primary-400 hover:underline">
                  View All Orders →
                </Link>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No customer orders placed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Buyer</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o._id} className="hover:bg-dark-hover transition">
                          <td className="p-3 font-mono text-slate-400">#{o._id.substring(18)}</td>
                          <td className="p-3 font-bold text-slate-100">{o.buyer?.name || 'Customer'}</td>
                          <td className="p-3 font-bold text-primary-400">₹{o.totalAmount}</td>
                          <td className="p-3">
                            <OrderStatusBadge status={o.orderStatus} />
                          </td>
                          <td className="p-3 text-slate-400">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              to={`/farmer/orders/${o._id}`}
                              className="px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-primary-400 hover:bg-dark-hover font-semibold text-[11px] inline-flex items-center gap-1"
                            >
                              Manage <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default FarmerDashboard;
