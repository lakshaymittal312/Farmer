import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Upload, Sprout, AlertCircle, PlusCircle } from 'lucide-react';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [isOrganic, setIsOrganic] = useState(false);
  const [harvestDate, setHarvestDate] = useState('');
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0) setCategory(res.data.data[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    setUploadingImage(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setImages((prev) => [...prev, ...(res.data.urls || [])]);
        toast.success('Images uploaded successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError('Please upload at least one image of your produce.');
      toast.error('Please upload at least one product image.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        category,
        description,
        price: parseFloat(price),
        unit,
        quantity: parseInt(quantity, 10),
        isOrganic,
        harvestDate: harvestDate || undefined,
        images,
      };

      const res = await productApi.createProduct(payload);
      if (res.data.success) {
        toast.success('Product created successfully!');
        navigate('/farmer/products');
      }
    } catch (err) {
      setError(err.message || 'Failed to create product');
      toast.error(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
        <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
        {/* Basic Produce Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Alphanso Mangoes"
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe harvest method, freshness, grade quality, packaging details..."
            className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Price per Unit (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="120"
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Type *</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            >
              {['kg', 'ton', 'quintal', 'gram', 'piece', 'box', 'bag', 'liter', 'dozen'].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Available Quantity *</label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="500"
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Harvest Date & Organic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Harvest Date</label>
            <input
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="pt-4 sm:pt-0">
            <label className="flex items-center gap-3 cursor-pointer bg-dark-bg border border-dark-border p-3.5 rounded-xl">
              <input
                type="checkbox"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
                className="w-4 h-4 accent-primary-500 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-100 block">100% Certified Organic Crop</span>
                <span className="text-[10px] text-slate-400">Grown without synthetic pesticides/fertilizers</span>
              </div>
            </label>
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">Produce Photographs *</label>

          <div className="border-2 border-dashed border-dark-border rounded-2xl p-6 text-center space-y-3 bg-dark-bg/50 hover:border-primary-500/50 transition">
            <Upload className="w-8 h-8 text-primary-400 mx-auto" />
            <div>
              <p className="text-xs font-bold text-slate-200">Click to upload crop images</p>
              <p className="text-[11px] text-slate-400">PNG, JPG, or WEBP (Up to 5MB each)</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="product-image-input"
            />
            <label
              htmlFor="product-image-input"
              className="inline-block bg-dark-card border border-dark-border hover:border-primary-500 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer text-slate-200 transition"
            >
              {uploadingImage ? 'Uploading Image...' : 'Browse Images'}
            </label>
          </div>

          {/* Uploaded Thumbnails */}
          {images.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pt-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-dark-border shrink-0">
                  <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-rose-950/80 text-rose-300 p-1 rounded-md text-[10px]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
          <Link
            to="/farmer/products"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-dark-hover"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-primary-500/25 transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            {loading ? 'Creating Listing...' : 'Publish Product to Marketplace'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
