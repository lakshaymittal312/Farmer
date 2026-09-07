import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Layers } from 'lucide-react';
import { categoryApi } from '../../services/categoryApi';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoryApi.getCategories();
      if (res.data.success) {
        setCategories(res.data.data || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (editingCategory) {
        const res = await categoryApi.updateCategory(editingCategory._id, { name, description });
        if (res.data.success) {
          toast.success('Category updated successfully');
          setCategories((prev) =>
            prev.map((c) => (c._id === editingCategory._id ? res.data.data : c))
          );
        }
      } else {
        const res = await categoryApi.createCategory({ name, description });
        if (res.data.success) {
          toast.success('Category created successfully');
          setCategories((prev) => [...prev, res.data.data]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await categoryApi.deleteCategory(id);
      if (res.data.success) {
        toast.success('Category deleted');
        setCategories((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100">Agricultural Categories</h1>
          <p className="text-xs text-slate-400 mt-1">Manage crop taxonomy and marketplace produce classification</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" /> Create Category
        </button>
      </div>

      {loading ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCategories} />
      ) : categories.length === 0 ? (
        <EmptyState title="No Categories Found" description="Create the first agricultural category." icon={Layers} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-100 text-base">{cat.name}</h3>
                  <span className="text-[10px] font-mono text-slate-500">#{cat._id.substring(18)}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{cat.description || 'No description provided.'}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-dark-border">
                <button
                  onClick={() => handleOpenEditModal(cat)}
                  className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-primary-400 hover:bg-dark-hover"
                  title="Edit Category"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-rose-400 hover:bg-rose-950/40"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Vegetables"
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of crop types included in this category..."
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-dark-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl"
            >
              {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCategories;
