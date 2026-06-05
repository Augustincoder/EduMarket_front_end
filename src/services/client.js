// src/services/client.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Request Interceptor (JWT token) ──────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (error handling) ────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    if (status === 401) {
      localStorage.removeItem('edu_token');
      // Auth store logout handled by useAuth hook
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    // Attach extra info for UI
    error.statusCode   = status;
    error.serverCode   = code;
    error.serverMsg    = error.response?.data?.message || error.message;
    error.serverErrors = error.response?.data?.errors;

    return Promise.reject(error);
  }
);

export default api;
