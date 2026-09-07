import api from './api';

export const adminApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  getFarmers: (params) => api.get('/admin/farmers', { params }),
  verifyFarmer: (id, status, isVerified) => api.patch(`/admin/farmers/${id}/verify`, { status, isVerified }),
  getBuyers: (params) => api.get('/admin/buyers', { params }),
  getProducts: (params) => api.get('/admin/products', { params }),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
};

export default adminApi;
