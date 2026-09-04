import React, { useState, useEffect } from 'react';
import { Package, Search, Trash2, Eye, Power, Sparkles } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import Modal from '../../components/ui/Modal';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
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

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/products');
      if (res.data.success) {
        setProducts(res.data.products || []);
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

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category?._id === selectedCategory || p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="border-b border-dark-border pb-6">
          <h1 className="text-3xl font-black text-slate-100">Marketplace Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">Audit, moderate, and manage crop listings across the entire system</p>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-dark-bg border border-dark-border text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Table */}
        {loading ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchProducts} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState title="No Products Found" description="No catalog listings match your filter." />
        ) : (
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                  <tr>
                    <th className="p-4">Produce Crop</th>
                    <th className="p-4">Farmer / Origin</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
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
                            {p.isOrganic && (
                              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Organic
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-200 block">{p.farmer?.farmName || 'Farm'}</span>
                        <span className="text-[10px] text-slate-500">{p.location?.district}, {p.location?.state}</span>
                      </td>
                      <td className="p-4 text-slate-300">{p.category?.name || 'Produce'}</td>
                      <td className="p-4 font-bold text-primary-400">₹{p.price} / {p.unit}</td>
                      <td className="p-4 font-semibold text-slate-200">{p.quantity} {p.unit}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'active' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(p)}
                            className={`p-1.5 rounded-lg border transition ${
                              p.status === 'active'
                                ? 'bg-dark-bg border-dark-border text-amber-400 hover:bg-amber-950'
                                : 'bg-dark-bg border-dark-border text-emerald-400 hover:bg-emerald-950'
                            }`}
                            title={p.status === 'active' ? 'Deactivate Listing' : 'Activate Listing'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => confirmDelete(p)}
                            className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-rose-400 hover:bg-rose-950 transition"
                            title="Delete Product Listing"
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
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Marketplace Listing">
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Are you sure you want to permanently delete <strong className="text-slate-100">{productToDelete?.name}</strong> from the public marketplace?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:bg-dark-hover">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl">
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default ManageProducts;
