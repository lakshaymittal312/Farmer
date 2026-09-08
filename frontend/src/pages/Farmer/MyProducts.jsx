import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Trash2, Edit3, Eye, Power } from 'lucide-react';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import { ProductStatusBadge, OrganicBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyProducts();
    fetchCategories();
  }, []);

  const fetchMyProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productApi.getProducts({ farmer: 'me' });
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      if (res.data.success) setCategories(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await productApi.toggleStatus(id);
      if (res.data.success) {
        toast.success(`Product status updated to ${res.data.product.status}`);
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: res.data.product.status } : p))
        );
      }
    } catch (e) {
      toast.error(e.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const res = await productApi.deleteProduct(productToDelete._id);
      if (res.data.success) {
        toast.success('Product deleted successfully');
        setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
        setDeleteModalOpen(false);
        setProductToDelete(null);
      }
    } catch (e) {
      toast.error(e.message || 'Failed to delete product');
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
    <div className="space-y-6">
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
          <PlusCircle className="w-4 h-4" /> Add New Crop Listing
        </Link>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search crop name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-dark-bg border border-dark-border text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-dark-bg border border-dark-border text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      {loading ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMyProducts} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No Produce Found"
          description="You haven't listed any produce matching the specified search parameters."
          actionLabel="Add Product"
          onAction={() => window.location.assign('/farmer/products/add')}
        />
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                <tr>
                  <th className="p-4">Crop Produce</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Organic</th>
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
                          <span className="text-[10px] text-slate-400">ID: #{p._id.substring(18)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-300 font-medium">
                      {p.category?.name || 'Produce'}
                    </td>

                    <td className="p-4 font-black text-primary-400">
                      ₹{p.price} <span className="text-[10px] text-slate-400 font-normal">/ {p.unit}</span>
                    </td>

                    <td className="p-4">
                      <span className={`font-bold ${(p.quantityAvailable !== undefined ? p.quantityAvailable : p.quantity) > 0 ? 'text-slate-100' : 'text-rose-400'}`}>
                        {p.quantityAvailable !== undefined ? p.quantityAvailable : p.quantity} {p.unit}
                      </span>
                    </td>

                    <td className="p-4">
                      <ProductStatusBadge status={p.status} />
                    </td>

                    <td className="p-4">
                      {p.isOrganic ? <OrganicBadge /> : <span className="text-slate-500 text-[11px]">Conventional</span>}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Active/Inactive */}
                        <button
                          onClick={() => handleToggleStatus(p._id)}
                          className={`p-2 rounded-xl border transition ${
                            p.status === 'active'
                              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900'
                              : 'bg-dark-bg border-dark-border text-slate-400 hover:text-slate-200'
                          }`}
                          title={p.status === 'active' ? 'Deactivate Product' : 'Activate Product'}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {/* View Details */}
                        <Link
                          to={`/products/${p._id}`}
                          className="p-2 rounded-xl bg-dark-bg border border-dark-border text-slate-300 hover:text-white"
                          title="View Public Card"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Edit Product */}
                        <Link
                          to={`/farmer/products/${p._id}/edit`}
                          className="p-2 rounded-xl bg-dark-bg border border-dark-border text-primary-400 hover:bg-dark-hover"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        {/* Delete Product */}
                        <button
                          onClick={() => {
                            setProductToDelete(p);
                            setDeleteModalOpen(true);
                          }}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Produce Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete <span className="font-bold text-slate-100">{productToDelete?.name}</span>? This action cannot be undone and will remove it from the public marketplace.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
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
    </div>
  );
};

export default MyProducts;
