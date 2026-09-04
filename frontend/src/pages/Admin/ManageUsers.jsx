import React, { useState, useEffect } from 'react';
import { Users, Search, Power, Shield } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load users list');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.patch(`/admin/users/${user._id}/status`, { status: newStatus });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
        );
      }
    } catch (e) {
      alert(e.message || 'Failed to update user status');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-100">User Account Directory</h1>
            <p className="text-xs text-slate-400 mt-1">Manage system user roles, active states, and permissions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-dark-bg border border-dark-border text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">All User Roles</option>
            <option value="farmer">Farmer</option>
            <option value="buyer">Buyer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchUsers} />
        ) : filteredUsers.length === 0 ? (
          <EmptyState title="No Users Found" description="No accounts match your query." />
        ) : (
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Account Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-dark-hover transition">
                      <td className="p-4">
                        <span className="font-bold text-slate-100 block text-sm">{u.name}</span>
                        <span className="text-[10px] text-slate-500">{u.email}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            u.role === 'admin'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : u.role === 'farmer'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-teal-950 text-teal-300 border-teal-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">{u.phone || 'N/A'}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                          }`}
                        >
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-2 rounded-lg border transition ${
                              u.status === 'active'
                                ? 'bg-dark-bg border-dark-border text-rose-400 hover:bg-rose-950'
                                : 'bg-dark-bg border-dark-border text-emerald-400 hover:bg-emerald-950'
                            }`}
                            title={u.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
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

export default ManageUsers;
