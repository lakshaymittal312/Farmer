import api from './api';

export const orderApi = {
  checkout: (data) => api.post('/orders', data),
  getOrders: (params) => api.get('/orders', { params }),
  getBuyerOrders: () => api.get('/orders/my-orders'),
  getFarmerOrders: () => api.get('/orders/farmer'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancelOrder: (id, reason) => api.patch(`/orders/${id}/cancel`, { reason }),
  acceptOrder: (id) => api.patch(`/orders/${id}/accept`),
  rejectOrder: (id, reason) => api.patch(`/orders/${id}/reject`, { reason }),
  processOrder: (id) => api.patch(`/orders/${id}/process`),
  shipOrder: (id, trackingNumber) => api.patch(`/orders/${id}/ship`, { trackingNumber }),
  deliverOrder: (id) => api.patch(`/orders/${id}/deliver`),
};

export default orderApi;
