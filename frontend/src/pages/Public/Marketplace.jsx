import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Sparkles } from 'lucide-react';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';
import ProductCard from '../../components/ProductCard';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();

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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, isOrganic, minPrice, maxPrice, sortBy, searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      if (res.data.success) setCategories(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async (overrideSearch = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      const q = overrideSearch !== null ? overrideSearch : searchQuery;
      if (q) params.search = q;
      if (isOrganic) params.isOrganic = isOrganic;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy) params.sortBy = sortBy;
      params.status = 'active';

      const res = await productApi.getProducts(params);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load products');
    } finally {
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
    fetchProducts('');
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
                onClick={() => {
                  setSearchQuery('');
                  fetchProducts('');
                }}
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
            <CardSkeleton key={n} />
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
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
