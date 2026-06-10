import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { ShieldCheck, Download, CreditCard } from 'lucide-react';

export function AcceptDeliveryModal({ isOpen, onClose, onConfirm, isLoading }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Natijani qabul qilasizmi?"
      footer={
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose} className="h-12 rounded-[18px]">
            Bekor qilish
          </Button>
          <Button variant="primary" fullWidth isLoading={isLoading} onClick={onConfirm} className="h-12 rounded-[18px] bg-emerald-500 shadow-ios">
            ✅ Ha, qabul qilaman
          </Button>
        </div>
      }
    >
      <div className="py-2 space-y-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 shadow-sm text-emerald-800 space-y-3">
          <p className="text-[13px] font-bold text-emerald-700 uppercase tracking-widest text-center">Tasdiqlaganingizdan so'ng:</p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Download size={12} />
              </div>
              <span className="text-[13px] font-medium text-edu-text">To'liq fayllar avtomatik yuklanadi va qulfdan chiqadi</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CreditCard size={12} />
              </div>
              <span className="text-[13px] font-medium text-edu-text">To'lov freelancer hisobiga o'tkaziladi</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <ShieldCheck size={12} />
              </div>
              <span className="text-[13px] font-medium text-edu-text">Topshiriq yopiladi va yakuniga yetadi</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
