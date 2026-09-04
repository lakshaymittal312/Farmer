import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Sparkles } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';

const FarmerEditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Profile Fields
  const [farmName, setFarmName] = useState('');
  const [farmDescription, setFarmDescription] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [farmingType, setFarmingType] = useState('organic');
  const [cropsInput, setCropsInput] = useState('');
  const [organicCertified, setOrganicCertified] = useState(false);

  // Location Fields
  const [addressLine, setAddressLine] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/farmer-profiles/me');
      if (res.data.success && res.data.data) {
        const p = res.data.data;
        setFarmName(p.farmName || '');
        setFarmDescription(p.farmDescription || '');
        setFarmSize(p.farmSize || '');
        setFarmingType(p.farmingType || 'organic');
        setCropsInput(p.cropsProduced ? p.cropsProduced.join(', ') : '');
        setOrganicCertified(!!p.organicCertified);

        if (p.location) {
          setAddressLine(p.location.addressLine || '');
          setDistrict(p.location.district || '');
          setStateName(p.location.state || '');
          setPincode(p.location.pincode || '');
        }
      }
    } catch (e) {
      // profile doesn't exist yet, form stays blank
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const cropsProduced = cropsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const payload = {
      farmName,
      farmDescription,
      farmSize: Number(farmSize) || 0,
      farmingType,
      cropsProduced,
      organicCertified,
      location: {
        addressLine,
        district,
        state: stateName,
        pincode,
      },
    };

    try {
      // Check if profile exists
      const pRes = await api.get('/farmer-profiles/me');
      let res;
      if (pRes.data.success && pRes.data.data) {
        res = await api.put('/farmer-profiles/me', payload);
      } else {
        res = await api.post('/farmer-profiles', payload);
      }

      if (res.data.success) {
        alert('Farmer profile updated successfully!');
        navigate('/farmer/profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="farmer" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <Link
          to="/farmer/profile"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-400 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Farm Profile
        </Link>

        <div className="border-b border-dark-border pb-6">
          <h1 className="text-3xl font-black text-slate-100">Setup / Edit Farm Profile</h1>
          <p className="text-xs text-slate-400 mt-1">Provide accurate farm details for administrator verification</p>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Farm Enterprise Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="e.g. Green Acres Organic Farm"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Land Size (Acres)</label>
              <input
                type="number"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                placeholder="e.g. 15"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Farm Description</label>
            <textarea
              rows="3"
              value={farmDescription}
              onChange={(e) => setFarmDescription(e.target.value)}
              placeholder="Describe your harvesting techniques, soil types, and produce quality..."
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Farming Type</label>
              <select
                value={farmingType}
                onChange={(e) => setFarmingType(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              >
                <option value="organic">Organic Farming</option>
                <option value="conventional">Conventional Farming</option>
                <option value="hydroponic">Hydroponic / Vertical</option>
                <option value="mixed">Mixed Agriculture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Crops Produced (comma separated)</label>
              <input
                type="text"
                value={cropsInput}
                onChange={(e) => setCropsInput(e.target.value)}
                placeholder="e.g. Tomatoes, Mangoes, Wheat, Pulses"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="organicCertCheck"
              checked={organicCertified}
              onChange={(e) => setOrganicCertified(e.target.checked)}
              className="w-5 h-5 accent-primary-500 rounded bg-dark-bg border-dark-border"
            />
            <label htmlFor="organicCertCheck" className="text-xs font-bold text-slate-200 cursor-pointer flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              100% Certified Organic Producer
            </label>
          </div>

          {/* Address Section */}
          <div className="pt-4 border-t border-dark-border space-y-4">
            <h4 className="text-sm font-bold text-slate-100">Farm Location Details</h4>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Village / Street Address</label>
              <input
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="e.g. Gate 45, Nashik Road"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Nashik"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="422001"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-border flex justify-end gap-4">
            <Link to="/farmer/profile" className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:bg-dark-hover">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-8 py-3 rounded-xl shadow-lg shadow-primary-500/25 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Credentials'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default FarmerEditProfile;
