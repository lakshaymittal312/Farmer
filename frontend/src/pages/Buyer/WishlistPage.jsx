import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { buyerApi } from '../../services/buyerApi';
import ProductCard from '../../components/ProductCard';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await buyerApi.getProfile();
      if (res.data.success && res.data.data) {
        setWishlistItems(res.data.data.wishlist || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100">Saved Wishlist</h1>
          <p className="text-xs text-slate-400 mt-1">Your bookmarked farm produce and seasonal harvests</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchWishlist} />
      ) : wishlistItems.length === 0 ? (
        <EmptyState
          title="Your Wishlist is Empty"
          description="Browse the agricultural marketplace and bookmark crops for quick re-ordering."
          icon={Heart}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
