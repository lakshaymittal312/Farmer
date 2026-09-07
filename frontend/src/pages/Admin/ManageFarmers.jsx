import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { VerificationBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const ManageFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getFarmers();
      if (res.data.success) {
        setFarmers(res.data.farmers || res.data.data || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load farmers list');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (farmerId, status) => {
    try {
      const res = await adminApi.verifyFarmer(farmerId, status, status === 'verified');
      if (res.data.success) {
        toast.success(`Farmer verification set to ${status}`);
        setFarmers((prev) =>
          prev.map((f) => (f._id === farmerId ? { ...f, verificationStatus: status } : f))
        );
      }
    } catch (e) {
      toast.error(e.message || 'Failed to update verification status');
    }
  };

  const filteredFarmers = farmers.filter((f) => {
    const term = searchQuery.toLowerCase();
    return (
      (f.farmName || '').toLowerCase().includes(term) ||
      (f.user?.name || '').toLowerCase().includes(term) ||
      (f.location?.district || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100">Farmer Verification Console</h1>
          <p className="text-xs text-slate-400 mt-1">Review credentials, verify farm authenticity, and grant verification badges</p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search farm name, owner name, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchFarmers} />
      ) : filteredFarmers.length === 0 ? (
        <EmptyState title="No Farmers Found" description="No farm accounts match your search filter." />
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                <tr>
                  <th className="p-4">Farm Enterprise</th>
                  <th className="p-4">Owner Contact</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Farming Practice</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredFarmers.map((f) => (
                  <tr key={f._id} className="hover:bg-dark-hover transition">
                    <td className="p-4">
                      <span className="font-bold text-slate-100 block">{f.farmName}</span>
                      <span className="text-[10px] text-slate-400">ID: #{f._id.substring(18)}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-200 block">{f.user?.name || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400">{f.user?.email}</span>
                    </td>

                    <td className="p-4 text-slate-300">
                      {f.location?.district || 'District'}, {f.location?.state || 'State'}
                    </td>

                    <td className="p-4 capitalize text-slate-300">
                      {f.farmingType || 'Organic'}
                    </td>

                    <td className="p-4">
                      <VerificationBadge status={f.verificationStatus} />
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {f.verificationStatus !== 'verified' && (
                          <button
                            onClick={() => handleVerify(f._id, 'verified')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 font-bold text-xs flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Verify Farm
                          </button>
                        )}
                        {f.verificationStatus === 'verified' && (
                          <button
                            onClick={() => handleVerify(f._id, 'rejected')}
                            className="px-3 py-1.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 font-bold text-xs flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Revoke Verification
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFarmers;
