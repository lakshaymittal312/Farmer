import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, MapPin, Edit3 } from 'lucide-react';
import { farmerApi } from '../../services/farmerApi';
import { VerificationBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const FarmerProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await farmerApi.getProfile();
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100">Farm Credentials</h1>
          <p className="text-xs text-slate-400 mt-1">Official farm verification details & enterprise information</p>
        </div>

        <Link
          to="/farmer/profile/edit"
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
          title="No Farm Profile Found"
          description="Create your farm details to get verified and list produce."
          actionLabel="Create Profile"
          onAction={() => window.location.assign('/farmer/profile/edit')}
        />
      ) : (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold text-2xl">
                  <Sprout className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-100">{profile.farmName}</h2>
                    <VerificationBadge status={profile.verificationStatus} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Owner: <span className="text-slate-200 font-medium">{profile.user?.name || 'Registered Farmer'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Farm Overview Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Farm Location</span>
                <p className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  {profile.district || profile.location?.district || 'District'}, {profile.state || profile.location?.state || 'State'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {profile.village || profile.location?.addressLine}{profile.pincode ? `, PIN: ${profile.pincode}` : ''}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Farming Practice</span>
                <p className="font-bold text-slate-100 text-sm capitalize">{profile.farmingType || 'Conventional'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Farm Rating</span>
                <p className="font-bold text-amber-400 text-sm">⭐ {profile.rating || 5.0} / 5.0</p>
              </div>
            </div>

            {/* Description */}
            {profile.farmDescription && (
              <div className="pt-4 border-t border-dark-border space-y-1">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">About The Farm</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{profile.farmDescription}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerProfileView;
