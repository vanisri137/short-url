import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const urlService = {
  create: (data) => api.post('/api/urls', data),
  getAll: (params) => api.get('/api/urls', { params }),
  getAnalytics: () => api.get('/api/urls/analytics'),
  delete: (id) => api.delete(`/api/urls/${id}`),
  toggle: (id) => api.patch(`/api/urls/${id}/toggle`),
};

export default api;
