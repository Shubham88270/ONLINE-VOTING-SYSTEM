import axios from 'axios';

// Base API instance — proxy in package.json forwards to localhost:5000
const api = axios.create({
  baseURL: '/api',
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
