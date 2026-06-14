/* eslint-disable react-hooks/incompatible-library */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuthStore } from '../../../../store/authStore';
import { gigsApi } from '../../../../services/gigs.service';
import { usersApi } from '../../../../services/users.service';
import toast from 'react-hot-toast';

const gigSchema = zod.object({
  title: zod
    .string()
    .min(5, "Sarlavha kamida 5 ta belgidan iborat bo'lishi kerak")
    .max(100, "Sarlavha ko'pi bilan 100 ta belgi bo'lishi mumkin"),
  description: zod
    .string()
    .min(10, "Tavsif kamida 10 ta belgidan iborat bo'lishi kerak")
    .max(1000, "Tavsif ko'pi bilan 1000 ta belgi bo'lishi mumkin"),
  price: zod
    .preprocess(
      (val) => Number(val),
      zod.number({ invalid_type_error: 'Raqam kiriting' })
        .min(1000, "Minimal narx 1,000 so'm")
        .max(10000000, "Maksimal narx 10,000,000 so'm")
    ),
  deliveryDays: zod
    .preprocess(
      (val) => Number(val),
      zod.number({ invalid_type_error: 'Raqam kiriting' })
        .min(1, 'Kamida 1 kun bo\'lishi shart')
        .max(30, 'Ko\'pi bilan 30 kun bo\'lishi mumkin')
    ),
});

export function useCreateGigForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  
  const [step, setStep] = useState(1);

  const { data: me } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => usersApi.getMe().then(r => r.data.data),
  });

  const userData = me || currentUser;

  const isVip = !!userData?.isVip;
  const completedTasks = userData?._count?.freelancerTasks ?? 0;
  const hasAccess = isVip || completedTasks >= 3;

  const form = useForm({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      deliveryDays: 3,
    },
  });

  const titleVal = form.watch('title', '');
  const descVal = form.watch('description', '');
  const priceVal = form.watch('price', '');

  const createMutation = useMutation({
    mutationFn: (data) => gigsApi.create(data),
    onSuccess: () => {
      toast.success('Xizmat muvaffaqiyatli katalogga qo\'shildi!');
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      navigate('/gigs');
    },
    onError: (err) => {
      toast.error(err.serverMsg || 'Xizmat qo\'shishda xatolik yuz berdi');
    },
  });

  const handleNextStep = async () => {
    const isValid = await form.trigger(['title', 'description']);
    if (isValid) {
      setStep(2);
    } else {
      toast.error('Iltimos, maydonlarni to\'g\'ri to\'ldiring');
    }
  };

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return {
    navigate,
    step,
    setStep,
    isVip,
    completedTasks,
    hasAccess,
    form,
    titleVal,
    descVal,
    priceVal,
    handleNextStep,
    onSubmit,
    isPending: createMutation.isPending,
  };
}
