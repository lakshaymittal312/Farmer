import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const BuyerEditProfile = () => {
  const navigate = useNavigate();
  const [preferredCategories, setPreferredCategories] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [isNew, setIsNew] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/buyer-profiles/me');
      if (res.data.success && res.data.data) {
        const p = res.data.data;
        setPreferredCategories(p.preferredCategories ? p.preferredCategories.join(', ') : '');
        if (p.deliveryAddresses && p.deliveryAddresses.length > 0) {
          const def = p.deliveryAddresses.find((a) => a.isDefault) || p.deliveryAddresses[0];
          setAddress(def.address);
          setCity(def.city);
          setState(def.state);
          setPincode(def.pincode);
        }
        setIsNew(false);
      }
    } catch (e) {
      setIsNew(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    const payload = {
      preferredCategories: preferredCategories.split(',').map((s) => s.trim()).filter(Boolean),
      deliveryAddresses: address ? [{ label: 'Home', address, city, state, pincode, isDefault: true }] : [],
    };

    try {
      if (isNew) {
        await api.post('/buyer-profiles', payload);
      } else {
        await api.put('/buyer-profiles/me', payload);
      }
      setMsg('Profile saved successfully!');
      setTimeout(() => navigate('/buyer/profile'), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{isNew ? 'Create Buyer Profile' : 'Edit Buyer Profile'}</h1>
        {msg && <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded text-sm">{msg}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Categories (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Vegetables, Grains, Organic Spices"
              value={preferredCategories}
              onChange={(e) => setPreferredCategories(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 pt-2">Default Delivery Address</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded shadow mt-4"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuyerEditProfile;
