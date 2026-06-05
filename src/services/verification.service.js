import api from './client';

export const verificationApi = {
  submit: (data) => api.post('/verification/submit', data),
  getMyStatus: () => api.get('/verification/my-status'),
  adminList: (params) => api.get('/verification/admin/list', { params }),
  adminResolve: (id, data) => api.post(`/verification/admin/resolve/${id}`, data),
};

export default verificationApi;
