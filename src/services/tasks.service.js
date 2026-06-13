// src/services/tasks.service.js
import api from './client';

export const tasksApi = {
  getAll:    (params)  => api.get('/tasks', { params }),
  getMyTasks: (params) => api.get('/tasks/my', { params }),
  getOne:    (id)      => api.get(`/tasks/${id}`),
  create:    (data)    => api.post('/tasks', data),
  // State transitions
  startProgress:    (id)          => api.post(`/tasks/${id}/start-progress`),
  deliver:          (id, data)    => api.post(`/tasks/${id}/deliver`, data),
  approvePreview:   (id)          => api.post(`/tasks/${id}/approve-preview`),
  revealFiles:      (id)          => api.post(`/tasks/${id}/reveal-files`),
  getDelivery:      (id, type)    => api.get(`/tasks/${id}/delivery`, { params: { type } }),
  accept:           (id)          => api.post(`/tasks/${id}/accept`),
  requestRevision:  (id, data)    => api.post(`/tasks/${id}/request-revision`, data),
  cancel:           (id)          => api.post(`/tasks/${id}/cancel`),
  dispute:          (id, data)    => api.post(`/tasks/${id}/dispute`, data),
  promote:          (id, data)    => api.post(`/tasks/${id}/promote`, data),
  flag:             (id, data)    => api.post(`/tasks/${id}/flag`, data),
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
  assembleTeam: (taskId, teamMembers) => api.post(`/bids/task/${taskId}/assemble-team`, { teamMembers }),
};

export const milestonesApi = {
  getAll: (taskId) => api.get(`/tasks/${taskId}/milestones`),
  create: (taskId, data) => api.post(`/tasks/${taskId}/milestones`, data),
  toggle: (taskId, milestoneId, data) => api.patch(`/tasks/${taskId}/milestones/${milestoneId}`, data),
  delete: (taskId, milestoneId) => api.delete(`/tasks/${taskId}/milestones/${milestoneId}`),
};
