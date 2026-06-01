// src/screens/CreateGigScreen.jsx
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Button } from '../components/ui/Button';
import { ChevronLeft, Info, HelpCircle } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { PageLayout } from '../components/layout/PageLayout';
import { TextInput } from '../components/forms/TextInput';
import { TextArea } from '../components/forms/TextArea';
import { useAuthStore } from '../store/authStore';
import { gigsApi } from '../services/api';
import toast from 'react-hot-toast';

const gigSchema = zod.object({
  title: zod
    .string()
    .min(10, "Sarlavha kamida 10 ta belgidan iborat bo'lishi kerak")
    .max(80, "Sarlavha ko'pi bilan 80 ta belgi bo'lishi mumkin"),
  description: zod
    .string()
    .min(30, "Tavsif kamida 30 ta belgidan iborat bo'lishi kerak")
    .max(1000, "Tavsif ko'pi bilan 1000 ta belgi bo'lishi mumkin"),
  price: zod
    .preprocess(
      (val) => Number(val),
      zod.number({ invalid_type_error: 'Raqam kiriting' })
        .min(5000, "Minimal narx 5,000 so'm")
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

export default function CreateGigScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  // Check requirements: VIP or 3+ completed tasks
  // In the real system, ratingCount or some backend field will show tasks count, but we'll check isVip or ratingCount >= 3.
  const hasAccess = currentUser?.isVip || (currentUser?.ratingCount && currentUser?.ratingCount >= 3);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      deliveryDays: 3,
    },
  });

  const titleVal = watch('title', '');
  const descVal = watch('description', '');

  // Create Gig Mutation
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

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <PageLayout
      header={
        <Header
          title="Xizmat yaratish"
          leftAction={
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => navigate('/gigs')}
              className="rounded-xl hover:bg-edu-border/40 text-edu-text"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          }
        />
      }
    >
      <div className="flex flex-col gap-4 p-4 pb-nav animate-fade-in">
        {/* Requirement Banner */}
        {!hasAccess ? (
          <div className="flex flex-col gap-3 p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-orange-600 shadow-sm">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold font-display">Talab bajarilmagan</h3>
                <p className="text-xs opacity-90 mt-1 leading-relaxed">
                  Katalogga tayyor xizmat (gig) qo'shish uchun siz VIP statusga ega bo'lishingiz yoki kamida 3 ta vazifani muvaffaqiyatli yakunlagan bo'lishingiz kerak.
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 mt-2">
              <Button
                size="sm"
                variant="vip"
                onClick={() => navigate('/vip')}
                className="flex-1 font-bold h-10 rounded-xl"
              >
                VIP sotib olish 👑
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/gigs')}
                className="flex-1 font-semibold h-10 rounded-xl"
              >
                Katalogga qaytish
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-edu-primary/10 rounded-xl border border-edu-primary/20 text-edu-primary text-xs font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-edu-primary shrink-0" />
            <span>Siz tayyor xizmatlar katalogiga yangi taklif kirita olasiz!</span>
          </div>
        )}

        {hasAccess && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Title */}
            <TextInput
              label="Xizmat sarlavhasi"
              placeholder="Masalan: Professional tarjima inglizchadan o'zbekchaga"
              error={errors.title?.message}
              maxLength={80}
              currentLength={titleVal.length}
              {...register('title')}
            />

            {/* Description */}
            <TextArea
              label="Xizmat tavsifi"
              placeholder="Freelancer sifatida nimalarni taklif qilishingizni batafsil tushuntiring..."
              error={errors.description?.message}
              maxLength={1000}
              currentLength={descVal.length}
              minRows={4}
              {...register('description')}
            />

            {/* Price */}
            <TextInput
              type="number"
              label="Xizmat narxi (so'm)"
              placeholder="Masalan: 50000"
              error={errors.price?.message}
              {...register('price')}
            />

            {/* Delivery Days */}
            <TextInput
              type="number"
              label="Yetkazib berish muddati (kun)"
              placeholder="Masalan: 3"
              error={errors.deliveryDays?.message}
              {...register('deliveryDays')}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
              className="w-full h-12 rounded-2xl font-bold mt-2"
            >
              Katalogga joylash
            </Button>
          </form>
        )}
      </div>
    </PageLayout>
  );
}
