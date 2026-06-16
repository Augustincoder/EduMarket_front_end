import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useCreateTaskStore } from '../../../store/useCreateTaskStore';
import { TextInput } from '../../../components/forms/TextInput';
import { ToggleSwitch } from '../../../components/forms/ToggleSwitch';
import { hapticLight } from '../../../lib/telegram';

export function Step2Budget() {
  const { 
    category, priceMin, priceMax, isUrgent, deadline, errors, updateField,
    isCoWorking, maxCollaborators, paymentSplitType
  } = useCreateTaskStore();

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

      <div className="bg-edu-surface p-4 rounded-xl border border-edu-border/20 shadow-ios">
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs font-bold text-edu-muted uppercase tracking-widest">Byudjet oralig'i (UZS) *</p>
          <span className="text-xs text-edu-primary font-semibold bg-edu-primary/10 px-2 py-1 rounded-xl">
            Tavsiya: {aiSuggestedPrice}
          </span>
        </div>

        {/* Giant visual budget display (Odometer feel) */}
        <div className="flex items-baseline justify-center gap-2 mb-6 overflow-hidden h-10">
           <motion.div 
             key={priceMin} 
             initial={{ y: 20, opacity: 0 }} 
             animate={{ y: 0, opacity: 1 }} 
             className="text-3xl font-black text-edu-text"
           >
             {priceMin ? Number(priceMin).toLocaleString('uz-UZ') : '0'}
           </motion.div>
           <span className="text-xl text-edu-muted font-bold">-</span>
           <motion.div 
             key={priceMax} 
             initial={{ y: -20, opacity: 0 }} 
             animate={{ y: 0, opacity: 1 }} 
             className="text-3xl font-black text-edu-text"
           >
             {priceMax ? Number(priceMax).toLocaleString('uz-UZ') : '0'}
           </motion.div>
           <span className="text-sm font-bold text-edu-primary ml-1">UZS</span>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <TextInput
            className="flex-1"
            placeholder="Min"
            type="number"
            min="1000"
            value={priceMin}
            onValueChange={(val) => updateField('priceMin', val)}
            error={!!(errors.priceMin || errors.priceMax || hasRangeError)} // Only highlight border
            hideErrorMessage // Hypothetical prop or we just pass boolean
          />
          <div className="w-4 h-[2px] bg-edu-border/50 rounded-full" />
          <TextInput
            className="flex-1"
            placeholder="Max"
            type="number"
            min="1000"
            value={priceMax}
            onValueChange={(val) => updateField('priceMax', val)}
            error={!!(errors.priceMin || errors.priceMax || hasRangeError)}
            hideErrorMessage
          />
        </div>
        {(hasRangeError || errors.priceMin || errors.priceMax) && (
          <p className="text-xs font-bold text-edu-urgent mt-2 px-1 animate-fade-in">
            {hasRangeError 
              ? 'Minimal narx maksimaldan kichik bo\'lishi kerak' 
              : (errors.priceMin?.[0] || errors.priceMax?.[0])}
          </p>
        )}
      </div>

      <div className="bg-edu-surface p-4 rounded-xl border border-edu-border/20 shadow-ios space-y-4">
        <ToggleSwitch
          label="⚡ Shoshilinch?"
          description="Tizimda vazifangiz yuqori o'rinlarda ko'rinadi"
          checked={isUrgent}
          onChange={(v) => { hapticLight(); updateField('isUrgent', v); }}
        />

        {isUrgent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-4 border-t border-edu-border/20 space-y-3"
          >
            <div className="flex justify-between items-center text-sm">
              <span className="text-edu-muted font-medium">Shoshilinch xizmati (20%)</span>
              <span className="text-edu-urgent font-bold">
                +{priceMin ? (Number(priceMin) * 0.2).toLocaleString('uz-UZ') : '0'} UZS
              </span>
            </div>
            <div className="bg-edu-urgent/5 p-3 rounded-lg border border-edu-urgent/10">
              <p className="text-[11px] text-edu-urgent font-semibold leading-relaxed">
                Vazifangiz barcha mutaxassislarga "Shoshilinch" belgisi bilan ko'rsatiladi va Smart Match tizimi orqali eng yuqori reytingli frilanserlarga birinchi bo'lib yuboriladi.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-edu-surface p-4 rounded-xl border border-edu-border/20 shadow-ios">
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

      {/* Study Buddy: Co-working Mode */}
      <div className="bg-edu-surface p-4 rounded-xl border border-edu-border/20 shadow-ios space-y-4">
        <ToggleSwitch
          label="🤝 Jamoaviy vazifa (Study Buddy)"
          description="Bir nechta frilanser bilan ishlashni xohlaysizmi?"
          checked={isCoWorking}
          onChange={(v) => { hapticLight(); updateField('isCoWorking', v); }}
        />

        {isCoWorking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-4 border-t border-edu-border/20 space-y-4"
          >
            <div>
              <p className="text-xs font-bold text-edu-muted uppercase tracking-widest mb-2">Jamoa a'zolari soni (max 4)</p>
              <div className="flex items-center gap-2">
                {[2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => { hapticLight(); updateField('maxCollaborators', num); }}
                    className={`flex-1 py-2 rounded-xl font-medium transition-colors ${
                      maxCollaborators === num
                        ? 'bg-edu-primary text-white shadow-md'
                        : 'bg-edu-bg text-edu-text hover:bg-edu-primary/10'
                    }`}
                  >
                    {num} kishi
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-edu-muted uppercase tracking-widest mb-2">To'lov taqsimoti</p>
              <select
                value={paymentSplitType}
                onChange={(e) => updateField('paymentSplitType', e.target.value)}
                className="w-full bg-edu-bg border border-edu-border/40 rounded-xl px-4 py-3 text-edu-text text-sm font-medium outline-none focus:border-edu-primary transition-all"
              >
                <option value="EQUAL">Teng taqsimlash</option>
                <option value="CUSTOM">Maxsus taqsimot</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
