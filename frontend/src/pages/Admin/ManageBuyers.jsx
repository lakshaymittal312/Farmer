import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageBuyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      const res = await api.get('/admin/buyers');
      if (res.data.success) setBuyers(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading buyers...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Buyers</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-semibold">
            <tr>
              <th className="p-4">Buyer Name</th>
              <th className="p-4">Contact Info</th>
              <th className="p-4">Total Orders</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {buyers.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">{b.user?.name || 'Buyer'}</td>
                <td className="p-4 text-gray-600">{b.user?.email} | {b.user?.phone}</td>
                <td className="p-4 font-bold text-emerald-700">{b.totalOrders || 0}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${b.user?.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {b.user?.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBuyers;
