import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../../../services/users.service';
import { analyticsApi, portfolioApi } from '../../../../services/other.service';
import { useAuthStore } from '../../../../store/authStore';
import toast from 'react-hot-toast';

export function useProfileData() {
  const qc = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const activeRole = useAuthStore((s) => s.activeRole);

  // Fetch Me Profile
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => usersApi.getMe().then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

  // Fetch Client Personal Analytics
  const { data: clientStats, isLoading: clientStatsLoading, error: clientStatsError, refetch: refetchClientStats } = useQuery({
    queryKey: ['analytics', 'client', me?.id],
    queryFn: () => analyticsApi.getMe({ role: 'CLIENT' }).then(r => r.data.data),
    enabled: !!me,
  });

  // Update Profile Mutation
  const updateMe = useMutation({
    mutationFn: (data) => usersApi.updateMe(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      toast.success('Profil muvaffaqiyatli yangilandi!');
    },
  });

  // Add Portfolio Mutation
  const addPortfolio = useMutation({
    mutationFn: (data) => portfolioApi.add(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      toast.success("Portfolioga ish muvaffaqiyatli qo'shildi!");
    },
    onError: (err) => {
      toast.error(err.serverMsg || "Ish qo'shishda xatolik yuz berdi");
    }
  });

  // Delete Portfolio Mutation
  const delPortfolio = useMutation({
    mutationFn: (id) => portfolioApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });

  // Delete Profile Mutation
  const deleteMe = useMutation({
    mutationFn: () => usersApi.deleteMe(),
    onSuccess: () => {
      logout();
    },
    onError: (e) => {
      toast.error(e.serverMsg || "Xatolik yuz berdi");
    }
  });

  // Fetch DNA
  const { data: dnaData } = useQuery({
    queryKey: ['users', me?.id, 'reputation'],
    queryFn: () => usersApi.getUserReputationDNA(me.id).then((r) => r.data.data),
    enabled: !!me,
  });

  return {
    me,
    clientStats,
    dnaData,
    activeRole,
    meLoading,
    clientStatsLoading,
    clientStatsError,
    refetchClientStats,
    isLoading: meLoading, // only wait for me for primary screen render
    updateMe,
    addPortfolio,
    delPortfolio,
    deleteMe
  };
}
