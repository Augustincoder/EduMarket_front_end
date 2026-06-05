// src/services/users.service.js
import api from './client';

export const usersApi = {
  getMe:        ()           => api.get('/users/me'),
  updateMe:     (data)       => api.put('/users/me', data),
  getUser:      (userId)     => api.get(`/users/${userId}`),
  leaderboard:  ()           => api.get('/users/leaderboard'),
  getMyReferrals: ()         => api.get('/users/me/referrals'),
  updatePushToken: (token)   => api.post('/users/me/push-token', { token }),
};

export const onboardingApi = {
  complete:         (data) => api.post('/onboarding/complete', data),
  verifyStudent:    (data) => api.post('/onboarding/verify-student', data),
  becomeFreelancer: (data) => api.post('/onboarding/become-freelancer', data),
  checkUsername:    (username) => api.get(`/onboarding/check-username?username=${username}`),
  getUniversities:  () => api.get('/onboarding/universities'),
};
