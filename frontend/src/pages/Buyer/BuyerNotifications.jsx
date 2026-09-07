import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { notificationApi } from '../../services/notificationApi';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

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
      const res = await notificationApi.getMyNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await notificationApi.markAsRead(id);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (e) {
      toast.error(e.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationApi.markAllAsRead();
      if (res.data.success) {
        toast.success('All notifications marked as read.');
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (e) {
      toast.error(e.message || 'Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted.');
    } catch (e) {
      toast.error(e.message || 'Failed to delete notification');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100">Buyer Notifications</h1>
          <p className="text-xs text-slate-400 mt-1">Updates on your crop order shipments, delivery statuses, and price drops</p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="bg-dark-card border border-dark-border hover:border-primary-500 text-primary-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No Notifications"
          description="You don't have any notifications at the moment."
          icon={Bell}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 sm:p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                !n.isRead
                  ? 'bg-emerald-950/30 border-primary-500/50 shadow-md'
                  : 'bg-dark-card border-dark-border'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-100">{n.title || 'Notification'}</h4>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-slate-300">{n.message}</p>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-primary-400 hover:bg-dark-hover"
                    title="Mark as Read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(n._id)}
                  className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-rose-400 hover:bg-rose-950/40"
                  title="Delete Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerNotifications;
