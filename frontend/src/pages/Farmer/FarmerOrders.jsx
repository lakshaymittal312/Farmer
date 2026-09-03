import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmerOrders();
  }, []);

  const fetchFarmerOrders = async () => {
    try {
      const res = await api.get('/orders/farmer');
      if (res.data.success) setOrders(res.data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, action) => {
    try {
      const res = await api.patch(`/orders/${orderId}/${action}`);
      if (res.data.success) {
        fetchFarmerOrders();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center border border-gray-200 text-gray-500">
          No orders received yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-semibold">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Buyer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs font-semibold">{o._id.substring(0, 10)}...</td>
                  <td className="p-4">{o.buyer?.name || 'Customer'} ({o.buyer?.phone})</td>
                  <td className="p-4 text-gray-700">
                    {o.items?.map((i) => `${i.name} x ${i.quantity}`).join(', ')}
                  </td>
                  <td className="p-4 font-semibold text-emerald-700">₹{o.totalAmount}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-amber-100 text-amber-800">
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link to={`/farmer/orders/${o._id}`} className="text-emerald-600 font-medium hover:underline text-xs">View</Link>
                    {o.orderStatus === 'pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(o._id, 'accept')} className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded">Accept</button>
                        <button onClick={() => handleStatusUpdate(o._id, 'reject')} className="bg-red-600 text-white text-xs px-2.5 py-1 rounded">Reject</button>
                      </>
                    )}
                    {o.orderStatus === 'accepted' && (
                      <button onClick={() => handleStatusUpdate(o._id, 'process')} className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded">Process</button>
                    )}
                    {o.orderStatus === 'processing' && (
                      <button onClick={() => handleStatusUpdate(o._id, 'ship')} className="bg-indigo-600 text-white text-xs px-2.5 py-1 rounded">Ship</button>
                    )}
                    {o.orderStatus === 'shipped' && (
                      <button onClick={() => handleStatusUpdate(o._id, 'deliver')} className="bg-emerald-700 text-white text-xs px-2.5 py-1 rounded">Deliver</button>
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

export default FarmerOrders;
