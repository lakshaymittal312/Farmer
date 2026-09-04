import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Eye, Store } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/buyer-profiles/me');
      if (res.data.success && res.data.data) {
        setWishlist(res.data.data.wishlist || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      const res = await api.delete(`/buyer-profiles/wishlist/${productId}`);
      if (res.data.success) {
        setWishlist(res.data.data.wishlist || []);
      }
    } catch (e) {
      alert(e.message || 'Failed to remove item');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await api.post('/cart/items', { productId: product._id || product, quantity: 1 });
      alert('Product added to cart!');
    } catch (e) {
      alert(e.message || 'Failed to add product to cart');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="buyer" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-100">Saved Wishlist</h1>
            <p className="text-xs text-slate-400 mt-1">Your bookmarked farm produce and seasonal harvests</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-dark-card border border-dark-border rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchWishlist} />
        ) : wishlist.length === 0 ? (
          <EmptyState
            title="Your Wishlist is Empty"
            description="You haven't bookmarked any agricultural produce yet."
            actionLabel="Browse Marketplace"
            onAction={() => window.location.assign('/marketplace')}
            icon={Heart}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const p = item.product || item;
              return (
                <div key={p._id} className="glass-panel-interactive rounded-2xl overflow-hidden p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <ImageWithFallback
                      src={p.images && p.images[0] ? p.images[0] : ''}
                      alt={p.name || 'Crop'}
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <h3 className="font-bold text-slate-100 text-sm truncate">{p.name || 'Produce Item'}</h3>
                    <p className="text-xs font-black text-primary-400">₹{p.price} / {p.unit || 'kg'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dark-border">
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Cart
                    </button>

                    <button
                      onClick={() => handleRemoveWishlist(p._id)}
                      className="bg-dark-bg border border-dark-border hover:bg-rose-950 text-rose-400 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default WishlistPage;
