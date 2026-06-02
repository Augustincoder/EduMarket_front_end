// src/services/api.js
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
    const token = localStorage.getItem('edu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (error handling) ────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    if (status === 401) {
      localStorage.removeItem('edu_token');
      // Auth store logout handled by useAuth hook
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

// ─── Auth ──────────────────────────────────────────
export const authApi = {
  login:       (body) => api.post('/auth/login', body),
  adminLogin:  (body) => api.post('/auth/admin-login', body),
  logout:      ()     => api.post('/auth/logout'),
  me:          ()     => api.get('/auth/me'),
};

// ─── Users ─────────────────────────────────────────
export const usersApi = {
  getMe:        ()           => api.get('/users/me'),
  updateMe:     (data)       => api.put('/users/me', data),
  getUser:      (userId)     => api.get(`/users/${userId}`),
  leaderboard:  ()           => api.get('/users/leaderboard'),
};

// ─── Tasks ─────────────────────────────────────────
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
  // Rating
  rate: (id, data) => api.post(`/tasks/${id}/rate`, data),
};

// ─── Bids ──────────────────────────────────────────
export const bidsApi = {
  create:   (data) => {
    const { taskId, ...body } = data;
    return api.post(`/bids/task/${taskId}`, body);
  },
  getByTask:(taskId)       => api.get(`/bids/task/${taskId}`),
  accept:   (taskId, body) => api.post(`/bids/task/${taskId}/accept/${body.bidId}`),
};

// ─── Gigs ──────────────────────────────────────────
export const gigsApi = {
  getAll:  (params) => api.get('/gigs', { params }),
  create:  (data)   => api.post('/gigs', data),
  order:   (id)     => api.post(`/gigs/${id}/order`),
};

// ─── Files ─────────────────────────────────────────
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

// ─── Portfolio ──────────────────────────────────────
export const portfolioApi = {
  add:    (data) => api.post('/portfolio', data),
  delete: (id)   => api.delete(`/portfolio/${id}`),
};

// ─── VIP ───────────────────────────────────────────
export const vipApi = {
  buy: (data) => api.post('/vip/buy', data),
};

// ─── Messages (Chat) ────────────────────────────────
export const chatApi = {
  getConversations: ()         => api.get('/chat/conversations'),
  getByTask:        (taskId)   => api.get(`/chat/${taskId}`),
  sendMessage:      (taskId, data) => api.post(`/chat/${taskId}`, data),
};

// ─── Onboarding ─────────────────────────────────────
export const onboardingApi = {
  complete:         (data) => api.post('/onboarding/complete', data),
  verifyStudent:    (data) => api.post('/onboarding/verify-student', data),
  becomeFreelancer: (data) => api.post('/onboarding/become-freelancer', data),
  checkUsername:    (username) => api.get(`/onboarding/check-username?username=${username}`),
  getUniversities:  () => api.get('/onboarding/universities'),
};

// ─── Reports (Shikoyatlar) ──────────────────────────
export const reportsApi = {
  create:  (data)       => api.post('/reports', data),
  getAll:  (params)     => api.get('/reports', { params }),
  resolve: (id, body)   => api.patch(`/reports/${id}/resolve`, body),
};

// ─── Analytics ──────────────────────────────────────
export const analyticsApi = {
  getMe: (params) => api.get('/analytics/me', { params }),
};

// ─── Admin ──────────────────────────────────────────
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
