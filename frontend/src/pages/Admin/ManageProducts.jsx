import React, { useState, useEffect } from 'react';
import { Search, Power, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import { ProductStatusBadge, OrganicBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      if (res.data.success) setCategories(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getProducts();
      if (res.data.success) {
        setProducts(res.data.products || res.data.data || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await productApi.updateProduct(product._id, { status: newStatus });
      if (res.data.success) {
        toast.success(`Product status set to ${newStatus}`);
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, status: newStatus } : p))
        );
      }
    } catch (e) {
      toast.error(e.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Admin confirmation: Delete this product from marketplace catalog?')) return;
    try {
      const res = await productApi.deleteProduct(id);
      if (res.data.success) {
        toast.success('Product deleted');
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (e) {
      toast.error(e.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.farmer?.farmName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? p.category?._id === selectedCategory || p.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-dark-border pb-6">
        <h1 className="text-3xl font-black text-slate-100">Global Product Catalog</h1>
        <p className="text-xs text-slate-400 mt-1">Audit, moderate, and manage all produce listed across the platform</p>
      </div>

      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search crop name or farm name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-dark-bg border border-dark-border text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary-500 w-full sm:w-auto"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState title="No Products Found" description="No catalog produce matches your search parameters." />
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                <tr>
                  <th className="p-4">Crop Produce</th>
                  <th className="p-4">Farmer / Producer</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-dark-hover transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={p.images && p.images[0] ? p.images[0] : ''}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover"
                          hoverScale={false}
                        />
                        <div>
                          <span className="font-bold text-slate-100 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.category?.name || 'Produce'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-200 block">{p.farmer?.farmName || 'Local Farm'}</span>
                      <span className="text-[10px] text-slate-400">{p.farmer?.user?.name}</span>
                    </td>

                    <td className="p-4 font-black text-primary-400">
                      ₹{p.price} <span className="text-[10px] text-slate-400 font-normal">/ {p.unit}</span>
                    </td>

                    <td className="p-4 font-bold text-slate-200">
                      {p.quantity} {p.unit}
                    </td>

                    <td className="p-4">
                      <ProductStatusBadge status={p.status} />
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`p-2 rounded-xl border transition ${
                            p.status === 'active'
                              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                              : 'bg-dark-bg border-dark-border text-slate-400'
                          }`}
                          title="Toggle Status"
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/products/${p._id}`}
                          className="p-2 rounded-xl bg-dark-bg border border-dark-border text-slate-300 hover:text-white"
                          title="View Product"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-2 rounded-xl bg-dark-bg border border-dark-border text-rose-400 hover:bg-rose-950/40"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
