import api from './api';

export const farmerApi = {
  getProfile: () => api.get('/farmer/profile'),
  updateProfile: (data) => api.put('/farmer/profile', data),
  getDashboardStats: () => api.get('/farmer/dashboard-stats'),
};

export default farmerApi;
