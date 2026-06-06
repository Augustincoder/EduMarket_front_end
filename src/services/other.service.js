// src/services/other.service.js
import api from './client';

// R2 public CDN base URL for direct image serving (no API round-trip needed)
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-9fc1a116a1974e199a0fd81575e831bc.r2.dev';

export const filesApi = {
  /**
   * Upload files to Cloudflare R2 via backend.
   * Returns { fileIds: string[] } where each fileId is an R2 object key
   * like "uploads/2026/06/uuid.pdf".
   */
  upload: (formData, onProgress) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }),

  /**
   * Get a signed/public download URL for a file by its R2 object key.
   * The key must be URL-encoded (it contains slashes).
   * Images: returns permanent CDN URL.
   * Other files: returns 1-hour presigned URL.
   */
  getUrl: (fileId) => api.get(`/files/${encodeURIComponent(fileId)}/url`),

  /**
   * Get download URLs for multiple files at once (max 50).
   * More efficient than calling getUrl() in a loop.
   */
  batchUrls: (fileIds) => api.post('/files/batch-urls', { fileIds }),

  /**
   * Get a direct public CDN URL for an image without an API call.
   * Only works for image files (jpg, png, gif, webp).
   * Use this for <img> src to avoid latency from presigning.
   */
  getPublicUrl: (fileId) => {
    if (!fileId) return null;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileId);
    if (isImage) {
      return `${R2_PUBLIC_URL}/${fileId}`;
    }
    return null; // Must use getUrl() for non-image files
  },

  /**
   * Delete a file from R2.
   */
  delete: (fileId) => api.delete(`/files/${encodeURIComponent(fileId)}`),
};



export const portfolioApi = {
  add:    (data) => api.post('/portfolio', data),
  delete: (id)   => api.delete(`/portfolio/${id}`),
};

export const vipApi = {
  buy: (data) => api.post('/vip/buy', data),
};

export const reportsApi = {
  create:  (data)       => api.post('/reports', data),
  getAll:  (params)     => api.get('/reports', { params }),
  resolve: (id, body)   => api.patch(`/reports/${id}/resolve`, body),
};

export const analyticsApi = {
  getMe: (params) => api.get('/analytics/me', { params }),
};

export const aiApi = {
  getLearningCompass: () => api.get('/ai/learning-compass'),
};
