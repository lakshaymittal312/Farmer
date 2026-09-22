import api from './api';

export const farmerApi = {
  getProfile: () => api.get('/farmer/profile'),
  createProfile: (data) => api.post('/farmer/profile', data),
  updateProfile: (data) => api.put('/farmer/profile', data),
  getDashboardStats: () => api.get('/farmer/dashboard-stats'),
};

export default farmerApi;
