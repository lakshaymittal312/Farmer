import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Edit3, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import Modal from '../../components/ui/Modal';
import { ErrorState } from '../../components/ui/EmptyState';

const BuyerProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Address Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressLine, setAddressLine] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/buyer-profiles/me');
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { addressLine, district, state: stateName, pincode };
      const res = await api.post('/buyer-profiles/addresses', payload);
      if (res.data.success) {
        setProfile(res.data.data);
        setShowAddressModal(false);
        setAddressLine('');
        setDistrict('');
        setStateName('');
        setPincode('');
      }
    } catch (err) {
      alert(err.message || 'Failed to add address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this delivery address?')) return;
    try {
      const res = await api.delete(`/buyer-profiles/addresses/${addressId}`);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const res = await api.patch(`/buyer-profiles/addresses/${addressId}/default`);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to set default address');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="buyer" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-100">Buyer Profile & Saved Addresses</h1>
            <p className="text-xs text-slate-400 mt-1">Manage delivery locations and account preferences</p>
          </div>

          <Link
            to="/buyer/profile/edit"
            className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-primary-500/20"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile Details
          </Link>
        </div>

        {loading ? (
          <div className="bg-dark-card border border-dark-border rounded-3xl h-80 animate-pulse" />
        ) : error || !profile ? (
          <div className="bg-amber-950/40 border border-amber-800/60 p-8 rounded-3xl text-center space-y-4">
            <h3 className="text-lg font-bold text-amber-200">No Buyer Profile Initialized</h3>
            <p className="text-xs text-amber-300/80 max-w-md mx-auto">Create your buyer profile to add saved addresses and customize preferred categories.</p>
            <Link to="/buyer/profile/edit" className="inline-block bg-amber-500 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl">
              Create Buyer Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Account Card */}
            <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold text-xl">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">{profile.user?.name}</h2>
                <p className="text-xs text-slate-400">{profile.user?.email} • {profile.phone || 'Phone not set'}</p>
              </div>
            </div>

            {/* Saved Addresses Section */}
            <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-400" /> Saved Delivery Addresses
                </h3>

                <button
                  onClick={() => setShowAddressModal(true)}
                  className="bg-dark-bg border border-dark-border hover:border-primary-500 text-primary-400 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {profile.deliveryAddresses?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No saved delivery addresses yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.deliveryAddresses?.map((addr) => (
                    <div
                      key={addr._id}
                      className={`p-4 rounded-2xl border space-y-2 relative ${
                        addr.isDefault ? 'bg-emerald-950/40 border-primary-500' : 'bg-dark-bg border-dark-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 text-xs">{addr.addressLine}</span>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Default
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400">
                        {addr.district}, {addr.state} - {addr.pincode}
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-dark-border/60">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr._id)}
                            className="text-[11px] text-primary-400 hover:underline font-semibold"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-950"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal for adding address */}
        <Modal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title="Add Delivery Address">
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">District / City</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PIN Code</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAddressModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl">
                {submitting ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default BuyerProfileView;
