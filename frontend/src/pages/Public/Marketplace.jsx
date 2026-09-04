import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, Sparkles, MapPin, Sprout, ShoppingCart, Star } from 'lucide-react';
import api from '../../services/api';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import RatingStars from '../../components/ui/RatingStars';
import { useAuth } from '../../context/AuthContext';

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isBuyer } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [isOrganic, setIsOrganic] = useState(searchParams.get('organic') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [cartAddingId, setCartAddingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, isOrganic, minPrice, maxPrice, sortBy, searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) setCategories(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (isOrganic) params.isOrganic = isOrganic;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy) params.sortBy = sortBy;
      params.status = 'active';

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load products');
    } flex: {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setIsOrganic('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setSearchParams({});
  };

  const handleAddToCart = async (product) => {
    if (!isBuyer) {
      alert('Please log in as a buyer to add items to your cart.');
      return;
    }
    setCartAddingId(product._id);
    try {
      await api.post('/cart/items', { productId: product._id, quantity: 1 });
      alert(`Added 1 ${product.unit} of ${product.name} to cart!`);
    } catch (err) {
      alert(err.message || 'Failed to add to cart');
    } finally {
      setCartAddingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">Agricultural Marketplace</h1>
          <p className="text-sm text-slate-400 mt-1">Direct produce sourcing from verified regional farmers</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-dark-card border border-dark-border text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary-500"
          >
            <option value="newest">Newest Harvests</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* TOP SEARCH & FILTER BAR */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search crops, vegetables, fruits, grains, or farmer location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-primary-500/20 text-sm whitespace-nowrap"
          >
            Search Marketplace
          </button>
        </form>

        {/* Category Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === ''
                ? 'bg-primary-500 text-slate-950 font-bold'
                : 'bg-dark-card border border-dark-border text-slate-300 hover:bg-dark-hover'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === c._id
                  ? 'bg-primary-500 text-slate-950 font-bold'
                  : 'bg-dark-card border border-dark-border text-slate-300 hover:bg-dark-hover'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Secondary Filter Options */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-dark-border/60 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={isOrganic === 'true'}
                onChange={(e) => setIsOrganic(e.target.checked ? 'true' : '')}
                className="w-4 h-4 accent-primary-500 rounded bg-dark-bg border-dark-border"
              />
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              Organic Only
            </label>
          </div>

          {(selectedCategory || searchQuery || isOrganic || minPrice || maxPrice) && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* PRODUCTS GRID / STATES */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse p-4 space-y-3">
              <div className="bg-dark-hover h-44 rounded-xl w-full" />
              <div className="bg-dark-hover h-5 rounded w-3/4" />
              <div className="bg-dark-hover h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description="We couldn't find any active produce matching your specified search and filter criteria."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative p-2">
                  <ImageWithFallback
                    src={p.images && p.images[0] ? p.images[0] : ''}
                    alt={p.name}
                    className="w-full h-48 object-cover rounded-xl"
                    tilt={true}
                  />
                  {p.isOrganic && (
                    <span className="absolute top-4 left-4 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md">
                      Organic
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-slate-100 text-lg line-clamp-1 group-hover:text-primary-400 transition">
                      {p.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                    <span className="truncate">{p.farmer?.farmName || 'Verified Local Farm'}</span>
                  </p>

                  {p.location && (p.location.district || p.location.state) && (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{p.location.district}, {p.location.state}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xl font-black text-primary-400">
                        ₹{p.price} <span className="text-xs font-normal text-slate-400">/ {p.unit}</span>
                      </p>
                    </div>
                    <RatingStars rating={p.rating || 5} size="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                <Link
                  to={`/products/${p._id}`}
                  className="block text-center bg-dark-card hover:bg-dark-hover text-slate-200 font-medium text-xs py-2.5 rounded-xl border border-dark-border transition"
                >
                  Details
                </Link>

                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={cartAddingId === p._id}
                  className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {cartAddingId === p._id ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
