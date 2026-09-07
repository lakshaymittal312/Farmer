import api from './api';

export const buyerApi = {
  getProfile: () => api.get('/buyer/profile'),
  updateProfile: (data) => api.put('/buyer/profile', data),
  getDashboardStats: () => api.get('/buyer/dashboard-stats'),
};

export default buyerApi;
