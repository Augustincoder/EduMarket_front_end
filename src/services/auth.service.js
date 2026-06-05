// src/services/auth.service.js
import api from './client';

export const authApi = {
  login:       (body) => api.post('/auth/login', body),
  adminLogin:  (body) => api.post('/auth/admin-login', body),
  logout:      ()     => api.post('/auth/logout'),
  me:          ()     => api.get('/auth/me'),
};

export default authApi;
