import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { UserStatusBadge, RoleBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

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
      const res = await adminApi.getUsers();
      if (res.data.success) {
        setUsers(res.data.users || res.data.data || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await adminApi.updateUserStatus(userId, newStatus);
      if (res.data.success) {
        toast.success(`User status updated to ${newStatus}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
        );
      }
    } catch (e) {
      toast.error(e.message || 'Failed to update user status');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100">User Account Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Manage system user roles, active states, and permissions</p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-dark-bg border border-dark-border text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary-500 w-full sm:w-auto"
        >
          <option value="">All User Roles</option>
          <option value="farmer">Farmers Only</option>
          <option value="buyer">Buyers Only</option>
          <option value="admin">Admins Only</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No Users Found" description="No system users match your search criteria." />
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-dark-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-dark-bg text-slate-400 uppercase text-[10px] font-bold border-b border-dark-border">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-dark-hover transition">
                    <td className="p-4">
                      <span className="font-bold text-slate-100 block">{u.name}</span>
                      <span className="text-[10px] text-slate-400">{u.email}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{u.phone || 'N/A'}</td>
                    <td className="p-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="p-4">
                      <UserStatusBadge status={u.status || 'active'} />
                    </td>
                    <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u._id, u.status || 'active')}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1 ml-auto ${
                            u.status === 'suspended'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                              : 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900'
                          }`}
                        >
                          {u.status === 'suspended' ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" /> Re-Activate
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5" /> Suspend User
                            </>
                          )}
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
    </div>
  );
};

export default ManageUsers;
