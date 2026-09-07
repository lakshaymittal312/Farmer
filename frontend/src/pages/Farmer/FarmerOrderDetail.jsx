import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Truck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import OrderTimeline from '../../components/ui/OrderTimeline';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';
import { ErrorState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

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
      const res = await orderApi.getOrderById(id);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (e) {
      setError(e.message || 'Failed to load order detail');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (action) => {
    setUpdating(true);
    try {
      let res;
      if (action === 'accept') res = await orderApi.acceptOrder(id);
      else if (action === 'reject') res = await orderApi.rejectOrder(id, 'Rejected by farmer');
      else if (action === 'process') res = await orderApi.processOrder(id);
      else if (action === 'ship') res = await orderApi.shipOrder(id);
      else if (action === 'deliver') res = await orderApi.deliverOrder(id);

      if (res?.data?.success) {
        toast.success(`Order ${action}ed successfully!`);
        setOrder(res.data.order);
      }
    } catch (e) {
      toast.error(e.message || `Failed to ${action} order`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="bg-dark-card border border-dark-border rounded-2xl h-96 animate-pulse p-8" />;
  }

  if (error || !order) {
    return <ErrorState message={error || 'Order not found'} onRetry={fetchOrderDetail} />;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/farmer/orders"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-400 transition"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Customer Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-100">Order #{order._id.substring(18)}</h1>
            <OrderStatusBadge status={order.orderStatus} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Buyer: <span className="text-slate-200 font-semibold">{order.buyer?.name || 'Valued Customer'}</span> • Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {order.orderStatus === 'pending' && (
            <>
              <button
                onClick={() => handleUpdateStatus('accept')}
                disabled={updating}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Accept Order
              </button>
              <button
                onClick={() => handleUpdateStatus('reject')}
                disabled={updating}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject Order
              </button>
            </>
          )}

          {order.orderStatus === 'accepted' && (
            <button
              onClick={() => handleUpdateStatus('process')}
              disabled={updating}
              className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" /> Mark Processing
            </button>
          )}

          {order.orderStatus === 'processing' && (
            <button
              onClick={() => handleUpdateStatus('ship')}
              disabled={updating}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" /> Mark Shipped
            </button>
          )}

          {order.orderStatus === 'shipped' && (
            <button
              onClick={() => handleUpdateStatus('deliver')}
              disabled={updating}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark Delivered
            </button>
          )}
        </div>
      </div>

      {/* Visual Timeline Bar */}
      <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-3 shadow-2xl">
        <h3 className="text-sm font-bold text-slate-100">Fulfillment Status Timeline</h3>
        <OrderTimeline currentStatus={order.orderStatus} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-slate-100">Produce Order Items</h3>

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
            <span className="text-slate-200">Total Amount</span>
            <span className="text-2xl font-black text-primary-400">₹{order.totalAmount}</span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-400" /> Buyer Shipping Details
          </h3>

          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-bold text-slate-100">{order.buyer?.name || 'Customer'}</p>
            <p>{order.shippingAddress?.addressLine}</p>
            <p>{order.shippingAddress?.district}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerOrderDetail;
