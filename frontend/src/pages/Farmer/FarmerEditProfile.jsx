import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const FarmerEditProfile = () => {
  const navigate = useNavigate();
  const [farmName, setFarmName] = useState('');
  const [farmDescription, setFarmDescription] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [farmingType, setFarmingType] = useState('conventional');
  const [cropsGrown, setCropsGrown] = useState('');

  const [isNew, setIsNew] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/farmer-profiles/me');
      if (res.data.success && res.data.data) {
        const p = res.data.data;
        setFarmName(p.farmName || '');
        setFarmDescription(p.farmDescription || '');
        setVillage(p.village || '');
        setDistrict(p.district || '');
        setState(p.state || '');
        setPincode(p.pincode || '');
        setFarmingType(p.farmingType || 'conventional');
        setCropsGrown(p.cropsGrown ? p.cropsGrown.join(', ') : '');
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
      farmName,
      farmDescription,
      village,
      district,
      state,
      pincode,
      farmingType,
      cropsGrown: cropsGrown.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (isNew) {
        await api.post('/farmer-profiles', payload);
      } else {
        await api.put('/farmer-profiles/me', payload);
      }
      setMsg('Profile saved successfully!');
      setTimeout(() => navigate('/farmer/profile'), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{isNew ? 'Create Farmer Profile' : 'Edit Farmer Profile'}</h1>
        {msg && <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded text-sm">{msg}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Farm Name *</label>
            <input
              type="text"
              required
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Farm Description</label>
            <textarea
              rows="3"
              value={farmDescription}
              onChange={(e) => setFarmDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Village *</label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">District *</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Farming Type</label>
            <select
              value={farmingType}
              onChange={(e) => setFarmingType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="conventional">Conventional</option>
              <option value="organic">Organic</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Crops Grown (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Wheat, Rice, Mustard"
              value={cropsGrown}
              onChange={(e) => setCropsGrown(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded shadow"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default FarmerEditProfile;
