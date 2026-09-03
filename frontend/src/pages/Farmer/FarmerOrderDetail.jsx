import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const FarmerOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) setOrder(res.data.order);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center text-red-600">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Order #{order._id}</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className="font-bold text-lg uppercase text-emerald-700">{order.orderStatus}</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-2xl font-extrabold text-gray-900">₹{order.totalAmount}</p>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-2">Customer Details</h3>
          <p className="text-sm text-gray-700">{order.buyer?.name} ({order.buyer?.email}, {order.buyer?.phone})</p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold">Delivery Address:</span> {order.deliveryAddress?.address}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
          </p>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-2">Ordered Items</h3>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded border border-gray-100 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">₹{item.price} per {item.unit}</p>
                </div>
                <p className="font-bold text-gray-900">Qty: {item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerOrderDetail;
