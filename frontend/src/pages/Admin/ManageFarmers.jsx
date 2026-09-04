import React, { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, CheckCircle2, Eye, MapPin, Sprout, Search } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { VerificationBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const ManageFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Farmer Modal
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/farmers');
      if (res.data.success) {
        setFarmers(res.data.farmers || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load farmers list');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVerification = async (farmerId, status) => {
    setUpdating(true);
    try {
      const res = await api.patch(`/farmer-profiles/${farmerId}/verification-status`, {
        verificationStatus: status,
      });
      if (res.data.success) {
        setFarmers((prev) =>
          prev.map((f) => (f._id === farmerId ? { ...f, verificationStatus: status } : f))
        );
        if (selectedFarmer && selectedFarmer._id === farmerId) {
          setSelectedFarmer((prev) => ({ ...prev, verificationStatus: status }));
        }
      }
    } catch (e) {
      alert(e.message || 'Failed to update verification status');
    } finally {
      setUpdating(false);
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-100">Farmer Verification Console</h1>
            <p className="text-xs text-slate-400 mt-1">Review credentials, verify farm authenticity, and grant verification badges</p>
          </div>
        </div>

        {/* Search */}
        <div className="glass-panel p-4 rounded-2xl max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search farm name, farmer, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Farmers Table */}
        {loading ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchFarmers} />
        ) : filteredFarmers.length === 0 ? (
          <EmptyState title="No Farmers Found" description="There are no registered farmer profiles matching your query." />
        ) : (
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                  <tr>
                    <th className="p-4">Farm Enterprise</th>
                    <th className="p-4">Farmer Account</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Land Area</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredFarmers.map((f) => (
                    <tr key={f._id} className="hover:bg-dark-hover transition">
                      <td className="p-4 font-bold text-slate-100">
                        <div className="flex items-center gap-2">
                          <Sprout className="w-4 h-4 text-primary-400 shrink-0" />
                          <span>{f.farmName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-200 block">{f.user?.name || 'Farmer'}</span>
                        <span className="text-[10px] text-slate-500">{f.user?.email}</span>
                      </td>
                      <td className="p-4 text-slate-300">
                        {f.location ? `${f.location.district}, ${f.location.state}` : 'N/A'}
                      </td>
                      <td className="p-4 text-slate-300 font-medium">{f.farmSize || 0} Acres</td>
                      <td className="p-4">
                        <VerificationBadge status={f.verificationStatus} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {f.verificationStatus !== 'verified' && (
                            <button
                              onClick={() => handleUpdateVerification(f._id, 'verified')}
                              disabled={updating}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 font-bold text-[10px]"
                            >
                              Approve
                            </button>
                          )}

                          {f.verificationStatus !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateVerification(f._id, 'rejected')}
                              disabled={updating}
                              className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 font-bold text-[10px]"
                            >
                              Reject
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedFarmer(f);
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-slate-300 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Farmer Inspector Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Farmer Verification Profile">
          {selectedFarmer && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-dark-bg border border-dark-border space-y-2">
                <h4 className="font-bold text-slate-100 text-sm">{selectedFarmer.farmName}</h4>
                <p className="text-slate-400">Owner: {selectedFarmer.user?.name} ({selectedFarmer.user?.email})</p>
                <p className="text-slate-400">Location: {selectedFarmer.location?.addressLine}, {selectedFarmer.location?.district}, {selectedFarmer.location?.state} - {selectedFarmer.location?.pincode}</p>
                <p className="text-slate-400">Farming Type: {selectedFarmer.farmingType} • {selectedFarmer.farmSize} Acres</p>
                <p className="text-slate-400">Crops: {selectedFarmer.cropsProduced?.join(', ')}</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleUpdateVerification(selectedFarmer._id, 'verified')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Approve Verification
                </button>
                <button
                  onClick={() => handleUpdateVerification(selectedFarmer._id, 'rejected')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Reject Application
                </button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default ManageFarmers;
