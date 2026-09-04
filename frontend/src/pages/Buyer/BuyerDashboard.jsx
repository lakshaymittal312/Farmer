import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Heart, PackageCheck, Store, ArrowUpRight, Sparkles } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/ui/EmptyState';

const BuyerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [recommended, setRecommended] = useState([]);
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
      // 1. Fetch Buyer Profile
      const pRes = await api.get('/buyer-profiles/me');
      if (pRes.data.success) setProfile(pRes.data.data);

      // 2. Fetch Cart
      const cRes = await api.get('/cart');
      if (cRes.data.success) setCart(cRes.data.cart);

      // 3. Fetch Orders
      const oRes = await api.get('/orders/my-orders');
      if (oRes.data.success) setOrders(oRes.data.orders || []);

      // 4. Fetch Recommended Products
      const prRes = await api.get('/products?status=active&limit=4');
      if (prRes.data.success) setRecommended(prRes.data.data || []);

      // 5. Fetch Notifications
      const nRes = await api.get('/notifications/unread-count');
      if (nRes.data.success) setUnreadCount(nRes.data.unreadCount || 0);
    } catch (e) {
      setError(e.message || 'Failed to load buyer dashboard');
    } finally {
      setLoading(false);
    }
  };

  const activeOrdersCount = orders.filter((o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length;
  const deliveredOrdersCount = orders.filter((o) => o.orderStatus === 'delivered').length;
  const cartItemCount = cart?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="buyer" unreadCount={unreadCount} />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-100">Buyer Workspace</h1>
            <p className="text-xs text-slate-400 mt-1">
              Welcome back, <span className="text-slate-200 font-semibold">{profile?.user?.name || 'Valued Buyer'}</span>
            </p>
          </div>

          <Link
            to="/marketplace"
            className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-primary-500/20"
          >
            <Store className="w-4 h-4" /> Browse Marketplace
          </Link>
        </div>

        {/* Profile Alert Banner if profile missing */}
        {!profile && !loading && (
          <div className="bg-amber-950/40 border border-amber-800/60 p-6 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-amber-200">Setup Buyer Delivery Profile</h4>
              <p className="text-xs text-amber-300/80 mt-1">Add your default delivery addresses to speed up checkout.</p>
            </div>
            <Link
              to="/buyer/profile/edit"
              className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl"
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
              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 shadow-dark-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Active Orders</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-100">{activeOrdersCount}</p>
                <p className="text-[11px] text-slate-400">In fulfillment pipeline</p>
              </div>

              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 shadow-dark-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Delivered Orders</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-primary-500/30 flex items-center justify-center text-primary-400">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-primary-400">{deliveredOrdersCount}</p>
                <p className="text-[11px] text-slate-400">Successfully received</p>
              </div>

              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 shadow-dark-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Cart Items</span>
                  <div className="w-9 h-9 rounded-xl bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-100">{cartItemCount}</p>
                <Link to="/cart" className="text-[11px] font-bold text-primary-400 hover:underline block">
                  Proceed to Cart →
                </Link>
              </div>

              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-2 shadow-dark-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Saved Wishlist</span>
                  <div className="w-9 h-9 rounded-xl bg-rose-950 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Heart className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-100">{profile?.wishlist?.length || 0}</p>
                <Link to="/buyer/wishlist" className="text-[11px] font-bold text-rose-400 hover:underline block">
                  View Saved Crops →
                </Link>
              </div>
            </div>

            {/* RECOMMENDED PRODUCE */}
            {recommended.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent-gold" /> Fresh Seasonal Produce For You
                  </h3>
                  <Link to="/marketplace" className="text-xs font-bold text-primary-400 hover:underline">
                    Explore Marketplace →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommended.map((p) => (
                    <div key={p._id} className="glass-panel-interactive rounded-2xl overflow-hidden p-3 space-y-2">
                      <ImageWithFallback src={p.images && p.images[0] ? p.images[0] : ''} alt={p.name} className="w-full h-36 object-cover rounded-xl" />
                      <h4 className="font-bold text-slate-100 text-sm truncate">{p.name}</h4>
                      <p className="text-xs font-bold text-primary-400">₹{p.price} / {p.unit}</p>
                      <Link
                        to={`/products/${p._id}`}
                        className="w-full block text-center bg-dark-bg hover:bg-primary-500 hover:text-slate-950 text-slate-200 text-xs py-2 rounded-xl border border-dark-border transition"
                      >
                        View Crop
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RECENT ORDERS TABLE */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100">My Order History</h3>
                <Link to="/buyer/orders" className="text-xs font-bold text-primary-400 hover:underline">
                  View All Orders →
                </Link>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">You haven't placed any orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Produce Items</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o._id} className="hover:bg-dark-hover transition">
                          <td className="p-3 font-mono text-slate-400">#{o._id.substring(18)}</td>
                          <td className="p-3 font-bold text-slate-100">
                            {o.items?.map((i) => i.name).join(', ') || 'Produce Items'}
                          </td>
                          <td className="p-3 font-black text-primary-400">₹{o.totalAmount}</td>
                          <td className="p-3">
                            <OrderStatusBadge status={o.orderStatus} />
                          </td>
                          <td className="p-3 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-right">
                            <Link
                              to={`/buyer/orders/${o._id}`}
                              className="px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-primary-400 hover:bg-dark-hover font-semibold text-[11px] inline-flex items-center gap-1"
                            >
                              Inspect <ArrowUpRight className="w-3 h-3" />
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

export default BuyerDashboard;
