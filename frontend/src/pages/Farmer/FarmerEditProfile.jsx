import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import { farmerApi } from '../../services/farmerApi';
import toast from 'react-hot-toast';

const FarmerEditProfile = () => {
  const navigate = useNavigate();

  const [farmName, setFarmName] = useState('');
  const [farmDescription, setFarmDescription] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [farmingType, setFarmingType] = useState('organic');
  const [cropsGrown, setCropsGrown] = useState('');

  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const res = await farmerApi.getProfile();
      if (res.data.success && res.data.data) {
        const p = res.data.data;
        setFarmName(p.farmName || '');
        setFarmDescription(p.farmDescription || '');
        setAddressLine(p.village || p.location?.addressLine || '');
        setDistrict(p.district || p.location?.district || '');
        setStateName(p.state || p.location?.state || '');
        setPincode(p.pincode || p.location?.pincode || '');
        setFarmingType(p.farmingType || 'organic');
        setCropsGrown(p.cropsGrown ? p.cropsGrown.join(', ') : '');
      }
    } catch (e) {
      // Profile might not exist yet
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        farmName,
        farmDescription,
        village: addressLine,
        district,
        state: stateName,
        pincode,
        location: {
          addressLine,
          district,
          state: stateName,
          pincode,
        },
        farmingType,
        cropsGrown: cropsGrown ? cropsGrown.split(',').map((c) => c.trim()) : [],
      };

      const res = await farmerApi.updateProfile(payload);
      if (res.data.success) {
        toast.success('Farm profile updated successfully!');
        navigate('/farmer/profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile');
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return <div className="bg-dark-card border border-dark-border rounded-2xl h-96 animate-pulse p-8" />;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/farmer/profile"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-400 transition"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Farm Profile
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100">Edit Farm Profile</h1>
          <p className="text-xs text-slate-400 mt-1">Configure your official farm details and agricultural practices</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Farm Enterprise Name *</label>
          <input
            type="text"
            required
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            placeholder="e.g. Green Valley Agro Farms"
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Farm Description</label>
          <textarea
            rows="3"
            value={farmDescription}
            onChange={(e) => setFarmDescription(e.target.value)}
            placeholder="Share details about your soil type, irrigation, farm history, certification standards..."
            className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Location fields */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Farm Location & Address</h4>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Street / Village / Farm Address *</label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. Plot 14, Riverbank Road"
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">District / City *</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Nashik"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">State *</label>
              <input
                type="text"
                required
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="Maharashtra"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">PIN Code *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="422001"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Farming Type</label>
            <select
              value={farmingType}
              onChange={(e) => setFarmingType(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            >
              <option value="organic">Organic Farming</option>
              <option value="conventional">Conventional Farming</option>
              <option value="hydroponic">Hydroponic / Protected Cultivation</option>
              <option value="mixed">Mixed Agricultural Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Major Crops Grown (Comma Separated)</label>
            <input
              type="text"
              value={cropsGrown}
              onChange={(e) => setCropsGrown(e.target.value)}
              placeholder="e.g. Wheat, Tomatoes, Mangoes, Grapes"
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
          <Link
            to="/farmer/profile"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-dark-hover"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-primary-500/25 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FarmerEditProfile;
