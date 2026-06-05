// src/screens/CreateTaskScreen.jsx
import { useState } from 'react';
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
import { hapticSuccess } from '../../lib/telegram';
import { trackEvent } from '../../lib/observability';

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
      attachmentFileIds:    files.map((f) => f.id),
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
  let mainBtnText = step === 3 ? 'E\'lon qilish ✓' : 'Keyingisi →';
  let mainBtnClick = step === 3 ? handleSubmit : handleNext;
  
  if (step === 1 && nlpSeverity === 'block') {
    mainBtnText = '';
  }

  useMainButton({
    text: mainBtnText,
    onClick: mainBtnClick,
    isLoading: createTask.isPending,
  }, [step, form, nlpSeverity, createTask.isPending]);

  return (
    <PageLayout showNav={false}>
      <Header title="Yangi vazifa" showBack />

      <div className="px-4 pt-3 pb-6 space-y-5">
        <ProgressStepper steps={STEPS} current={step} />

        {targetFreelancerId && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-indigo-100 dark:border-indigo-800">
            <span className="text-lg">🎯</span>
            Shaxsiy yollash: Vazifa yaratilgach havola nusxalanadi, uni ushbu mutaxassisga jo'nating.
          </div>
        )}

        {/* ── Step 1 ─────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <SelectInput
              label="Kategoriya *"
              placeholder="Tanlang"
              options={CATEGORIES}
              value={form.category}
              onChange={(v) => set('category', v)}
              error={errors.category?.[0]}
            />
            <TextInput
              label="Sarlavha *"
              placeholder="Qisqacha aniq sarlavha"
              value={form.title}
              onValueChange={(v) => set('title', v)}
              maxLength={200}
              currentLength={form.title.length}
              error={errors.title?.[0]}
            />
            <TextArea
              label="Tavsif *"
              placeholder="Nima kerakligini batafsil yozing (min 20 harf)..."
              value={form.description}
              onValueChange={(v) => set('description', v)}
              maxLength={2000}
              minRows={4}
              error={errors.description?.[0]}
            />
            <NLPWarning text={form.title + ' ' + form.description} />
          </div>
        )}

        {/* ── Step 2 ─────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <p className="text-sm font-semibold text-edu-text mb-2">Narx oralig'i (so'm) *</p>
              <div className="flex items-center gap-3">
                <TextInput
                  className="flex-1"
                  placeholder="15000"
                  type="number"
                  value={form.priceMin}
                  onValueChange={(v) => set('priceMin', v)}
                  error={errors.priceMin?.[0]}
                />
                <span className="text-edu-muted font-bold">—</span>
                <TextInput
                  className="flex-1"
                  placeholder="30000"
                  type="number"
                  value={form.priceMax}
                  onValueChange={(v) => set('priceMax', v)}
                  error={errors.priceMax?.[0]}
                />
              </div>
              {Number(form.priceMin) >= Number(form.priceMax) && form.priceMin && form.priceMax && (
                <p className="text-xs text-red-500 mt-1">Min narx maxdan kichik bo'lishi kerak</p>
              )}
            </div>

            <ToggleSwitch
              label="⚡ Shoshilinch?"
              description="Ha: +20% ustama avtomatik qo'shiladi"
              checked={form.isUrgent}
              onChange={(v) => set('isUrgent', v)}
            />

            {form.priceMin && form.priceMax && Number(form.priceMin) < Number(form.priceMax) && (
              <div className="bg-edu-primary/5 border border-edu-primary/20 p-3 rounded-xl mt-2 text-xs">
                <p className="flex justify-between mb-1 text-edu-muted">
                  Asosiy narx: <span>{formatPriceRange(Number(form.priceMin), Number(form.priceMax))}</span>
                </p>
                {form.isUrgent && (
                  <p className="flex justify-between mb-1 text-orange-500 font-medium">
                    Shoshilinch ustama (+20%): <span>{formatPriceRange(Number(form.priceMin) * 0.2, Number(form.priceMax) * 0.2)}</span>
                  </p>
                )}
                <div className="h-px w-full bg-edu-border/50 my-1.5" />
                <p className="flex justify-between font-bold text-edu-text text-sm">
                  Umumiy byudjet: <span>{formatPriceRange(Number(form.priceMin) * (form.isUrgent ? 1.2 : 1), Number(form.priceMax) * (form.isUrgent ? 1.2 : 1))}</span>
                </p>
              </div>
            )}

            <TextInput
              label="Muddat (deadline) *"
              type="datetime-local"
              value={form.deadline}
              onValueChange={(v) => set('deadline', v)}
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000 + 10 * 60 * 1000).toISOString().slice(0, 16)}
              error={errors.deadline?.[0]}
            />

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setStep(1)}>← Orqaga</Button>
            </div>
          </div>
        )}

        {/* ── Step 3 ─────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <FileUpload value={files} onChange={setFiles} maxFiles={5} label="Biriktirmalar" />

            {/* Preview */}
            <Card className="bg-edu-bg border border-edu-border" radius="xl">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-bold text-edu-muted uppercase tracking-wider mb-1">📋 Shartnoma preview</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-edu-muted">Kategoriya:</span>
                    <span className="font-semibold text-edu-text">{CATEGORIES.find(c=>c.value===form.category)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-edu-muted">Narx:</span>
                    <span className="font-semibold text-edu-text">
                      {form.priceMin && form.priceMax ? formatPriceRange(Number(form.priceMin), Number(form.priceMax)) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-edu-muted">Shoshilinch:</span>
                    <span className="font-semibold text-edu-text">{form.isUrgent ? '✅ Ha (+20%)' : '❌ Yo\'q'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-edu-muted">Deadline:</span>
                    <span className="font-semibold text-edu-text">{form.deadline ? new Date(form.deadline).toLocaleDateString('uz-UZ') : '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setStep(2)}>← Orqaga</Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
