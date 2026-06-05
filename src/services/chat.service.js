// src/services/chat.service.js
import api from './client';

export const chatApi = {
  getConversations: ()         => api.get('/chat/conversations'),
  getByTask:        (taskId, params)   => api.get(`/chat/${taskId}`, { params }),
  sendMessage:      (taskId, data) => api.post(`/chat/${taskId}`, data),
  markAsRead:       (taskId)   => api.post(`/chat/${taskId}/read`),
  editMessage:      (messageId, data) => api.put(`/chat/messages/${messageId}`, data),
  deleteMessage:    (messageId) => api.delete(`/chat/messages/${messageId}`),
};

export default chatApi;
