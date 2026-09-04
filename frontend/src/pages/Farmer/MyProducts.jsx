import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Edit3, Trash2, Power, Eye, Package, Sparkles } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import Modal from '../../components/ui/Modal';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) setCategories(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMyProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get Logged in farmer profile
      const pRes = await api.get('/farmer-profiles/me');
      if (pRes.data.success && pRes.data.data) {
        const farmerId = pRes.data.data._id;
        const res = await api.get(`/products?farmer=${farmerId}`);
        if (res.data.success) {
          setProducts(res.data.data || []);
        }
      } else {
        setProducts([]);
      }
    } catch (e) {
      setError(e.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put(`/products/${product._id}`, { status: newStatus });
      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, status: newStatus } : p))
        );
      }
    } catch (e) {
      alert(e.message || 'Failed to update status');
    }
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${productToDelete._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (e) {
      alert(e.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category?._id === selectedCategory || p.category === selectedCategory : true;
    const matchesStatus = selectedStatus ? p.status === selectedStatus : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="farmer" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-100">Harvest Inventory</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your crop listings, pricing, stock levels, and marketplace status
            </p>
          </div>

          <Link
            to="/farmer/products/add"
            className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-primary-500/20"
          >
            <PlusCircle className="w-4 h-4" /> Add Product Listing
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="glass-panel p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-dark-bg border border-dark-border text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-dark-bg border border-dark-border text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active (Listed)</option>
            <option value="inactive">Inactive (Hidden)</option>
          </select>
        </div>

        {/* Product Table / Grid */}
        {loading ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchMyProducts} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="No Harvest Products Found"
            description="You don't have any crop listings matching your filter criteria."
            actionLabel="Add First Product"
            onAction={() => window.location.assign('/farmer/products/add')}
          />
        ) : (
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                  <tr>
                    <th className="p-4">Crop</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price / Unit</th>
                    <th className="p-4">Stock Quantity</th>
                    <th className="p-4">Organic</th>
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
                            <span className="font-bold text-slate-100 text-sm block">{p.name}</span>
                            <span className="text-[10px] text-slate-500">ID: #{p._id.substring(18)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">
                        {p.category?.name || 'Uncategorized'}
                      </td>
                      <td className="p-4 font-bold text-primary-400">
                        ₹{p.price} <span className="text-[10px] text-slate-400 font-normal">/ {p.unit}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-200">
                        {p.quantity} {p.unit}
                      </td>
                      <td className="p-4">
                        {p.isOrganic ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                            <Sparkles className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Standard</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            p.status === 'active'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {p.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${p._id}`}
                            className="p-2 rounded-lg bg-dark-bg border border-dark-border text-slate-400 hover:text-slate-200 hover:border-slate-500 transition"
                            title="View Product Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/farmer/products/${p._id}/edit`}
                            className="p-2 rounded-lg bg-dark-bg border border-dark-border text-primary-400 hover:bg-emerald-950 transition"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleToggleStatus(p)}
                            className={`p-2 rounded-lg bg-dark-bg border border-dark-border transition ${
                              p.status === 'active'
                                ? 'text-amber-400 hover:bg-amber-950'
                                : 'text-emerald-400 hover:bg-emerald-950'
                            }`}
                            title={p.status === 'active' ? 'Deactivate Listing' : 'Activate Listing'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => confirmDelete(p)}
                            className="p-2 rounded-lg bg-dark-bg border border-dark-border text-rose-400 hover:bg-rose-950 transition"
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

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Product Listing"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-100">{productToDelete?.name}</strong> from your crop inventory? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-dark-hover"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-lg shadow-rose-600/20"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default MyProducts;
