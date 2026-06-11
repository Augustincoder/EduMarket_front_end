import { useCreateTaskStore } from '../../../store/useCreateTaskStore';
import { useCategoryStore } from '../../../store/categoryStore';
import { formatPriceRange } from '../../../lib/constants';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { CheckCircle2, ShieldCheck, Globe, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Step5Review() {
  const { 
    category, title, priceMin, priceMax, deadline, 
    isUrgent, files, targeting, nlpSeverity 
  } = useCreateTaskStore();
  const navigate = useNavigate();

  const categoryStore = useCategoryStore(s => s.categories);
  const catObj = categoryStore.find(c => c.value === category);
  
  let targetLabel = 'Barcha freelancerlarga';
  let TargetIcon = Globe;
  if (targeting === 'verified') { targetLabel = 'Faqat Ishonchlilar'; TargetIcon = ShieldCheck; }
  if (targeting === 'vip') { targetLabel = 'Faqat VIP Mutaxassislar'; TargetIcon = Crown; }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-xl font-bold text-edu-text">Tasdiqlash</h2>
        <p className="text-sm text-edu-muted">Barchasi to'g'riligini tekshiring va e'lon qiling</p>
      </div>

      <div className="bg-edu-surface rounded-2xl p-5 border border-edu-border/20 shadow-ios space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-edu-bg flex items-center justify-center text-2xl shrink-0">
            {catObj?.emoji}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-edu-muted uppercase tracking-widest">{catObj?.label}</span>
              {isUrgent && (
                <span className="px-2 py-0.5 rounded-md bg-edu-urgent/10 text-edu-urgent text-[10px] font-bold uppercase">
                  Shoshilinch
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-edu-text mt-1 leading-snug line-clamp-2">{title}</h3>
          </div>
        </div>

        <div className="h-[1px] w-full bg-edu-border/30" />

        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
          <div>
            <p className="text-[10px] font-bold text-edu-muted uppercase tracking-widest mb-1">Byudjet</p>
            <p className="text-sm font-semibold text-edu-primary">
              {formatPriceRange(priceMin, priceMax)} so'm
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-edu-muted uppercase tracking-widest mb-1">Muddat</p>
            <p className="text-sm font-semibold text-edu-text">
              {deadline ? format(new Date(deadline), 'd MMM, HH:mm', { locale: uz }) : '-'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-edu-muted uppercase tracking-widest mb-1">Fayllar</p>
            <p className="text-sm font-semibold text-edu-text">
              {files.length > 0 ? `${files.length} ta biriktirilgan` : "Yo'q"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-edu-muted uppercase tracking-widest mb-1">Kimlarga ko'rinadi</p>
            <p className="text-sm font-semibold text-edu-text flex items-center gap-1 line-clamp-1">
              <TargetIcon size={14} className="text-edu-muted" /> {targetLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2 bg-edu-bg p-3 rounded-xl border border-edu-border/20">
          <CheckCircle2 size={16} className="text-edu-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-edu-muted">E'lon qilingandan so'ng narx va muddatni o'zgartirib bo'lmaydi.</p>
        </div>
        
        {nlpSeverity === 'warning' && (
          <div className="flex items-start gap-2 bg-orange-50 p-3 rounded-xl border border-orange-100">
            <ShieldCheck size={16} className="text-orange-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-orange-700">Akademik siyosat tekshiruvidan muvaffaqiyatli o'tdi. Matningiz xavfsiz.</p>
          </div>
        )}
      </div>
    </div>
  );
}
