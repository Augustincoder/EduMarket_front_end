// src/services/gigs.service.js
import api from './client';

export const gigsApi = {
  getAll:  (params) => api.get('/gigs', { params }),
  create:  (data)   => api.post('/gigs', data),
  order:   (id)     => api.post(`/gigs/${id}/order`),
};

export default gigsApi;
