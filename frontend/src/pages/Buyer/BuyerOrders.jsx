import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowUpRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.patch(`/orders/${id}/cancel`);
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, orderStatus: 'cancelled' } : o))
        );
      }
    } catch (e) {
      alert(e.message || 'Failed to cancel order');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const status = (o.orderStatus || '').toLowerCase();
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return status !== 'delivered' && status !== 'cancelled';
    if (activeTab === 'delivered') return status === 'delivered';
    if (activeTab === 'cancelled') return status === 'cancelled';
    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="buyer" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-100">My Orders</h1>
            <p className="text-xs text-slate-400 mt-1">Track status and delivery timeline of your farm produce orders</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-dark-border">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'In Progress' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-slate-950 shadow-md shadow-primary-500/20'
                  : 'bg-dark-card border border-dark-border text-slate-300 hover:bg-dark-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchOrders} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title="No Orders Found"
            description="You don't have any placed produce orders matching this filter."
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((o) => (
              <div
                key={o._id}
                className="bg-dark-card border border-dark-border p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-primary-500/40 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-100 text-sm">#{o._id.substring(18)}</span>
                    <OrderStatusBadge status={o.orderStatus} />
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    Items: {o.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ') || 'Produce'}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Placed on {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-dark-border">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Amount</span>
                    <span className="font-black text-primary-400 text-lg">₹{o.totalAmount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {o.orderStatus === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(o._id)}
                        className="px-3 py-2 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold hover:bg-rose-900 transition"
                      >
                        Cancel
                      </button>
                    )}

                    <Link
                      to={`/buyer/orders/${o._id}`}
                      className="px-4 py-2 rounded-xl bg-dark-bg border border-dark-border text-primary-400 hover:bg-dark-hover text-xs font-bold flex items-center gap-1"
                    >
                      View Timeline <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerOrders;
