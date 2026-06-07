// src/screens/shared/TaskDetail/components/PromoteModal.jsx
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Sparkles, Crown, ArrowUp, CheckCircle2 } from 'lucide-react';
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
      description: 'Vazifangiz 12 soat davomida ro\'yxat tepasida turadi',
      price: '5,000', 
      icon: <ArrowUp size={22} className="text-blue-500" />,
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/10'
    },
    { 
      type: 'PIN_24H', 
      label: '24 soatga mahkamlash', 
      description: 'Maksimal natija uchun 24 soatlik premium pinning',
      price: '9,000', 
      icon: <Crown size={22} className="text-amber-500" />,
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/10'
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vazifani ko'tarish"
    >
      <div className="py-2 space-y-5">
        <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
          Vazifangizni ro'yxatning eng yuqorisiga chiqaring va ko'proq mutaxassislarni jalb qiling.
        </p>

        <div className="space-y-3">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.type}
              disabled={isLoading}
              onClick={() => { hapticLight(); onSubmit(pkg.type); }}
              className={cn(
                "w-full text-left p-4 rounded-[24px] border transition-all duration-300 active:scale-[0.98] flex items-center gap-4 group",
                pkg.bg, pkg.border,
                "hover:shadow-md hover:border-edu-primary/30"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black/20 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                {pkg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">{pkg.label}</p>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">{pkg.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[15px] font-black text-edu-primary">{pkg.price} so'm</p>
                <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <CheckCircle2 size={16} className="text-edu-primary" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={isLoading} className="rounded-2xl h-12 text-gray-400 font-bold">
            Yopish
          </Button>
        </div>
      </div>
    </Modal>
  );
}
