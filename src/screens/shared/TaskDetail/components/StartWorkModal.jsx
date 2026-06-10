import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Clock, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

export function StartWorkModal({ isOpen, onClose, onConfirm, isLoading, deadline }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Diqqat!"
      footer={
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose} className="h-12 rounded-[18px]">
            Bekor qilish
          </Button>
          <Button variant="primary" fullWidth isLoading={isLoading} onClick={onConfirm} className="h-12 rounded-[18px] shadow-ios-primary">
            🚀 Boshlash
          </Button>
        </div>
      }
    >
      <div className="py-2 space-y-4">
        <div className="flex flex-col items-center justify-center text-center space-y-2 mb-2">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-2 shadow-inner">
            <Clock size={32} />
          </div>
          <h3 className="text-lg font-bold text-edu-text tracking-tight">Tayyormisiz?</h3>
          <p className="text-sm text-edu-muted leading-relaxed">
            "Boshlash" tugmasini bosishingiz bilan rasmiy hisob-kitob va muddat taymeri boshlanadi.
          </p>
        </div>

        <div className="bg-edu-surface border border-edu-border/50 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-edu-text">
              Topshirish muddati: 
              <span className="font-bold text-edu-urgent ml-1">
                {deadline ? format(new Date(deadline), 'd MMM, HH:mm', { locale: uz }) : 'Belgilanmagan'}
              </span>
            </p>
          </div>
          <div className="h-[1px] w-full bg-edu-border/30" />
          <p className="text-[11px] text-edu-muted leading-relaxed italic">
            Iltimos, barcha yozishmalar va fayl almashinuvlarini faqat EduMarket platformasi orqali amalga oshiring. Platforma tashqarisidagi kelishuvlar himoyalanmaydi.
          </p>
        </div>
      </div>
    </Modal>
  );
}
