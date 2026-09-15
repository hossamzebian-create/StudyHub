import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studyhub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    // Handle token expiration, redirect to login (except for login requests)
    if (error.config.url !== '/login' && error.config.url !== '/api/login') {
      localStorage.removeItem('studyhub_token');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});

export default api;
