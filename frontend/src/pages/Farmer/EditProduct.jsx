import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Sparkles } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { ErrorState } from '../../components/ui/EmptyState';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState([]);
  const [isOrganic, setIsOrganic] = useState(false);
  const [harvestDate, setHarvestDate] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    fetchProductAndCategories();
  }, [id]);

  const fetchProductAndCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const cRes = await api.get('/categories');
      if (cRes.data.success) setCategories(cRes.data.data);

      const pRes = await api.get(`/products/${id}`);
      if (pRes.data.success && pRes.data.data) {
        const p = pRes.data.data;
        setName(p.name || '');
        setCategory(p.category?._id || p.category || '');
        setDescription(p.description || '');
        setPrice(p.price || '');
        setUnit(p.unit || 'kg');
        setQuantity(p.quantity || '');
        setImages(p.images || []);
        setIsOrganic(!!p.isOrganic);
        setHarvestDate(p.harvestDate ? p.harvestDate.substring(0, 10) : '');
        setStatus(p.status || 'active');
      }
    } catch (err) {
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;
    setImages([...images, imageUrl.trim()]);
    setImageUrl('');
  };

  const handleRemoveImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        name,
        category,
        description,
        price: Number(price),
        unit,
        quantity: Number(quantity),
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'],
        isOrganic,
        harvestDate,
        status,
      };

      const res = await api.put(`/products/${id}`, payload);
      if (res.data.success) {
        alert('Product details updated successfully!');
        navigate('/farmer/products');
      }
    } catch (err) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="farmer" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <Link
          to="/farmer/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-400 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Crop Inventory
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-100">Edit Product Listing</h1>
            <p className="text-xs text-slate-400 mt-1">Update harvest inventory details and pricing</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-dark-card border border-dark-border rounded-3xl h-96 animate-pulse" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchProductAndCategories} />
        ) : (
          <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="ton">Ton</option>
                  <option value="quintal">Quintal</option>
                  <option value="box">Box / Crate</option>
                  <option value="dozen">Dozen</option>
                  <option value="piece">Piece</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Images Section */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Product Images</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="bg-dark-hover border border-dark-border text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs hover:border-primary-500"
                >
                  Add Image
                </button>
              </div>

              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-dark-border">
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="organicEdit"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                  className="w-5 h-5 accent-primary-500 rounded bg-dark-bg border-dark-border"
                />
                <label htmlFor="organicEdit" className="text-xs font-bold text-slate-200 cursor-pointer flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  100% Certified Organic
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Harvest Date</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Listing Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                >
                  <option value="active">Active (Listed in Marketplace)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-dark-border flex justify-end gap-4">
              <Link
                to="/farmer/products"
                className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:bg-dark-hover"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-8 py-3 rounded-xl shadow-lg shadow-primary-500/25 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Product Updates'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default EditProduct;
