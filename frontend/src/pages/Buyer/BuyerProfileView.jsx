import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const BuyerProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/buyer-profiles/me');
      if (res.data.success) setProfile(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!profile) return (
    <div className="p-8 text-center">
      <p className="mb-4">No buyer profile found.</p>
      <Link to="/buyer/profile/edit" className="bg-emerald-600 text-white px-4 py-2 rounded">Create Profile</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Buyer Profile</h1>
        <Link to="/buyer/profile/edit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-medium text-sm">
          Edit Profile
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 mb-2">Account Overview</h3>
          <p className="text-sm text-gray-700">Total Orders Placed: {profile.totalOrders || 0}</p>
          <p className="text-sm text-gray-700">Preferred Categories: {profile.preferredCategories?.join(', ') || 'None specified'}</p>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-2">Delivery Addresses</h3>
          {profile.deliveryAddresses?.length === 0 ? (
            <p className="text-xs text-gray-500">No delivery addresses saved.</p>
          ) : (
            <div className="space-y-2">
              {profile.deliveryAddresses?.map((addr, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-100 text-sm">
                  <span className="font-bold text-emerald-800">{addr.label}</span> {addr.isDefault && <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-2 font-semibold">Default</span>}
                  <p className="text-gray-700">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerProfileView;
