// src/screens/shared/TaskDetail/components/PromoteModal.jsx
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Crown, Zap } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { hapticLight } from '../../../../lib/telegram';

export function PromoteModal({
  isOpen,
  onClose,
  isLoading,
  onSubmit
}) {
  const PACKAGES = [
    { 
      type: 'PIN_12H', 
      label: '12 soatga mahkamlash', 
      description: 'Vazifa 12 soat davomida ro\'yxat tepasida turadi',
      price: '5,000', 
      icon: <Zap size={18} className="text-blue-500" />,
      color: 'blue'
    },
    { 
      type: 'PIN_24H', 
      label: '24 soatga mahkamlash', 
      description: 'Maksimal natija uchun 24 soatlik premium pinning',
      price: '9,000', 
      icon: <Crown size={18} className="text-amber-500" />,
      color: 'amber'
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vazifani ko'tarish"
    >
      <div className="py-2 space-y-6">
        <div className="px-1">
          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Vazifangizni ro'yxatning eng yuqorisiga chiqaring va ko'proq mutaxassislarni jalb qiling.
          </p>
        </div>

        <div className="space-y-2">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.type}
              disabled={isLoading}
              onClick={() => { hapticLight(); onSubmit(pkg.type); }}
              className="w-full text-left p-4 rounded-3xl bg-gray-50 dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.05] transition-all active:scale-[0.98] flex items-center gap-4 group hover:border-edu-primary/30"
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                pkg.color === 'blue' ? "bg-blue-50 dark:bg-blue-500/10" : "bg-amber-50 dark:bg-amber-500/10"
              )}>
                {pkg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-black text-gray-900 dark:text-gray-100">{pkg.label}</p>
                <p className="text-[11px] text-gray-400 font-medium">{pkg.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[14px] font-black text-edu-primary">{pkg.price} so'm</p>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={isLoading} className="rounded-2xl h-11 text-gray-400 font-bold text-xs uppercase tracking-widest">
            Bekor qilish
          </Button>
        </div>
      </div>
    </Modal>
  );
}
