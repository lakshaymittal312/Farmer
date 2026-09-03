import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      if (res.data.success) setOrders(res.data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.patch(`/orders/${orderId}/cancel`, { reason: 'Cancelled by buyer' });
      if (res.data.success) fetchMyOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center border border-gray-200 text-gray-500">
          You haven't placed any orders yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-semibold">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Farm</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs font-semibold">{o._id.substring(0, 10)}...</td>
                  <td className="p-4">{o.farmer?.farmName || 'Farmer'}</td>
                  <td className="p-4 text-gray-700">
                    {o.items?.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                  </td>
                  <td className="p-4 font-semibold text-emerald-700">₹{o.totalAmount}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link to={`/buyer/orders/${o._id}`} className="text-emerald-600 font-medium hover:underline text-xs">View</Link>
                    {(o.orderStatus === 'pending' || o.orderStatus === 'accepted') && (
                      <button onClick={() => handleCancel(o._id)} className="bg-red-600 text-white text-xs px-2.5 py-1 rounded">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BuyerOrders;
