import { useCreateTaskStore } from '../../../store/useCreateTaskStore';
import { hapticLight } from '../../../lib/telegram';
import { CheckCircle2, Globe, ShieldCheck, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const TARGETS = [
  { id: 'public', title: 'Barcha freelancerlarga', icon: Globe, desc: 'Tizimdagi barcha mutaxassislar taklif bera oladi (Tavsiya etiladi)' },
  { id: 'verified', title: 'Faqat Ishonchlilar', icon: ShieldCheck, desc: "Faqat pasport/ID bilan tasdiqlangan talabalar ko'radi" },
  { id: 'vip', title: 'Faqat VIP Mutaxassislar', icon: Crown, desc: 'Eng yuqori reytingli professional freelancerlar uchun' }
];

export function Step4Targeting() {
  const { targeting, targetFreelancerId, updateField } = useCreateTaskStore();

  const handleSelect = (id) => {
    hapticLight();
    updateField('targeting', id);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-xl font-bold text-edu-text">Kim ko'rsin?</h2>
        <p className="text-sm text-edu-muted">Vazifani ko'ra oladigan mutaxassislar doirasini belgilang</p>
      </div>

      {targetFreelancerId ? (
        <div className="bg-edu-primary/10 border border-edu-primary/20 rounded-xl p-4 flex gap-4">
          <div className="w-12 h-12 rounded-full bg-edu-primary/20 flex items-center justify-center text-2xl shrink-0">🎯</div>
          <div>
            <h3 className="font-bold text-edu-primary">Shaxsiy Yollash (Direct Hire)</h3>
            <p className="text-xs text-edu-primary/80 mt-1">Siz aniq bir mutaxassis profilidan o'tdingiz. Bu vazifa to'g'ridan-to'g'ri unga yuboriladi. Agar u rad etsa, vazifa hammaga ochiq bo'ladi.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {TARGETS.map((t) => {
            const isSelected = targeting === t.id;
            const Icon = t.icon;
            return (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-colors relative overflow-hidden group ${
                  isSelected 
                    ? 'bg-edu-primary/5 border-edu-primary shadow-[0_4px_15px_rgba(10,132,255,0.15)]' 
                    : 'bg-edu-surface border-edu-border/20 hover:border-edu-primary/30'
                }`}
              >
                {isSelected && (
                  <motion.div 
                    className="absolute inset-[-100%] z-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(10,132,255,0)_0%,rgba(10,132,255,0)_80%,rgba(10,132,255,0.15)_100%)] pointer-events-none"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  />
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative z-10 ${
                  isSelected ? 'bg-edu-primary/20 text-edu-primary' : 'bg-edu-bg text-edu-muted group-hover:bg-edu-primary/10 group-hover:text-edu-primary transition-colors'
                }`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 relative z-10">
                  <h3 className={`text-sm ${isSelected ? 'font-bold text-edu-primary' : 'font-semibold text-edu-text'}`}>
                    {t.title}
                  </h3>
                  <p className="text-[11px] text-edu-muted mt-0.5">{t.desc}</p>
                </div>
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10">
                    <CheckCircle2 className="text-edu-primary" size={20} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
