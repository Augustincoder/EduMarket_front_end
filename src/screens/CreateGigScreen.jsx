// src/screens/CreateGigScreen.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Button } from '../components/ui/Button';
import { 
  ChevronLeft, 
  Info, 
  HelpCircle, 
  Lock, 
  Crown, 
  Briefcase, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  DollarSign,
  Clock
} from 'lucide-react';
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

export default function CreateGigScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  
  const [step, setStep] = useState(1);

  // Check requirements: VIP or 3+ completed tasks. Strictly typed to boolean to avoid rendering raw 0.
  const isVip = !!currentUser?.isVip;
  const ratingCount = currentUser?.ratingCount ?? 0;
  const hasAccess = isVip || ratingCount >= 3;

  const {
    register,
    handleSubmit,
    watch,
    trigger,
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
  const priceVal = watch('price', '');

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

  const handleNextStep = async () => {
    const isValid = await trigger(['title', 'description']);
    if (isValid) {
      setStep(2);
    } else {
      toast.error('Iltimos, maydonlarni to\'g\'ri to\'ldiring');
    }
  };

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  // Progress calculations for locking banner
  const completedTasksProgress = Math.min(100, (ratingCount / 3) * 100);

  return (
    <PageLayout
      header={
        <Header
          title={hasAccess ? `Xizmat yaratish — ${step}-bosqich` : "Kirish taqiqlangan"}
          leftAction={
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => {
                if (hasAccess && step === 2) {
                  setStep(1);
                } else {
                  navigate('/gigs');
                }
              }}
              className="rounded-xl hover:bg-edu-border/40 text-edu-text"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          }
        />
      }
    >
      <div className="flex flex-col gap-6 p-4 pb-nav animate-fade-in">
        
        {/* Requirement Checklist Screen (Locked access) */}
        {!hasAccess ? (
          <div className="flex flex-col gap-6 animate-fade-up">
            
            {/* Elegant Lock Illustration */}
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500/20 to-edu-urgent/10 flex items-center justify-center shadow-inner border border-orange-500/20 mb-4 animate-pulse-slow">
                <Lock className="w-8 h-8 text-edu-urgent" />
              </div>
              <h2 className="text-xl font-bold text-edu-text font-display">Xizmat yaratish bloklangan</h2>
              <p className="text-xs text-edu-muted max-w-[85%] mt-2 leading-relaxed">
                Katalogda o'z xizmatlaringizni taklif qilish uchun quyidagi 2 ta talabdan kamida bittasini bajarishingiz kerak.
              </p>
            </div>

            {/* Checklist Items */}
            <div className="flex flex-col gap-4">
              
              {/* Option 1: VIP Status */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                isVip 
                  ? 'bg-edu-primary/5 border-edu-primary/30' 
                  : 'bg-edu-surface border-edu-border/40 shadow-sm'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${isVip ? 'bg-edu-primary/10 text-edu-primary' : 'bg-edu-vip/10 text-edu-vip'}`}>
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-edu-text font-display flex items-center gap-1.5">
                        VIP maqomiga ega bo'lish
                        {isVip && <span className="text-[10px] bg-edu-primary/15 text-edu-primary px-2 py-0.5 rounded-full font-bold">Faol</span>}
                      </h3>
                      <p className="text-xs text-edu-muted mt-1 leading-normal">
                        VIP foydalanuvchilar cheklovlarsiz katalogga xizmatlar qo'sha oladilar.
                      </p>
                    </div>
                  </div>
                  {isVip ? (
                    <CheckCircle2 className="w-5 h-5 text-edu-primary shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-edu-muted shrink-0 mt-1" />
                  )}
                </div>
                {!isVip && (
                  <div className="mt-3.5 pt-3.5 border-t border-edu-border/20">
                    <Button
                      size="sm"
                      variant="vip"
                      onClick={() => navigate('/vip')}
                      className="w-full font-bold h-10 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-edu-vip/10 active-bounce text-xs"
                    >
                      VIP sotib olish 👑
                    </Button>
                  </div>
                )}
              </div>

              {/* Option 2: Completed Tasks */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                ratingCount >= 3 
                  ? 'bg-edu-primary/5 border-edu-primary/30' 
                  : 'bg-edu-surface border-edu-border/40 shadow-sm'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${ratingCount >= 3 ? 'bg-edu-primary/10 text-edu-primary' : 'bg-edu-accent/10 text-edu-accent'}`}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-edu-text font-display flex items-center gap-1.5">
                        Kamida 3 ta vazifani yakunlash
                        {ratingCount >= 3 && <span className="text-[10px] bg-edu-primary/15 text-edu-primary px-2 py-0.5 rounded-full font-bold">Bajarilgan</span>}
                      </h3>
                      <p className="text-xs text-edu-muted mt-1 leading-normal">
                        Muvaffaqiyatli yakunlangan va baholangan vazifalar soni 3 tadan kam bo'lmasligi kerak.
                      </p>
                    </div>
                  </div>
                  {ratingCount >= 3 ? (
                    <CheckCircle2 className="w-5 h-5 text-edu-primary shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-edu-muted shrink-0 mt-1" />
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-bold text-edu-muted mb-1.5">
                    <span>BAJARILISH PROGRESSI</span>
                    <span className="text-edu-text">{ratingCount} / 3 vazifa</span>
                  </div>
                  <div className="w-full h-2 bg-edu-border/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-edu-accent to-edu-primary rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${completedTasksProgress}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Back Button */}
            <Button
              variant="secondary"
              onClick={() => navigate('/gigs')}
              className="w-full h-12 rounded-2xl font-bold mt-2 active-bounce text-sm"
            >
              Katalogga qaytish
            </Button>
          </div>
        ) : (
          /* Premium Stepper Form (Access granted) */
          <div className="flex flex-col gap-5 animate-fade-up">
            
            {/* Custom Premium Stepper Progress Indicator */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step === 1 ? 'bg-edu-primary text-white scale-110 shadow-lg shadow-edu-primary/20' : 'bg-edu-primary/20 text-edu-primary'
                }`}>
                  1
                </span>
                <span className={`text-xs font-bold transition-all duration-300 ${step === 1 ? 'text-edu-text' : 'text-edu-muted'}`}>
                  Asosiy ma'lumotlar
                </span>
              </div>
              <div className="flex-1 h-0.5 mx-3 bg-edu-border/30 rounded-full overflow-hidden">
                <div className={`h-full bg-edu-primary transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step === 2 ? 'bg-edu-primary text-white scale-110 shadow-lg shadow-edu-primary/20' : 'bg-edu-border/30 text-edu-muted'
                }`}>
                  2
                </span>
                <span className={`text-xs font-bold transition-all duration-300 ${step === 2 ? 'text-edu-text' : 'text-edu-muted'}`}>
                  Narx va muddat
                </span>
              </div>
            </div>

            {/* Form Steps */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              
              {/* Step 1: General Info */}
              {step === 1 && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="bg-edu-surface rounded-2xl p-4 border border-edu-border/30 shadow-sm flex flex-col gap-4">
                    {/* Title */}
                    <TextInput
                      label="XIZMAT SARLAVHASI"
                      placeholder="Masalan: Professional tarjima inglizchadan o'zbekchaga"
                      error={errors.title?.message}
                      maxLength={100}
                      currentLength={titleVal.length}
                      startContent={<Sparkles className="w-4 h-4 text-edu-primary shrink-0" />}
                      {...register('title')}
                    />

                    {/* Description */}
                    <TextArea
                      label="XIZMAT TAVSIFI"
                      placeholder="Freelancer sifatida nimalarni taklif qilishingizni, tajribangizni va buyurtmachi nimalar olishini batafsil tushuntiring..."
                      error={errors.description?.message}
                      maxLength={1000}
                      value={descVal} // Explicit value binding ensures correct count rendering
                      minRows={6}
                      {...register('description')}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNextStep}
                    className="w-full h-12 rounded-2xl font-bold flex items-center justify-center gap-1.5 active-bounce mt-2 shadow-lg shadow-edu-primary/10"
                  >
                    Keyingi bosqich <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Pricing and Conditions */}
              {step === 2 && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="bg-edu-surface rounded-2xl p-4 border border-edu-border/30 shadow-sm flex flex-col gap-4">
                    
                    {/* Price Input */}
                    <div>
                      <TextInput
                        type="number"
                        label="XIZMAT NARXI (SO'M)"
                        placeholder="Masalan: 50000"
                        error={errors.price?.message}
                        startContent={<DollarSign className="w-4 h-4 text-edu-primary shrink-0" />}
                        endContent={<span className="text-[10px] font-black text-edu-muted shrink-0">SO'M</span>}
                        {...register('price')}
                      />
                      {priceVal && !isNaN(Number(priceVal)) && Number(priceVal) >= 5000 && (
                        <p className="text-[11px] text-edu-primary font-bold mt-1.5 ml-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {new Intl.NumberFormat('uz-UZ').format(Number(priceVal))} so'm qabul qilinadi
                        </p>
                      )}
                    </div>

                    {/* Delivery Days */}
                    <TextInput
                      type="number"
                      label="YETKAZIB BERISH MUDDATI (KUN)"
                      placeholder="Masalan: 3"
                      error={errors.deliveryDays?.message}
                      startContent={<Clock className="w-4 h-4 text-edu-primary shrink-0" />}
                      endContent={<span className="text-[10px] font-black text-edu-muted shrink-0">KUN</span>}
                      {...register('deliveryDays')}
                    />
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 mt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 rounded-2xl font-bold active-bounce flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" /> Orqaga
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={createMutation.isPending}
                      className="flex-1 h-12 rounded-2xl font-bold active-bounce shadow-lg shadow-edu-primary/10 flex items-center justify-center gap-1.5"
                    >
                      Katalogga joylash <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

            </form>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
