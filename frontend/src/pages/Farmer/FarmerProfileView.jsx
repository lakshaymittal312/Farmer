import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const FarmerProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/farmer-profiles/me');
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
      <p className="mb-4">No farmer profile found.</p>
      <Link to="/farmer/profile/edit" className="bg-emerald-600 text-white px-4 py-2 rounded">Create Profile</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Farmer Profile</h1>
        <Link to="/farmer/profile/edit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-medium text-sm">
          Edit Profile
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4 text-sm text-gray-700">
        <div><span className="font-semibold text-gray-900">Farm Name:</span> {profile.farmName}</div>
        <div><span className="font-semibold text-gray-900">Description:</span> {profile.farmDescription || 'N/A'}</div>
        <div><span className="font-semibold text-gray-900">Location:</span> {profile.village}, {profile.district}, {profile.state} - {profile.pincode}</div>
        <div><span className="font-semibold text-gray-900">Farming Type:</span> {profile.farmingType}</div>
        <div><span className="font-semibold text-gray-900">Crops Grown:</span> {profile.cropsGrown?.join(', ') || 'None'}</div>
        <div><span className="font-semibold text-gray-900">Verification Status:</span> <span className="font-bold uppercase text-emerald-700">{profile.verificationStatus}</span></div>
        <div><span className="font-semibold text-gray-900">Rating:</span> ⭐ {profile.rating || 0}</div>
        <div><span className="font-semibold text-gray-900">Total Orders:</span> {profile.totalOrders || 0}</div>
        <div><span className="font-semibold text-gray-900">Total Revenue:</span> ₹{profile.totalRevenue || 0}</div>
      </div>
    </div>
  );
};

export default FarmerProfileView;
