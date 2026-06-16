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
    const authStr = localStorage.getItem('edu_auth');
    const token = authStr ? JSON.parse(authStr).state?.token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (error handling) ────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to get Telegram initData
        const initData = window.Telegram?.WebApp?.initData;
        
        if (initData) {
          // Perform silent login using raw fetch to avoid circular deps with authApi
          const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData }),
          });

          if (response.ok) {
            const result = await response.json();
            const { token, user } = result.data;

            // Update localStorage so future requests use the new token
            const authStr = localStorage.getItem('edu_auth');
            if (authStr) {
              const authData = JSON.parse(authStr);
              authData.state.token = token;
              authData.state.user = { ...authData.state.user, ...user };
              localStorage.setItem('edu_auth', JSON.stringify(authData));
            }

            api.defaults.headers.common.Authorization = `Bearer ${token}`;
            originalRequest.headers.Authorization = `Bearer ${token}`;

            processQueue(null, token);
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Silent re-auth failed:', refreshError);
      } finally {
        isRefreshing = false;
      }

      // If we reach here, silent re-auth failed or wasn't possible
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
