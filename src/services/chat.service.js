// src/services/chat.service.js
import api from './client';

export const chatApi = {
  // ROOMS & GROUPS
  getConversations: () => api.get('/chat'),
  getOrCreateDirect: (targetUserId) => api.post('/chat/direct', { targetUserId }),
  createCustomGroup: (data) => api.post('/chat/group', data), // { name, avatarUrl }
  updateGroupSettings: (chatRoomId, data) => api.put(`/chat/${chatRoomId}/settings`, data), // { name, avatarUrl }
  removeParticipant: (chatRoomId, targetUserId) => api.delete(`/chat/${chatRoomId}/participants/${targetUserId}`),
  leaveGroup: (chatRoomId) => api.post(`/chat/${chatRoomId}/leave`),
  getChatRoomInfo: (chatRoomId) => api.get(`/chat/${chatRoomId}/info`),

  // INVITES
  searchUsersForInvite: (chatRoomId, query) => api.get(`/chat/${chatRoomId}/search-users`, { params: { query } }),
  sendInvite: (chatRoomId, targetUserId) => api.post(`/chat/${chatRoomId}/invite`, { targetUserId }),
  getMyInvites: () => api.get('/chat/invites'),
  acceptInvite: (inviteId) => api.post(`/chat/invites/${inviteId}/accept`),
  rejectInvite: (inviteId) => api.post(`/chat/invites/${inviteId}/reject`),

  // MESSAGING
  getMessages: (chatRoomId, params) => api.get(`/chat/${chatRoomId}/messages`, { params }), // cursor, limit
  sendMessage: (chatRoomId, data) => api.post(`/chat/${chatRoomId}/messages`, data),
  markAsRead: (chatRoomId) => api.post(`/chat/${chatRoomId}/read`),
  pinMessage: (chatRoomId, messageId) => api.post(`/chat/${chatRoomId}/messages/${messageId}/pin`),
  editMessage: (messageId, data) => api.put(`/chat/messages/${messageId}`, data), // { content }
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),
  toggleReaction: (messageId, icon) => api.post(`/chat/messages/${messageId}/reaction`, { icon }),
};

export default chatApi;
