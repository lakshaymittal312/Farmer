import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import { buyerApi } from '../../services/buyerApi';
import toast from 'react-hot-toast';

const BuyerEditProfile = () => {
  const navigate = useNavigate();

  const [buyerType, setBuyerType] = useState('retail');
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const res = await buyerApi.getProfile();
      if (res.data.success && res.data.data) {
        setBuyerType(res.data.data.buyerType || 'retail');
      }
    } catch (e) {
      // profile might not exist
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await buyerApi.updateProfile({ buyerType });
      if (res.data.success) {
        toast.success('Buyer profile updated successfully');
        navigate('/buyer/profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile');
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse p-8" />;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/buyer/profile"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-400 transition"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Profile
      </Link>

      <div className="border-b border-dark-border pb-6">
        <h1 className="text-3xl font-black text-slate-100">Edit Buyer Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Update primary contact and buyer information</p>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Buyer Entity Type</label>
          <select
            value={buyerType}
            onChange={(e) => setBuyerType(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
          >
            <option value="retail">Individual / Household Consumer</option>
            <option value="wholesale">Wholesale Crop Distributor</option>
            <option value="restaurant">Restaurant / Hotel Chain</option>
            <option value="exporter">Agri Exporter</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
          <Link
            to="/buyer/profile"
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
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuyerEditProfile;
