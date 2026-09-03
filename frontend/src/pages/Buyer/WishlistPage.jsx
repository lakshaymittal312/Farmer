import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/buyer-profiles/me');
      if (res.data.success && res.data.data?.wishlist) {
        setWishlist(res.data.data.wishlist);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const res = await api.delete(`/buyer-profiles/wishlist/${productId}`);
      if (res.data.success) {
        fetchWishlist();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading wishlist...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center border border-gray-200 text-gray-500">
          Your wishlist is empty.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((p) => (
            <div key={p._id || p} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <img
                src={p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/300'}
                alt={p.name || 'Product'}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{p.name || 'Saved Product'}</h3>
                <p className="text-emerald-700 font-bold text-lg mb-4">₹{p.price} <span className="text-xs font-normal text-gray-500">/ {p.unit}</span></p>

                <div className="flex gap-2">
                  <Link to={`/products/${p._id || p}`} className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 rounded">
                    View Product
                  </Link>
                  <button onClick={() => handleRemove(p._id || p)} className="bg-red-50 hover:bg-red-100 text-red-600 font-medium text-xs px-3 py-2 rounded">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
