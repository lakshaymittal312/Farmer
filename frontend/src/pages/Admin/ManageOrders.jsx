import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminOrders();
  }, []);

  const fetchAdminOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      if (res.data.success) setOrders(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading system orders...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage System Orders</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-semibold">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Buyer</th>
              <th className="p-4">Farmer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-xs font-semibold">{o._id.substring(0, 10)}...</td>
                <td className="p-4">{o.buyer?.name}</td>
                <td className="p-4">{o.farmer?.farmName}</td>
                <td className="p-4 font-semibold text-emerald-700">₹{o.totalAmount}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-amber-100 text-amber-800">
                    {o.orderStatus}
                  </span>
                </td>
                <td className="p-4 text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageOrders;
