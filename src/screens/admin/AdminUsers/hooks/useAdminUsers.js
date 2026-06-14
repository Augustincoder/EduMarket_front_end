import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../../services/admin.service';
import { toast } from 'react-hot-toast';

export function useAdminUsers({ search, roleFilter, vipFilter, banFilter, closeModal }) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', search, roleFilter, vipFilter, banFilter],
    queryFn: () => {
      const params = {};
      if (search) params.search = search;
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (vipFilter !== 'ALL') params.isVip = vipFilter === 'VIP';
      if (isFinite(banFilter) || banFilter !== 'ALL') params.isBanned = banFilter === 'BANNED';
      
      return adminApi.getUsers(params).then(r => r.data.data);
    }
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, isBanned, reason }) => adminApi.banUser(userId, { isBanned, reason }),
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries(['admin', 'users']);
      closeModal?.();
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const vipMutation = useMutation({
    mutationFn: ({ userId, isVip, durationDays }) => adminApi.setUserVip(userId, { isVip, durationDays }),
    onSuccess: () => {
      toast.success('VIP statusi o\'zgartirildi');
      queryClient.invalidateQueries(['admin', 'users']);
      closeModal?.();
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const warnMutation = useMutation({
    mutationFn: ({ userId, message }) => adminApi.warnUser(userId, { message }),
    onSuccess: () => {
      toast.success('Ogohlantirish yuborildi');
      closeModal?.();
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const studentMutation = useMutation({
    mutationFn: ({ userId, isApproved, rejectReason }) => adminApi.verifyStudent(userId, { isApproved, rejectReason }),
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries(['admin', 'users']);
      closeModal?.();
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  return {
    usersQuery,
    banMutation,
    vipMutation,
    warnMutation,
    studentMutation
  };
}
