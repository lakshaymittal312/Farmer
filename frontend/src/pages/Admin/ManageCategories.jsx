import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit3, Trash2, Check } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import Modal from '../../components/ui/Modal';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

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
      const res = await api.get('/categories');
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
        const res = await api.put(`/categories/${editingCategory._id}`, { name, description });
        if (res.data.success) {
          setCategories((prev) =>
            prev.map((c) => (c._id === editingCategory._id ? res.data.data : c))
          );
        }
      } else {
        const res = await api.post('/categories', { name, description });
        if (res.data.success) {
          setCategories([...categories, res.data.data]);
        }
      }
      setModalOpen(false);
    } catch (e) {
      alert(e.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data.success) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (e) {
      alert(e.message || 'Failed to delete category');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-100">Category Taxonomy</h1>
            <p className="text-xs text-slate-400 mt-1">Manage agricultural produce categories and classification tags</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {loading ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchCategories} />
        ) : categories.length === 0 ? (
          <EmptyState title="No Categories Defined" description="Add your first produce category." actionLabel="Add Category" onAction={handleOpenAddModal} icon={Layers} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <div key={c._id} className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-3 shadow-dark-card hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-100 text-base">{c.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-slate-300 hover:text-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(c._id)}
                      className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-rose-400 hover:bg-rose-950"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{c.description || 'Agricultural produce classification.'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCategory ? 'Edit Crop Category' : 'Create Crop Category'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vegetables, Grains, Fruits"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Category details..."
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
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
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                {submitting ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default ManageCategories;
