import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const res = await api.get('/admin/farmers');
      if (res.data.success) setFarmers(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (profileId, status) => {
    try {
      const res = await api.patch(`/farmer-profiles/${profileId}/verification-status`, { verificationStatus: status });
      if (res.data.success) fetchFarmers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading farmers...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Farmers</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-semibold">
            <tr>
              <th className="p-4">Farm Name</th>
              <th className="p-4">Owner Name</th>
              <th className="p-4">Location</th>
              <th className="p-4">Farming Type</th>
              <th className="p-4">Verification</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {farmers.map((f) => (
              <tr key={f._id} className="hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">{f.farmName}</td>
                <td className="p-4 text-gray-700">{f.user?.name} ({f.user?.phone})</td>
                <td className="p-4 text-gray-600">{f.village}, {f.district}, {f.state}</td>
                <td className="p-4 capitalize">{f.farmingType}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${f.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {f.verificationStatus}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {f.verificationStatus !== 'verified' && (
                    <button onClick={() => handleVerify(f._id, 'verified')} className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded font-semibold">Approve</button>
                  )}
                  {f.verificationStatus !== 'rejected' && (
                    <button onClick={() => handleVerify(f._id, 'rejected')} className="bg-red-600 text-white text-xs px-2.5 py-1 rounded font-semibold">Reject</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageFarmers;
