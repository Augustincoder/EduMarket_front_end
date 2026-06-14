import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../services/client';
import { toast } from 'react-hot-toast';
import defaultCategories from '../../../../data/defaultCategories.json';

export function useAdminCategories() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const [formData, setFormData] = useState({
    value: '',
    label: '',
    emoji: '',
    colorHex: '#3B82F6',
    formType: 'GENERAL',
    sortOrder: 0,
    isActive: true,
    isTrending: false,
    skills: '' // comma separated
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => api.get('/categories/admin').then(r => r.data.data.categories)
  });

  const handleBulkLoad = async () => {
    const confirm = window.confirm("Rostdan ham lokal JSON dagi kategoriyalarni bazaga yuklamoqchimisiz?");
    if (!confirm) return;
    
    setIsBulkLoading(true);
    let successCount = 0;
    toast.loading('Kategoriyalar yuklanmoqda...', { id: 'bulk-load' });
    
    try {
      for (const cat of defaultCategories) {
        try {
          await api.post('/categories/admin', cat);
          successCount++;
        } catch (err) {
          console.warn(`Failed to create category ${cat.value}:`, err.response?.data || err.message);
        }
      }
      toast.success(`${successCount} ta kategoriya muvaffaqiyatli yuklandi!`, { id: 'bulk-load' });
      queryClient.invalidateQueries(['admin', 'categories']);
    } catch {
      toast.error("Kategoriyalarni yuklashda xatolik yuz berdi", { id: 'bulk-load' });
    } finally {
      setIsBulkLoading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [] };
      if (selectedCategory) {
        return api.patch(`/categories/admin/${selectedCategory.id}`, payload);
      }
      return api.post('/categories/admin', payload);
    },
    onSuccess: () => {
      toast.success(selectedCategory ? "Kategoriya yangilandi" : "Kategoriya yaratildi");
      queryClient.invalidateQueries(['admin', 'categories']);
      setIsModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/categories/admin/${id}/toggle`, { isActive }),
    onSuccess: () => {
      toast.success("Status o'zgardi");
      queryClient.invalidateQueries(['admin', 'categories']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/admin/${id}`),
    onSuccess: () => {
      toast.success("Kategoriya o'chirildi");
      queryClient.invalidateQueries(['admin', 'categories']);
    }
  });

  const openModal = (cat = null) => {
    setSelectedCategory(cat);
    if (cat) {
      setFormData({
        value: cat.value,
        label: cat.label,
        emoji: cat.emoji,
        colorHex: cat.colorHex,
        formType: cat.formType,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        isTrending: cat.isTrending,
        skills: cat.skills ? cat.skills.map(s => s.name).join(', ') : ''
      });
    } else {
      setFormData({
        value: '',
        label: '',
        emoji: '📌',
        colorHex: '#3B82F6',
        formType: 'GENERAL',
        sortOrder: categories ? categories.length + 1 : 1,
        isActive: true,
        isTrending: false,
        skills: ''
      });
    }
    setIsModalOpen(true);
  };

  return {
    categories,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    selectedCategory,
    isBulkLoading,
    handleBulkLoad,
    formData,
    setFormData,
    saveMutation,
    toggleMutation,
    deleteMutation,
    openModal
  };
}
