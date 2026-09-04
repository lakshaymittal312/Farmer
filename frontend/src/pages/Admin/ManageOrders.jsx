import React, { useState, useEffect } from 'react';
import { Eye, ArrowUpRight, Search } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/orders');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load system orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!statusFilter) return true;
    return (o.orderStatus || '').toLowerCase() === statusFilter;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="border-b border-dark-border pb-6">
          <h1 className="text-3xl font-black text-slate-100">System Orders Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Audit all platform produce transactions and shipment stages</p>
        </div>

        {/* Filter */}
        <div className="glass-panel p-4 rounded-2xl max-w-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchOrders} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState title="No Orders Found" description="No system orders match your status filter." />
        ) : (
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Buyer</th>
                    <th className="p-4">Farmer</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-dark-hover transition">
                      <td className="p-4 font-mono font-bold text-slate-400">#{o._id.substring(18)}</td>
                      <td className="p-4 font-bold text-slate-100">{o.buyer?.name || 'Buyer'}</td>
                      <td className="p-4 text-slate-200">{o.farmer?.farmName || o.farmer?.name || 'Farmer'}</td>
                      <td className="p-4 font-black text-primary-400">₹{o.totalAmount}</td>
                      <td className="p-4 font-mono text-[10px] uppercase text-slate-400">{o.paymentMethod || 'COD'}</td>
                      <td className="p-4">
                        <OrderStatusBadge status={o.orderStatus} />
                      </td>
                      <td className="p-4 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageOrders;
