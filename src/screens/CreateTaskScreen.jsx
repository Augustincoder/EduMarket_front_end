// src/screens/CreateTaskScreen.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Header } from '../components/layout/Header';
import { PageLayout } from '../components/layout/PageLayout';
import { ProgressStepper } from '../components/ui/ProgressStepper';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/forms/TextInput';
import { TextArea } from '../components/forms/TextArea';
import { SelectInput } from '../components/forms/SelectInput';
import { ToggleSwitch } from '../components/forms/ToggleSwitch';
import { FileUpload } from '../components/forms/FileUpload';
import { NLPWarning, useNLPCheck } from '../components/forms/NLPWarning';
import { useCreateTask } from '../hooks/useTasks';
import { CATEGORIES, formatPriceRange } from '../lib/constants';
import { hapticSuccess } from '../lib/telegram';

const STEPS = ['Asosiy', 'Narx', 'Fayllar'];

export default function CreateTaskScreen() {
  const navigate   = useNavigate();
  const createTask = useCreateTask();
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({
    category: '', title: '', description: '',
    priceMin: '', priceMax: '', isUrgent: false,
    deadline: '', attachmentFileIds: [],
  });
  const [files, setFiles]  = useState([]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const nlpSeverity = useNLPCheck(form.title + ' ' + form.description);

  const handleNext = () => {
    if (step === 1) {
      if (!form.category || !form.title.trim() || form.description.length < 30) return;
      if (nlpSeverity === 'block') return;
    }
    if (step === 2) {
      if (!form.priceMin || !form.priceMax || !form.deadline) return;
      if (Number(form.priceMin) >= Number(form.priceMax)) return;
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    const payload = {
      category:             form.category,
      title:                form.title,
      description:          form.description,
      priceMin:             Number(form.priceMin),
      priceMax:             Number(form.priceMax),
      isUrgent:             form.isUrgent,
      deadline:             new Date(form.deadline).toISOString(),
      attachmentFileIds:    files.map((f) => f.id),
    };
    await createTask.mutateAsync(payload);
    hapticSuccess();
    navigate('/tasks', { replace: true });
  };

  return (
    <PageLayout showNav={false}>
      <Header title="Yangi vazifa" showBack />

      <div className="px-4 pt-3 pb-6 space-y-5">
        <ProgressStepper steps={STEPS} current={step} />

        {/* ── Step 1 ─────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <SelectInput
              label="Kategoriya *"
              placeholder="Tanlang"
              options={CATEGORIES}
              value={form.category}
              onChange={(v) => set('category', v)}
            />
            <TextInput
              label="Sarlavha *"
              placeholder="Qisqacha aniq sarlavha"
              value={form.title}
              onValueChange={(v) => set('title', v)}
              maxLength={100}
              currentLength={form.title.length}
            />
            <TextArea
              label="Tavsif *"
              placeholder="Nima kerakligini batafsil yozing (min 30 harf)..."
              value={form.description}
              onValueChange={(v) => set('description', v)}
              maxLength={500}
              minRows={4}
            />
            <NLPWarning text={form.title + ' ' + form.description} />
            <Button
              fullWidth size="lg" variant="primary"
              onClick={handleNext}
              disabled={!form.category || form.title.length < 5 || form.description.length < 30 || nlpSeverity === 'block'}
            >
              Keyingisi →
            </Button>
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
                />
                <span className="text-edu-muted font-bold">—</span>
                <TextInput
                  className="flex-1"
                  placeholder="30000"
                  type="number"
                  value={form.priceMax}
                  onValueChange={(v) => set('priceMax', v)}
                />
              </div>
              {Number(form.priceMin) >= Number(form.priceMax) && form.priceMin && form.priceMax && (
                <p className="text-xs text-red-500 mt-1">Min narx maxdan kichik bo'lishi kerak</p>
              )}
            </div>

            <ToggleSwitch
              label="⚡ Shoshilinch?"
              description="Ha: +20% rushFee avtomatik qo'shiladi"
              checked={form.isUrgent}
              onChange={(v) => set('isUrgent', v)}
            />

            <TextInput
              label="Muddat (deadline) *"
              type="datetime-local"
              value={form.deadline}
              onValueChange={(v) => set('deadline', v)}
            />

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setStep(1)}>← Orqaga</Button>
              <Button
                variant="primary" fullWidth
                onClick={handleNext}
                disabled={!form.priceMin || !form.priceMax || !form.deadline || Number(form.priceMin) >= Number(form.priceMax)}
              >
                Keyingisi →
              </Button>
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
              <Button
                variant="primary" fullWidth size="lg"
                isLoading={createTask.isPending}
                onClick={handleSubmit}
              >
                E'lon qilish ✓
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
