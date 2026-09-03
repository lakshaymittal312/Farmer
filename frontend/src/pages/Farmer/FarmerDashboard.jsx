import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const FarmerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [productsCount, setProductsCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const pRes = await api.get('/farmer-profiles/me');
      if (pRes.data.success) setProfile(pRes.data.data);

      const prRes = await api.get('/products');
      if (prRes.data.success && pRes.data.data) {
        const myProds = prRes.data.data.filter((p) => p.farmer?._id === pRes.data.data._id);
        setProductsCount(myProds.length);
      }

      const oRes = await api.get('/orders/farmer');
      if (oRes.data.success) setOrders(oRes.data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Farmer Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Farmer Dashboard</h1>

      {!profile ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl text-center mb-8">
          <p className="text-amber-800 font-semibold mb-4">You haven't set up your Farmer Profile yet.</p>
          <Link to="/farmer/profile/edit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded">
            Create Farmer Profile
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 font-medium">Farm Name</p>
              <p className="text-xl font-bold text-gray-900">{profile.farmName}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded font-semibold ${profile.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {profile.verificationStatus}
              </span>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 font-medium">Total Products</p>
              <p className="text-3xl font-bold text-emerald-700">{productsCount}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-emerald-700">{orders.length}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 font-medium">Rating</p>
              <p className="text-3xl font-bold text-amber-500">⭐ {profile.rating || 0}</p>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <Link to="/farmer/products/add" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-medium shadow">
              + Add New Product
            </Link>
            <Link to="/farmer/products" className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded font-medium">
              Manage Products
            </Link>
            <Link to="/farmer/orders" className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded font-medium">
              View Orders
            </Link>
            <Link to="/farmer/profile" className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded font-medium">
              View Profile
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default FarmerDashboard;
