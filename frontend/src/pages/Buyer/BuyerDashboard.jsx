import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const BuyerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const pRes = await api.get('/buyer-profiles/me');
      if (pRes.data.success) setProfile(pRes.data.data);

      const cRes = await api.get('/cart');
      if (cRes.data.success) setCart(cRes.data.cart);

      const oRes = await api.get('/orders/my-orders');
      if (oRes.data.success) setOrders(oRes.data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Buyer Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Buyer Dashboard</h1>

      {!profile ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl text-center mb-8">
          <p className="text-amber-800 font-semibold mb-4">You haven't set up your Buyer Profile yet.</p>
          <Link to="/buyer/profile/edit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded">
            Create Buyer Profile
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 font-medium">Cart Items</p>
              <p className="text-3xl font-bold text-emerald-700">{cart?.items?.length || 0}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 font-medium">Total Orders Placed</p>
              <p className="text-3xl font-bold text-emerald-700">{orders.length}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 font-medium">Wishlist Items</p>
              <p className="text-3xl font-bold text-amber-500">{profile.wishlist?.length || 0}</p>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <Link to="/marketplace" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-medium shadow">
              Browse Marketplace
            </Link>
            <Link to="/cart" className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded font-medium">
              View Cart
            </Link>
            <Link to="/buyer/orders" className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded font-medium">
              My Orders
            </Link>
            <Link to="/buyer/profile" className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded font-medium">
              View Profile
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default BuyerDashboard;
