import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, XCircle, Package, Truck, Home, Filter } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const FarmerOrders = () => {
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
      const res = await api.get('/orders/farmer');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load farmer orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, action) => {
    try {
      const res = await api.patch(`/orders/${orderId}/${action}`);
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: res.data.order.orderStatus } : o))
        );
      }
    } catch (e) {
      alert(e.message || `Failed to ${action} order`);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return (o.orderStatus || '').toLowerCase() === activeTab;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="farmer" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-100">Customer Orders</h1>
            <p className="text-xs text-slate-400 mt-1">
              Review incoming produce orders, accept requests, and manage shipment status updates
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-dark-border">
          {tabs.map((tab) => (
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

        {/* Orders Table */}
        {loading ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchOrders} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title="No Orders Found"
            description={`There are currently no orders in status '${activeTab}'.`}
          />
        ) : (
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Buyer Info</th>
                    <th className="p-4">Items Summary</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-dark-hover transition">
                      <td className="p-4 font-mono text-slate-400 font-bold">#{o._id.substring(18)}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-100 block">{o.buyer?.name || 'Customer'}</span>
                        <span className="text-[10px] text-slate-400">{o.shippingAddress?.district || 'India'}</span>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">
                        {o.items?.map((i) => i.name).join(', ') || `${o.items?.length || 0} items`}
                      </td>
                      <td className="p-4 font-black text-primary-400">₹{o.totalAmount}</td>
                      <td className="p-4">
                        <OrderStatusBadge status={o.orderStatus} />
                      </td>
                      <td className="p-4 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Workflow Actions */}
                          {o.orderStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(o._id, 'accept')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 font-bold text-[10px]"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(o._id, 'reject')}
                                className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 font-bold text-[10px]"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {o.orderStatus === 'accepted' && (
                            <button
                              onClick={() => handleUpdateStatus(o._id, 'process')}
                              className="px-2.5 py-1 rounded-lg bg-teal-950 text-teal-300 border border-teal-800 hover:bg-teal-900 font-bold text-[10px]"
                            >
                              Process
                            </button>
                          )}

                          {o.orderStatus === 'processing' && (
                            <button
                              onClick={() => handleUpdateStatus(o._id, 'ship')}
                              className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900 font-bold text-[10px]"
                            >
                              Ship
                            </button>
                          )}

                          {o.orderStatus === 'shipped' && (
                            <button
                              onClick={() => handleUpdateStatus(o._id, 'deliver')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 font-bold text-[10px]"
                            >
                              Deliver
                            </button>
                          )}

                          <Link
                            to={`/farmer/orders/${o._id}`}
                            className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-slate-300 hover:text-white"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
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

export default FarmerOrders;
