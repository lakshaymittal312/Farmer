import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ArrowUpRight, Clock } from 'lucide-react';
import api from '../../services/api';
import DashboardSidebar from '../../components/DashboardSidebar';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const BuyerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      alert(e.message || 'Failed to mark read');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      // silent
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (e) {
      alert(e.message || 'Failed to delete notification');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      <DashboardSidebar role="buyer" unreadCount={unreadCount} />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-100">Buyer Notifications</h1>
            <p className="text-xs text-slate-400 mt-1">Updates on your crop order shipments, delivery statuses, and price drops</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="bg-dark-card border border-dark-border hover:border-primary-500 text-slate-200 font-bold px-4 py-2 rounded-xl transition text-xs flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4 text-primary-400" />
              Mark All Read
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchNotifications} />
        ) : notifications.length === 0 ? (
          <EmptyState title="No Notifications" description="You have no new alerts." icon={Bell} />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                className={`p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                  !n.isRead
                    ? 'bg-emerald-950/40 border-primary-500/40 shadow-lg shadow-emerald-950/20'
                    : 'bg-dark-card border-dark-border opacity-80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      !n.isRead ? 'bg-primary-500 text-slate-950 font-bold' : 'bg-dark-bg text-slate-400 border border-dark-border'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100">{n.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.orderId && (
                    <Link
                      to={`/buyer/orders/${n.orderId}`}
                      className="px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-primary-400 hover:text-primary-300 text-xs font-bold flex items-center gap-1"
                    >
                      Track Order <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(n._id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerNotifications;
