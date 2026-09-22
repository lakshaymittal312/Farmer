import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Edit3, Plus } from 'lucide-react';
import { buyerApi } from '../../services/buyerApi';
import { ErrorState, EmptyState } from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

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
      const res = await buyerApi.getProfile();
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
      const newAddress = { label: 'Home', address: addressLine, city: district, state: stateName, pincode };
      const currentAddrs = profile?.deliveryAddresses || [];
      const updatedAddrs = [...currentAddrs, newAddress];
      const res = await buyerApi.updateProfile({ deliveryAddresses: updatedAddrs });
      if (res.data.success) {
        toast.success('Address saved successfully');
        setProfile(res.data.data);
        setShowAddressModal(false);
        setAddressLine('');
        setDistrict('');
        setStateName('');
        setPincode('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add address');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100">Buyer Account Profile</h1>
          <p className="text-xs text-slate-400 mt-1">Manage delivery addresses and purchasing preferences</p>
        </div>

        <Link
          to="/buyer/profile/edit"
          className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-primary-500/20"
        >
          <Edit3 className="w-4 h-4" /> Edit Profile Details
        </Link>
      </div>

      {loading ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProfile} />
      ) : !profile ? (
        <EmptyState
          title="No Profile Found"
          description="Initialize your buyer profile to add delivery addresses."
          actionLabel="Create Profile"
          onAction={() => window.location.assign('/buyer/profile/edit')}
        />
      ) : (
        <div className="space-y-6">
          {/* Main User Overview Card */}
          <div className="bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-950 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-2xl">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100">{profile.user?.name || 'Buyer Account'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{profile.user?.email} • {profile.user?.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pt-4 border-t border-dark-border">
              <div>
                <span className="text-slate-400 font-medium">Business / Buyer Type</span>
                <p className="font-bold text-slate-100 text-sm capitalize">{profile.buyerType || 'Retail Buyer'}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Saved Addresses Count</span>
                <p className="font-bold text-primary-400 text-sm">{profile.deliveryAddresses?.length || 0} Locations</p>
              </div>
            </div>
          </div>

          {/* Delivery Addresses Section */}
          <div className="bg-dark-card border border-dark-border p-6 sm:p-8 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-400" /> Saved Delivery Destinations
              </h3>
              <button
                onClick={() => setShowAddressModal(true)}
                className="bg-dark-bg border border-dark-border hover:border-primary-500 text-primary-400 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {!profile.deliveryAddresses || profile.deliveryAddresses.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No delivery addresses saved yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.deliveryAddresses.map((addr, idx) => (
                  <div key={idx} className="bg-dark-bg border border-dark-border p-4 rounded-2xl space-y-1">
                    <p className="font-bold text-slate-100 text-xs">{addr.address || addr.addressLine}</p>
                    <p className="text-xs text-slate-400">{addr.city || addr.district}, {addr.state} - {addr.pincode}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      <Modal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title="Add New Delivery Destination">
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. Flat 402, Sunshine Heights"
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
                placeholder="Mumbai"
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
                placeholder="Maharashtra"
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
              placeholder="400001"
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-dark-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl"
            >
              {submitting ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BuyerProfileView;
