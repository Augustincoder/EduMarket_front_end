import { useMemo, useState } from 'react';
import { useCreateTaskStore } from '../../../store/useCreateTaskStore';
import { TextInput } from '../../../components/forms/TextInput';
import { ToggleSwitch } from '../../../components/forms/ToggleSwitch';
import { hapticLight } from '../../../lib/telegram';

export function Step2Budget() {
  const { category, priceMin, priceMax, isUrgent, deadline, errors, updateField } = useCreateTaskStore();

  const [now] = useState(() => Date.now());
  const minDate = new Date(now - new Date().getTimezoneOffset() * 60000 + 10 * 60 * 1000).toISOString().slice(0, 16);

  const aiSuggestedPrice = useMemo(() => {
    if (category === 'KURS_ISHI') return '150,000 - 300,000';
    if (category === 'REFERAT' || category === 'TARJIMA') return '50,000 - 150,000';
    if (category === 'SLAYD' || category === 'KONSPEKT') return '30,000 - 80,000';
    return '50,000 - 200,000';
  }, [category]);

  const hasRangeError = Number(priceMin) >= Number(priceMax) && priceMin && priceMax;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-xl font-bold text-edu-text">Byudjet va Muddat</h2>
        <p className="text-sm text-edu-muted">Qancha to'lashni va qachongacha tayyor bo'lishini belgilang</p>
      </div>

      <div className="bg-edu-surface p-4 rounded-2xl border border-edu-border/20 shadow-ios">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold text-edu-muted uppercase tracking-widest">Byudjet oralig'i (UZS) *</p>
          <span className="text-xs text-edu-primary font-semibold bg-edu-primary/10 px-2 py-1 rounded-lg">
            Tavsiya: {aiSuggestedPrice}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <TextInput
            className="flex-1"
            placeholder="Min"
            type="number"
            value={priceMin}
            onValueChange={(val) => updateField('priceMin', val)}
            error={errors.priceMin?.[0]}
          />
          <div className="w-4 h-[2px] bg-edu-border/50 rounded-full" />
          <TextInput
            className="flex-1"
            placeholder="Max"
            type="number"
            value={priceMax}
            onValueChange={(val) => updateField('priceMax', val)}
            error={errors.priceMax?.[0]}
          />
        </div>
        {hasRangeError && (
          <p className="text-xs font-bold text-edu-urgent mt-2 px-1">Minimal narx maksimaldan kichik bo'lishi kerak</p>
        )}
      </div>

      <ToggleSwitch
        label="⚡ Shoshilinch?"
        description="Tizimda vazifangiz yuqori o'rinlarda ko'rinadi (+20%)"
        checked={isUrgent}
        onChange={(v) => { hapticLight(); updateField('isUrgent', v); }}
      />

      <div className="bg-edu-surface p-4 rounded-2xl border border-edu-border/20 shadow-ios">
        <p className="text-xs font-bold text-edu-muted uppercase tracking-widest mb-3">Tugash muddati (Deadline) *</p>
        <div className="relative">
          <input
            type="datetime-local"
            className="w-full bg-edu-bg border border-edu-border/40 rounded-xl px-4 py-3.5 text-edu-text text-base font-medium outline-none focus:border-edu-primary focus:ring-1 focus:ring-edu-primary/50 transition-all"
            min={minDate}
            value={deadline}
            onChange={(e) => updateField('deadline', e.target.value)}
          />
        </div>
        {errors.deadline && <p className="text-xs text-edu-urgent mt-2 px-1">{errors.deadline[0]}</p>}
      </div>
    </div>
  );
}
