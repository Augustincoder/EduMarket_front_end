import { useState } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useCreateTaskStore } from '../../../../store/useCreateTaskStore';
import { hapticImpact } from '../../../../lib/telegram';
import toast from 'react-hot-toast';
import { aiService } from '../../../../services/ai.service'; 
import { AnimatePresence } from 'framer-motion';

export function SmartBriefInput() {
  const [text, setText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const { updateField, setStep } = useCreateTaskStore();

  const handleGenerate = async () => {
    if (text.trim().length < 10) {
      hapticImpact('light');
      toast.error('Iltimos, vazifani batafsilroq yozing');
      return;
    }

    setIsParsing(true);
    hapticImpact('medium');

    try {
      const parsedData = await aiService.parseTaskBrief(text);
      
      // Update store with parsed data
      if (parsedData.title) updateField('title', parsedData.title);
      if (parsedData.description) updateField('description', parsedData.description);
      if (parsedData.category) updateField('category', parsedData.category);
      if (parsedData.priceMin) updateField('priceMin', parsedData.priceMin);
      if (parsedData.priceMax) updateField('priceMax', parsedData.priceMax);
      if (parsedData.deadlineDays) {
        const d = new Date();
        d.setDate(d.getDate() + parsedData.deadlineDays);
        updateField('deadline', d.toISOString().split('T')[0]);
      }
      
      hapticImpact('heavy');
      toast.success('Vazifa shakllantirildi! Ko\'rib chiqing.');
      
      // Jump to step 5 (Review)
      setTimeout(() => {
        setStep(5);
      }, 300);

    } catch (err) {
      console.error(err);
      hapticImpact('light');
      toast.error('AI bilan ulanishda xatolik. Iltimos o\'zingiz to\'ldiring.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="relative mb-6">
      <div className={cn(
        "p-1 rounded-2xl transition-all duration-500",
        isParsing ? "bg-gradient-to-r from-edu-primary via-edu-accent to-blue-500 animate-pulse" : "bg-gradient-to-r from-edu-primary/20 via-edu-accent/20 to-blue-500/20"
      )}>
        <div className="bg-edu-surface rounded-xl p-4 shadow-sm relative overflow-hidden">
          {/* Shimmer effect while loading */}
          {isParsing && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          )}
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-edu-primary to-edu-accent flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold text-edu-text flex items-center gap-2">
                Smart Brief <span className="px-1.5 py-0.5 rounded-md bg-edu-accent/10 text-edu-accent text-[9px] uppercase tracking-wider">AI Beta</span>
              </h3>
              <p className="text-[12px] font-medium text-edu-muted leading-tight mt-0.5 mb-3">
                Bitta gap bilan yozing, qolganini sun'iy intellekt o'zi to'ldiradi.
              </p>
              
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isParsing}
                  placeholder="Menga biologiyadan 10 betlik referat kerak, rus tilida, 2 kunda tayyor bo'lishi kerak..."
                  className="w-full bg-edu-bg border-none rounded-xl p-3 text-[13px] font-medium text-edu-text placeholder:text-edu-muted focus:ring-2 focus:ring-edu-primary/30 resize-none min-h-[80px]"
                  rows={3}
                />
                
                <AnimatePresence>
                  {text.trim().length > 0 && !isParsing && (
                    <button
                      onClick={handleGenerate}
                      className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-edu-primary text-white flex items-center justify-center hover:bg-edu-primary-h active:scale-95 transition-all shadow-sm"
                    >
                      <ArrowRight size={16} />
                    </button>
                  )}
                </AnimatePresence>
                
                {isParsing && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center">
                    <Loader2 size={18} className="text-edu-primary animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
