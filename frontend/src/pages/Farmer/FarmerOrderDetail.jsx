import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, User, Phone, CheckCircle2, Clock, Truck, Package, Home } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { OrderStatusBadge } from '../../components/ui/Badge';
import StatusTimeline from '../../components/ui/StatusTimeline';
import { ErrorState } from '../../components/ui/EmptyState';

const FarmerOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (e) {
      setError(e.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (action) => {
    setUpdating(true);
    try {
      const res = await api.patch(`/orders/${id}/${action}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (e) {
      alert(e.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
        <DashboardSidebar role="farmer" />
        <main className="flex-1 p-8">
          <div className="bg-dark-card border border-dark-border rounded-2xl h-96 animate-pulse" />
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
        <DashboardSidebar role="farmer" />
        <main className="flex-1 p-8">
          <ErrorState message={error || 'Order not found'} onRetry={fetchOrderDetail} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="farmer" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <Link
          to="/farmer/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-400 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Customer Orders
        </Link>

        {/* Header Summary Card */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-100">Order #{order._id.substring(18)}</h1>
                <OrderStatusBadge status={order.orderStatus} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Workflow Buttons */}
            <div className="flex flex-wrap gap-2">
              {order.orderStatus === 'pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus('accept')}
                    disabled={updating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Accept Order
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('reject')}
                    disabled={updating}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Reject Order
                  </button>
                </>
              )}

              {order.orderStatus === 'accepted' && (
                <button
                  onClick={() => handleUpdateStatus('process')}
                  disabled={updating}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Start Processing
                </button>
              )}

              {order.orderStatus === 'processing' && (
                <button
                  onClick={() => handleUpdateStatus('ship')}
                  disabled={updating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Dispatch & Ship
                </button>
              )}

              {order.orderStatus === 'shipped' && (
                <button
                  onClick={() => handleUpdateStatus('deliver')}
                  disabled={updating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>

          {/* Visual Order Timeline Tracker */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider">Order Status Timeline</h4>
            <StatusTimeline currentStatus={order.orderStatus} />
          </div>
        </div>

        {/* Order Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Items Table */}
          <div className="lg:col-span-8 bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Ordered Produce Items</h3>

            <div className="divide-y divide-dark-border">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-dark-border"
                    />
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-400">
                        ₹{item.price} × {item.quantity} {item.unit || 'units'}
                      </p>
                    </div>
                  </div>

                  <p className="font-black text-primary-400 text-sm">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-dark-border flex justify-between items-center text-sm font-bold">
              <span className="text-slate-300">Total Order Revenue:</span>
              <span className="text-xl text-primary-400 font-black">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Right Buyer Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-bold text-slate-100">Buyer Details</h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-primary-400" />
                  <span className="font-bold text-slate-200">{order.buyer?.name || 'Buyer'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Phone className="w-4 h-4 text-primary-400" />
                  <span>{order.buyer?.phone || 'Contact via system'}</span>
                </div>
                {order.shippingAddress && (
                  <div className="flex items-start gap-3 text-slate-400 pt-2 border-t border-dark-border">
                    <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-200">Delivery Address</p>
                      <p className="mt-0.5">{order.shippingAddress.addressLine}</p>
                      <p>{order.shippingAddress.district}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FarmerOrderDetail;
