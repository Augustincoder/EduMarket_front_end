import api from './client';

export const fileApi = {
  getFileUrl: (fileId) => 
    api.get(`/files/${encodeURIComponent(fileId)}/url`),

  getBatchUrls: (fileIds) => 
    api.post('/files/batch-urls', { fileIds }),

  deleteFile: (fileId) => 
    api.delete(`/files/${encodeURIComponent(fileId)}`),

  // Phase 13: Secure Ephemeral Streaming
  getSecureToken: (fileId) => 
    api.get(`/files/${encodeURIComponent(fileId)}/secure-token`),

  streamSecureFile: (token) => 
    api.get(`/files/stream/${token}`, { responseType: 'blob' })
};
