import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medifind_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, clear stale auth data
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('medifind_token')) {
        localStorage.removeItem('medifind_token');
        localStorage.removeItem('medifind_user');
        // Do not force redirect if already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const BACKEND_URL = API_URL.replace('/api', '');

export default api;
