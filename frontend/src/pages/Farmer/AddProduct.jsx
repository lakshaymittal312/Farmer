import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, ChevronLeft, Plus, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import ImageWithFallback from '../../components/ui/ImageWithFallback';

const AddProduct = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Location Details
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0) setCategory(res.data.data[0]._id);
      }
    } catch (e) {
      console.error(e);
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
    if (!name || !price || !quantity || !category) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name,
        category,
        description,
        price: Number(price),
        unit,
        quantity: Number(quantity),
        images: images.length > 0 ? images : [imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'],
        isOrganic,
        harvestDate: harvestDate || new Date().toISOString(),
        location: {
          district: district || 'Regional',
          state: stateName || 'State',
        },
        status: 'active',
      };

      const res = await api.post('/products', payload);
      if (res.data.success) {
        alert('Harvest product listing published successfully!');
        navigate('/farmer/products');
      }
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
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
            <h1 className="text-3xl font-black text-slate-100">Add New Crop Harvest</h1>
            <p className="text-xs text-slate-400 mt-1">
              List fresh produce directly for marketplace buyers
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Crop Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Organic Alphonsos Mangoes"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
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

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Price (₹) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 120"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Measurement Unit</label>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Harvest Stock Quantity <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Harvest Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail crop quality, soil conditions, shelf life, and farming practices..."
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Images Section */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">Product Images (URLs)</label>
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

            {/* Thumbnail Previews */}
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

          {/* Organic & Harvest Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="organicCheck"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
                className="w-5 h-5 accent-primary-500 rounded bg-dark-bg border-dark-border"
              />
              <label htmlFor="organicCheck" className="text-xs font-bold text-slate-200 cursor-pointer flex items-center gap-1">
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Nashik"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>
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
              disabled={loading}
              className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-8 py-3 rounded-xl shadow-lg shadow-primary-500/25 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Publishing...' : 'Publish Product Listing'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddProduct;
