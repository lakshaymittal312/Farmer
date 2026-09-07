import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
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
      const res = await adminApi.getOrders();
      if (res.data.success) {
        setOrders(res.data.orders || res.data.data || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!statusFilter) return true;
    return (o.orderStatus || '').toLowerCase() === statusFilter;
  });

  return (
    <div className="space-y-6">
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

      {loading ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState title="No Orders Found" description="No platform orders match the selected status filter." />
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Buyer Name</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Order Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-dark-hover transition">
                    <td className="p-4 font-mono font-bold text-slate-400">#{o._id.substring(18)}</td>
                    <td className="p-4 font-bold text-slate-100">{o.buyer?.name || 'Customer'}</td>
                    <td className="p-4 text-slate-300 font-medium">
                      {o.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ') || 'Items'}
                    </td>
                    <td className="p-4 font-black text-primary-400">₹{o.totalAmount}</td>
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
    </div>
  );
};

export default ManageOrders;
