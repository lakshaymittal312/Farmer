import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, MapPin } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
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
      const res = await api.get('/admin/buyers');
      if (res.data.success) {
        setBuyers(res.data.buyers || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load buyers list');
    } flex: {
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
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
          <EmptyState title="No Buyers Found" description="No buyer profiles match your query." />
        ) : (
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                  <tr>
                    <th className="p-4">Buyer Account</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">Saved Addresses</th>
                    <th className="p-4">Wishlist Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredBuyers.map((b) => (
                    <tr key={b._id} className="hover:bg-dark-hover transition">
                      <td className="p-4 font-bold text-slate-100">
                        <span className="block">{b.user?.name || 'Buyer'}</span>
                        <span className="text-[10px] text-slate-500">{b.user?.email}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">{b.phone || 'N/A'}</td>
                      <td className="p-4 text-slate-300 font-medium">
                        {b.deliveryAddresses?.length || 0} locations
                      </td>
                      <td className="p-4 font-bold text-primary-400">
                        {b.wishlist?.length || 0} crops
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageBuyers;
