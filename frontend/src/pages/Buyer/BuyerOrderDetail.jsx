import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Truck, Calendar, ShieldCheck, XCircle } from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import OrderTimeline from '../../components/ui/OrderTimeline';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';
import { ErrorState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

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
      const res = await orderApi.getOrderById(id);
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
      const res = await orderApi.cancelOrder(id, 'Cancelled by buyer');
      if (res.data.success) {
        toast.success('Order cancelled successfully.');
        setOrder(res.data.order);
      }
    } catch (e) {
      toast.error(e.message || 'Failed to cancel order');
    }
  };

  if (loading) {
    return <div className="bg-dark-card border border-dark-border rounded-3xl h-96 animate-pulse p-8" />;
  }

  if (error || !order) {
    return <ErrorState message={error || 'Order not found'} onRetry={fetchOrderDetail} />;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/buyer/orders"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-400 transition"
      >
        <ChevronLeft className="w-4 h-4" /> Back to My Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-100">Order #{order._id.substring(18)}</h1>
            <OrderStatusBadge status={order.orderStatus} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {order.orderStatus === 'pending' && (
          <button
            onClick={handleCancelOrder}
            className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" /> Cancel Order
          </button>
        )}
      </div>

      {/* Visual Timeline Bar */}
      <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-3 shadow-2xl">
        <h3 className="text-sm font-bold text-slate-100">Fulfillment Status Timeline</h3>
        <OrderTimeline currentStatus={order.orderStatus} />
      </div>

      {/* Items & Address Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Produce Items */}
        <div className="lg:col-span-8 bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-slate-100">Ordered Produce Items</h3>

          <div className="divide-y divide-dark-border">
            {order.items?.map((item) => (
              <div key={item._id || item.product} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-400">
                    Quantity: <span className="text-slate-200 font-semibold">{item.quantity} {item.unit || 'unit'}</span> @ ₹{item.price}/{item.unit || 'unit'}
                  </p>
                </div>
                <span className="font-black text-primary-400 text-sm">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-dark-border flex justify-between items-baseline text-sm font-bold">
            <span className="text-slate-200">Total Order Amount</span>
            <span className="text-2xl font-black text-primary-400">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Right Shipping Info */}
        <div className="lg:col-span-4 bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-400" /> Delivery Address
          </h3>

          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-bold text-slate-100">{order.shippingAddress?.addressLine}</p>
            <p>{order.shippingAddress?.district}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
          </div>

          <div className="pt-4 border-t border-dark-border space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Payment Method:</span>
              <span className="font-bold text-slate-200 uppercase">{order.paymentMethod || 'COD'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Status:</span>
              <span className="font-bold text-emerald-400 uppercase">{order.paymentStatus || 'Pending'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerOrderDetail;
