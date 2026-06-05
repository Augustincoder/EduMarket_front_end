// src/services/tasks.service.js
import api from './client';

export const tasksApi = {
  getAll:    (params)  => api.get('/tasks', { params }),
  getMyTasks: (params) => api.get('/tasks/my', { params }),
  getOne:    (id)      => api.get(`/tasks/${id}`),
  create:    (data)    => api.post('/tasks', data),
  // State transitions
  startProgress:    (id)          => api.post(`/tasks/${id}/start-progress`),
  submitReview:     (id)          => api.post(`/tasks/${id}/submit-review`),
  accept:           (id)          => api.post(`/tasks/${id}/accept`),
  requestRevision:  (id, data)    => api.post(`/tasks/${id}/request-revision`, data),
  cancel:           (id)          => api.post(`/tasks/${id}/cancel`),
  dispute:          (id, data)    => api.post(`/tasks/${id}/dispute`, data),
  promote:          (id, data)    => api.post(`/tasks/${id}/promote`, data),
  // Rating
  rate: (id, data) => api.post(`/reviews/task/${id}`, data),
};

export const bidsApi = {
  create:   (data) => {
    const { taskId, ...body } = data;
    return api.post(`/bids/task/${taskId}`, body);
  },
  getByTask:(taskId)       => api.get(`/bids/task/${taskId}`),
  accept:   (taskId, body) => api.post(`/bids/task/${taskId}/accept/${body.bidId}`),
};
