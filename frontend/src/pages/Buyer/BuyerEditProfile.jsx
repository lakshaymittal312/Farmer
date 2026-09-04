import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';

const BuyerEditProfile = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/buyer-profiles/me');
      if (res.data.success && res.data.data) {
        setPhone(res.data.data.phone || '');
      }
    } catch (e) {
      // blank
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const pRes = await api.get('/buyer-profiles/me');
      let res;
      if (pRes.data.success && pRes.data.data) {
        res = await api.put('/buyer-profiles/me', { phone });
      } else {
        res = await api.post('/buyer-profiles', { phone });
      }

      if (res.data.success) {
        alert('Buyer profile updated successfully!');
        navigate('/buyer/profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to save buyer profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="buyer" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
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
          <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 space-y-6 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="pt-4 border-t border-dark-border flex justify-end gap-4">
            <Link to="/buyer/profile" className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:bg-dark-hover">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-8 py-3 rounded-xl shadow-lg shadow-primary-500/25 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default BuyerEditProfile;
