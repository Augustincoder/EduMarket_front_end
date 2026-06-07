// src/screens/CreateTaskScreen.jsx
import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import { ProgressStepper } from '../../components/ui/ProgressStepper';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/forms/TextInput';
import { TextArea } from '../../components/forms/TextArea';
import { SelectInput } from '../../components/forms/SelectInput';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch';
import { FileUpload } from '../../components/forms/FileUpload';
import { NLPWarning, useNLPCheck } from '../../components/forms/NLPWarning';
import { useCreateTask } from '../../hooks/useTasks';
import { useMainButton } from '../../hooks/useMainButton';
import { CATEGORIES, formatPriceRange } from '../../lib/constants';
import { hapticSuccess, hapticLight } from '../../lib/telegram';
import { trackEvent } from '../../lib/observability';
import toast from 'react-hot-toast';

const STEPS = ['Asosiy', 'Narx', 'Fayllar'];

export default function CreateTaskScreen() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const createTask = useCreateTask();
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({
    category: location.state?.category || '', title: '', description: '',
    priceMin: '', priceMax: '', isUrgent: false,
    deadline: '', attachmentFileIds: [],
  });
  const [files, setFiles]  = useState([]);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: null })); };

  const nlpSeverity = useNLPCheck(form.title + ' ' + form.description);

  const minDate = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60000 + 10 * 60 * 1000).toISOString().slice(0, 16);
  }, []);

  const handleNext = () => {
    setErrors({});
    if (step === 1) {
      if (!form.category) return setErrors({ category: ['Kategoriya tanlash majburiy'] });
      if (form.title.trim().length < 10) return setErrors({ title: ['Kamida 10 ta belgi kiritish shart'] });
      if (form.description.trim().length < 20) return setErrors({ description: ['Kamida 20 ta belgi kiritish shart'] });
      if (nlpSeverity === 'block') return;
    }
    if (step === 2) {
      if (!form.priceMin) return setErrors({ priceMin: ['Min narxni kiriting'] });
      if (!form.priceMax) return setErrors({ priceMax: ['Max narxni kiriting'] });
      if (!form.deadline) return setErrors({ deadline: ['Muddatni tanlang'] });
      if (Number(form.priceMin) >= Number(form.priceMax)) return setErrors({ priceMin: ['Min narx maxdan kichik bo\'lishi kerak'] });
    }
    hapticLight();
    setStep((s) => s + 1);
  };

  const targetFreelancerId = new URLSearchParams(location.search).get('freelancerId');

  const handleSubmit = async () => {
    setErrors({});
    const payload = {
      category:             form.category,
      title:                form.title,
      description:          form.description,
      priceMin:             Math.floor(Number(form.priceMin)),
      priceMax:             Math.floor(Number(form.priceMax)),
      isUrgent:             form.isUrgent,
      deadline:             new Date(form.deadline).toISOString(),
      attachmentFileIds:    files.map((f) => f.fileId || f.id),
    };
    try {
      const res = await createTask.mutateAsync(payload);
      hapticSuccess();
      trackEvent('Task Created', {
        category: form.category,
        isUrgent: form.isUrgent,
        priceMin: payload.priceMin,
        priceMax: payload.priceMax,
      });
      if (targetFreelancerId) {
        toast.success("Vazifa yaratildi! Uni havolasini jo'nating.");
        navigator.clipboard.writeText(`${window.location.origin}/tasks/${res.data?.data?.id || ''}`);
      }
      navigate('/tasks', { replace: true });
    } catch (error) {
      if (error.serverErrors) {
        setErrors(error.serverErrors);
        if (error.serverErrors.category || error.serverErrors.title || error.serverErrors.description) {
          setStep(1);
        } else if (error.serverErrors.priceMin || error.serverErrors.priceMax || error.serverErrors.deadline) {
          setStep(2);
        }
      }
      console.error("Task creation failed", error);
    }
  };

  // MainButton Logic
  let mainBtnText = step === 3 ? 'TASDIQLASH ✓' : 'KEYINGISI →';
  let mainBtnClick = step === 3 ? handleSubmit : handleNext;
  
  if (step === 1 && nlpSeverity === 'block') {
    mainBtnText = '';
  }

  useMainButton({
    text: mainBtnText,
    onClick: mainBtnClick,
    isLoading: createTask.isPending,
  }, [step, form, nlpSeverity, createTask.isPending, files]);

  return (
    <PageLayout showNav={false} className="bg-white dark:bg-black">
      <Header title="Yangi vazifa" showBack className="!border-none" />

      <div className="px-6 pt-2 pb-10 space-y-8">
        <ProgressStepper steps={STEPS} current={step} />

        {targetFreelancerId && (
          <div className="bg-[#007AFF]/5 text-[#007AFF] p-4 rounded-[22px] text-[12px] font-bold flex items-center gap-3 border border-[#007AFF]/10">
            <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center shrink-0">🎯</div>
            <p>Shaxsiy yollash: Vazifa yaratilgach havola nusxalanadi, uni ushbu mutaxassisga jo'nating.</p>
          </div>
        )}

        {/* ── Step 1 ─────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SelectInput
              label="Kategoriya *"
              placeholder="Yo'nalishni tanlang"
              options={CATEGORIES}
              value={form.category}
              onChange={(v) => set('category', v)}
              error={errors.category?.[0]}
            />
            <TextInput
              label="Sarlavha *"
              placeholder="Masalan: Logotip chizib berish kerak"
              value={form.title}
              onValueChange={(v) => set('title', v)}
              maxLength={200}
              currentLength={form.title.length}
              error={errors.title?.[0]}
            />
            <TextArea
              label="Batafsil tavsif *"
              placeholder="Vazifa haqida barcha ma'lumotlarni yozing..."
              value={form.description}
              onValueChange={(v) => set('description', v)}
              maxLength={2000}
              minRows={6}
              error={errors.description?.[0]}
            />
            <NLPWarning text={form.title + ' ' + form.description} />
          </div>
        )}

        {/* ── Step 2 ─────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 mb-3">Byudjet oralig'i (UZS) *</p>
              <div className="flex items-center gap-3">
                <TextInput
                  className="flex-1"
                  placeholder="Min"
                  type="number"
                  value={form.priceMin}
                  onValueChange={(v) => set('priceMin', v)}
                  error={errors.priceMin?.[0]}
                />
                <div className="w-4 h-[1px] bg-gray-200 dark:bg-white/10" />
                <TextInput
                  className="flex-1"
                  placeholder="Max"
                  type="number"
                  value={form.priceMax}
                  onValueChange={(v) => set('priceMax', v)}
                  error={errors.priceMax?.[0]}
                />
              </div>
              {Number(form.priceMin) >= Number(form.priceMax) && form.priceMin && form.priceMax && (
                <p className="text-[11px] font-bold text-red-500 mt-2 px-1">Min narx maxdan kichik bo'lishi kerak</p>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-white/5 rounded-[28px] p-6 border border-black/[0.02] dark:border-white/[0.05]">
              <ToggleSwitch
                label="⚡ Shoshilinch?"
                description="Tizimda vazifangiz yuqori o'rinlarda ko'rinadi (+20%)"
                checked={form.isUrgent}
                onChange={(v) => { hapticLight(); set('isUrgent', v); }}
              />

              {form.priceMin && form.priceMax && Number(form.priceMin) < Number(form.priceMax) && (
                <div className="mt-6 pt-6 border-t border-black/[0.05] dark:border-white/10 space-y-2">
                  <div className="flex justify-between text-[13px] font-bold text-gray-400">
                    <span>Asosiy narx</span>
                    <span>{formatPriceRange(Number(form.priceMin), Number(form.priceMax))}</span>
                  </div>
                  {form.isUrgent && (
                    <div className="flex justify-between text-[13px] font-black text-orange-500">
                      <span>Shoshilinch ustama</span>
                      <span>+20%</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[16px] font-black text-gray-900 dark:text-white pt-2">
                    <span>Umumiy byudjet</span>
                    <span className="text-[#007AFF]">{formatPriceRange(Number(form.priceMin) * (form.isUrgent ? 1.2 : 1), Number(form.priceMax) * (form.isUrgent ? 1.2 : 1))}</span>
                  </div>
                </div>
              )}
            </div>

            <TextInput
              label="Tugash muddati (Deadline) *"
              type="datetime-local"
              value={form.deadline}
              onValueChange={(v) => set('deadline', v)}
              min={minDate}
              error={errors.deadline?.[0]}
            />

            <Button variant="secondary" fullWidth onClick={() => { hapticLight(); setStep(1); }} className="h-14">
              ← Orqaga
            </Button>
          </div>
        )}

        {/* ── Step 3 ─────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FileUpload value={files} onChange={setFiles} maxFiles={5} label="Fayllarni biriktirish" />

            {/* Premium Preview Card */}
            <div className="space-y-4">
              <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Vazifa namunasi</p>
              <Card className="border-none shadow-premium-lg bg-gray-50 dark:bg-white/5 overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-[19px] font-black text-gray-900 dark:text-white leading-tight mb-2">{form.title}</h3>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400 line-clamp-3 font-medium">{form.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Byudjet</p>
                      <p className="text-[15px] font-black text-[#007AFF]">
                        {formatPriceRange(Number(form.priceMin) * (form.isUrgent ? 1.2 : 1), Number(form.priceMax) * (form.isUrgent ? 1.2 : 1))}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Muddati</p>
                      <p className="text-[15px] font-black text-gray-800 dark:text-gray-200">
                        {form.deadline ? new Date(form.deadline).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' }) : '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button variant="secondary" fullWidth onClick={() => { hapticLight(); setStep(2); }} className="h-14">
              ← Orqaga
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
