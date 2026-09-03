import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const FarmerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) setNotifications(res.data.notifications);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading notifications...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <button onClick={handleMarkAllRead} className="text-sm font-medium text-emerald-600 hover:underline">
          Mark All as Read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center border border-gray-200 text-gray-500">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className={`p-4 rounded-xl border ${n.isRead ? 'bg-white border-gray-200' : 'bg-emerald-50 border-emerald-200 font-semibold'}`}>
              <p className="text-gray-900 text-sm">{n.message}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerNotifications;
