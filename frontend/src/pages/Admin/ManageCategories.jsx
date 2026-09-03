import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?all=true');
      if (res.data.success) setCategories(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    const payload = { name, slug, icon, description, isActive };

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
        setMsg('Category updated successfully!');
      } else {
        await api.post('/categories', payload);
        setMsg('Category created successfully!');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setSlug(cat.slug || '');
    setIcon(cat.icon || '');
    setDescription(cat.description || '');
    setIsActive(cat.isActive);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setIcon('');
    setDescription('');
    setIsActive(true);
  };

  if (loading) return <div className="p-8 text-center">Loading categories...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Category Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{editingId ? 'Edit Category' : 'Create Category'}</h2>
        {msg && <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded text-xs">{msg}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-xs">{error}</div>}

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Slug (optional auto-generated)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Icon / Image URL</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="catActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="catActive" className="text-xs text-gray-700 font-semibold">Active Category</label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded text-sm shadow">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-3 py-2 rounded text-sm">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Category List */}
      <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-semibold">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">{c.name}</td>
                <td className="p-4 text-gray-500 font-mono text-xs">{c.slug}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(c)} className="text-amber-600 font-semibold hover:underline">Edit</button>
                  <button onClick={() => handleDelete(c._id)} className="text-red-600 font-semibold hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCategories;
