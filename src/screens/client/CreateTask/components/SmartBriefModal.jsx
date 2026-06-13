import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useCreateTaskStore } from '../../../../store/useCreateTaskStore';
import { hapticImpact } from '../../../../lib/telegram';
import toast from 'react-hot-toast';
import { aiService } from '../../../../services/ai.service'; 
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';

export function SmartBriefModal({ isOpen, onClose }) {
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
      onClose();
      
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
    <Modal 
      isOpen={isOpen} 
      onClose={isParsing ? undefined : onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-edu-primary to-edu-accent flex items-center justify-center shrink-0 shadow-inner">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-edu-primary to-edu-accent">
            Smart Brief AI
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-[13px] text-edu-muted leading-relaxed">
          Siz qanday vazifa bajarilishini xohlayotganingizni bir gap bilan yozing, sun'iy intellekt uni tizimga moslab to'ldirib beradi.
        </p>
        
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isParsing}
            placeholder="Masalan: Menga biologiyadan 10 betlik referat kerak, rus tilida, 2 kunda tayyor bo'lishi kerak va 50 ming so'm to'layman."
            className={cn(
              "w-full bg-edu-bg border rounded-xl p-4 text-[14px] font-medium text-edu-text placeholder:text-edu-muted focus:ring-2 focus:ring-edu-primary/30 resize-none min-h-[120px] transition-all",
              isParsing ? "border-edu-primary/50 opacity-80" : "border-edu-border/60 focus:border-edu-primary"
            )}
            rows={4}
          />
        </div>

        <Button 
          variant="primary" 
          fullWidth 
          onClick={handleGenerate}
          disabled={isParsing || text.trim().length < 10}
          className="h-12 rounded-xl text-[15px] shadow-ios-primary relative overflow-hidden"
        >
          {isParsing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Tahlil qilinmoqda...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={18} />
              Vazifa yaratish
            </span>
          )}
        </Button>
      </div>
    </Modal>
  );
}
