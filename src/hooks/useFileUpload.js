import { useState, useCallback } from 'react';
import { filesApi } from '../services/other.service';
import toast from 'react-hot-toast';

/**
 * useFileUpload Hook
 * Manages complex file upload states, progress, and API calls to R2.
 */
export function useFileUpload(options = {}) {
  const { 
    onSuccess, 
    onError, 
    maxFiles = 5,
    maxSizeMB = 20 
  } = options;

  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (rawFiles) => {
    if (!rawFiles || rawFiles.length === 0) return;

    // 1. Validation
    if (files.length + rawFiles.length > maxFiles) {
      toast.error(`Maksimal ${maxFiles} ta fayl yuklash mumkin`);
      return;
    }

    const formData = new FormData();
    for (const file of rawFiles) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name} juda katta. Maksimal hajm: ${maxSizeMB}MB`);
        continue;
      }
      formData.append('files', file);
    }

    // 2. Upload Process
    setIsUploading(true);
    setProgress(0);

    try {
      const res = await filesApi.upload(formData, (p) => setProgress(p));
      const uploadedFiles = res.data.data.files;
      
      const newFiles = [...files, ...uploadedFiles];
      setFiles(newFiles);
      
      if (onSuccess) onSuccess(uploadedFiles, newFiles);
      toast.success('Fayllar yuklandi');
    } catch (err) {
      const msg = err.response?.data?.message || 'Fayl yuklashda xatolik';
      if (onError) onError(err);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [files, maxFiles, maxSizeMB, onSuccess, onError]);

  const removeFile = useCallback(async (fileId) => {
    try {
      // Optimistic UI update
      setFiles(prev => prev.filter(f => f.fileId !== fileId));
      
      // Attempt to delete from R2 (cleanup)
      await filesApi.delete(fileId);
    } catch (err) {
      console.warn('File cleanup failed:', err.message);
      // We don't rollback here because the file is already gone from user perspective
    }
  }, []);

  const reset = useCallback(() => {
    setFiles([]);
    setProgress(0);
    setIsUploading(false);
  }, []);

  return {
    files,
    setFiles,
    isUploading,
    progress,
    upload,
    removeFile,
    reset
  };
}
