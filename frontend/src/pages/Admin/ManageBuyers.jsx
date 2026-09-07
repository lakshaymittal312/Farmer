import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const ManageBuyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getBuyers();
      if (res.data.success) {
        setBuyers(res.data.buyers || res.data.data || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load buyers list');
    } finally {
      setLoading(false);
    }
  };

  const filteredBuyers = buyers.filter((b) => {
    const term = searchQuery.toLowerCase();
    return (
      (b.user?.name || '').toLowerCase().includes(term) ||
      (b.user?.email || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-dark-border pb-6">
        <h1 className="text-3xl font-black text-slate-100">Registered Buyers Directory</h1>
        <p className="text-xs text-slate-400 mt-1">Overview of registered crop buyers and delivery destinations</p>
      </div>

      <div className="glass-panel p-4 rounded-2xl max-w-md relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search buyer name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-dark-bg border border-dark-border rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {loading ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBuyers} />
      ) : filteredBuyers.length === 0 ? (
        <EmptyState title="No Buyers Found" description="No buyer accounts match your search filter." icon={ShoppingBag} />
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                <tr>
                  <th className="p-4">Buyer Account</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Buyer Type</th>
                  <th className="p-4">Saved Locations</th>
                  <th className="p-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredBuyers.map((b) => (
                  <tr key={b._id} className="hover:bg-dark-hover transition">
                    <td className="p-4">
                      <span className="font-bold text-slate-100 block">{b.user?.name || 'Buyer'}</span>
                      <span className="text-[10px] text-slate-400">{b.user?.email}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{b.user?.phone || 'N/A'}</td>
                    <td className="p-4 capitalize text-amber-400 font-semibold">{b.buyerType || 'retail'}</td>
                    <td className="p-4 font-bold text-slate-200">
                      {b.deliveryAddresses?.length || 0} Saved Addresses
                    </td>
                    <td className="p-4 text-slate-400">{new Date(b.createdAt || Date.now()).toLocaleDateString()}</td>
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

export default ManageBuyers;
