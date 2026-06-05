// src/services/other.service.js
import api from './client';

export const filesApi = {
  upload:  (formData, onProgress) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }),
  getUrl:  (fileId) => api.get(`/files/${fileId}/url`),
};

export const portfolioApi = {
  add:    (data) => api.post('/portfolio', data),
  delete: (id)   => api.delete(`/portfolio/${id}`),
};

export const vipApi = {
  buy: (data) => api.post('/vip/buy', data),
};

export const reportsApi = {
  create:  (data)       => api.post('/reports', data),
  getAll:  (params)     => api.get('/reports', { params }),
  resolve: (id, body)   => api.patch(`/reports/${id}/resolve`, body),
};

export const analyticsApi = {
  getMe: (params) => api.get('/analytics/me', { params }),
};
