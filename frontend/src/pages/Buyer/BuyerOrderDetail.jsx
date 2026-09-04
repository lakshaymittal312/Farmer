import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Truck, CheckCircle2, Star, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { OrderStatusBadge } from '../../components/ui/Badge';
import StatusTimeline from '../../components/ui/StatusTimeline';
import { ErrorState } from '../../components/ui/EmptyState';

const BuyerOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.patch(`/orders/${id}/cancel`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (e) {
      alert(e.message || 'Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
        <DashboardSidebar role="buyer" />
        <main className="flex-1 p-8">
          <div className="bg-dark-card border border-dark-border rounded-3xl h-96 animate-pulse" />
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
        <DashboardSidebar role="buyer" />
        <main className="flex-1 p-8">
          <ErrorState message={error || 'Order not found'} onRetry={fetchOrderDetail} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="buyer" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <Link
          to="/buyer/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-400 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to My Orders
        </Link>

        {/* Order Card Summary */}
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

            {order.orderStatus === 'pending' && (
              <button
                onClick={handleCancelOrder}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Cancel Order
              </button>
            )}
          </div>

          {/* Visual Progress Tracker */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider">Fulfillment Status Tracker</h4>
            <StatusTimeline currentStatus={order.orderStatus} />
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Items Table */}
          <div className="lg:col-span-8 bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Purchased Items</h3>

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
                      {order.orderStatus === 'delivered' && item.product && (
                        <Link
                          to={`/products/${item.product._id || item.product}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-gold hover:underline mt-1"
                        >
                          <MessageSquare className="w-3 h-3" /> Leave Product Review
                        </Link>
                      )}
                    </div>
                  </div>

                  <p className="font-black text-primary-400 text-sm">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-dark-border flex justify-between items-center text-sm font-bold">
              <span className="text-slate-300">Total Paid Amount:</span>
              <span className="text-xl text-primary-400 font-black">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="lg:col-span-4 bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Delivery Information</h3>

            {order.shippingAddress && (
              <div className="text-xs text-slate-300 space-y-2">
                <p className="flex items-center gap-2 font-bold text-slate-100">
                  <MapPin className="w-4 h-4 text-primary-400" /> Destination Address
                </p>
                <p className="pl-6 text-slate-400">{order.shippingAddress.addressLine}</p>
                <p className="pl-6 text-slate-400">
                  {order.shippingAddress.district}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-dark-border text-xs text-slate-400">
              <span className="block font-semibold text-slate-200">Payment Mode:</span>
              <span className="uppercase font-bold text-primary-400">{order.paymentMethod || 'COD'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyerOrderDetail;
