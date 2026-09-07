import api from './api';

export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  toggleStatus: (id) => api.patch(`/products/${id}/status`),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export default productApi;
