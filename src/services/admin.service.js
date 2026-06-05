// src/services/admin.service.js
import api from './client';

export const adminApi = {
  getStats:           ()            => api.get('/admin/stats'),
  getUsers:           (params)      => api.get('/admin/users', { params }),
  banUser:            (userId, body)=> api.post(`/admin/users/${userId}/ban`, body),
  setUserVip:         (userId, body)=> api.post(`/admin/users/${userId}/vip`, body),
  warnUser:           (userId, body)=> api.post(`/admin/users/${userId}/warn`, body),
  verifyStudent:      (userId, body)=> api.post(`/admin/users/${userId}/verify-student`, body),
  getVipRequests:     ()            => api.get('/admin/vip-requests'),
  processVipRequest:  (id, body)    => api.post(`/admin/vip-requests/${id}`, body),
  getFraudLogs:       ()            => api.get('/admin/fraud-logs'),
  resolveFraudLog:    (id)          => api.post(`/admin/fraud-logs/${id}/resolve`),
  getDisputes:        ()            => api.get('/admin/disputes'),
  resolveDispute:     (id, body)    => api.post(`/admin/disputes/${id}/resolve`, body),
  getDisputeChat:     (id)          => api.get(`/admin/disputes/${id}/chat`),
  getTransactions:    ()            => api.get('/admin/transactions'),
  getSettings:        ()            => api.get('/admin/settings'),
  updateSetting:      (body)        => api.put('/admin/settings', body),
  getAuditLogs:       ()            => api.get('/admin/logs'),
  broadcast:          (body)        => api.post('/admin/broadcast', body),
  deleteTask:         (taskId)      => api.delete(`/admin/tasks/${taskId}`),
  deleteGig:          (gigId)       => api.delete(`/admin/gigs/${gigId}`),
};

export default adminApi;
