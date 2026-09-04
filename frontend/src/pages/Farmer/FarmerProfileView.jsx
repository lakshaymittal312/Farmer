import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, MapPin, Edit3, ShieldCheck, Star, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { VerificationBadge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/ui/EmptyState';

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
      const res = await api.get('/farmer-profiles/me');
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="farmer" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
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
          <div className="bg-dark-card border border-dark-border rounded-3xl h-80 animate-pulse" />
        ) : error || !profile ? (
          <div className="bg-amber-950/40 border border-amber-800/60 p-8 rounded-3xl text-center space-y-4">
            <h3 className="text-lg font-bold text-amber-200">No Farm Profile Setup Found</h3>
            <p className="text-xs text-amber-300/80 max-w-md mx-auto">
              You haven't set up your farm details yet. Please create your profile to start listing crops.
            </p>
            <Link
              to="/farmer/profile/edit"
              className="inline-block bg-amber-500 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl"
            >
              Setup Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Farm Banner Card */}
            <div className="glass-panel p-8 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold text-2xl shadow-lg">
                    <Sprout className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-slate-100">{profile.farmName}</h2>
                      <VerificationBadge status={profile.verificationStatus} />
                    </div>
                    {profile.location && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-400" />
                        {profile.location.district}, {profile.location.state} - {profile.location.pincode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-dark-card border border-dark-border px-4 py-2 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reputation Rating</span>
                    <span className="text-base font-black text-accent-gold">⭐ {profile.rating || 5.0}</span>
                  </div>
                  <div className="border-l border-dark-border pl-4">
                    <span className="text-slate-400 block text-[10px]">Land Area</span>
                    <span className="text-base font-bold text-slate-100">{profile.farmSize || 'N/A'} Acres</span>
                  </div>
                </div>
              </div>

              {profile.farmDescription && (
                <p className="text-xs text-slate-300 pt-3 border-t border-dark-border/60 leading-relaxed">
                  {profile.farmDescription}
                </p>
              )}
            </div>

            {/* Crops & Practices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Primary Crops Produced</h3>
                <div className="flex flex-wrap gap-2 pt-2">
                  {profile.cropsProduced && profile.cropsProduced.length > 0 ? (
                    profile.cropsProduced.map((c, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-primary-300 border border-primary-800/40">
                        🌱 {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No primary crops listed</span>
                  )}
                </div>
              </div>

              <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Farming Practice Type</h3>
                <p className="text-xs text-slate-300 font-medium">
                  {profile.farmingType ? (
                    <span className="capitalize font-bold text-primary-400">{profile.farmingType} Farming</span>
                  ) : (
                    'Conventional / Mixed Farming'
                  )}
                </p>
                {profile.organicCertified && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Certified Organic Farm
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FarmerProfileView;
