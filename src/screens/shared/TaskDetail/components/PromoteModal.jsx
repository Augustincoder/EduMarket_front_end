// src/screens/shared/TaskDetail/components/PromoteModal.jsx
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Sparkles, Crown, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/Card';

export function PromoteModal({
  isOpen,
  onClose,
  isLoading,
  onSubmit
}) {
  const PACKAGES = [
    { type: 'PIN_12H', label: '12 soatga mahkamlash', price: '5,000', icon: <ArrowUp size={20} className="text-blue-500" /> },
    { type: 'PIN_24H', label: '24 soatga mahkamlash', price: '9,000', icon: <Crown size={20} className="text-amber-500" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vazifani ko'tarish"
    >
      <div className="py-2 space-y-4">
        <p className="text-sm text-edu-muted leading-relaxed">
          Vazifangizni ro'yxatning eng yuqorisiga chiqaring va ko'proq mutaxassislarni jalb qiling.
        </p>

        <div className="space-y-2">
          {PACKAGES.map((pkg) => (
            <Card
              key={pkg.type}
              isPressable
              onClick={() => onSubmit(pkg.type)}
              className="border border-edu-border/50 hover:border-edu-primary/50 transition-all active:scale-[0.98]"
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-edu-bg flex items-center justify-center shrink-0">
                  {pkg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-edu-text">{pkg.label}</p>
                  <p className="text-xs text-edu-muted">{pkg.price} so'm</p>
                </div>
                <Sparkles size={16} className="text-edu-primary opacity-40" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Button variant="ghost" fullWidth onClick={onClose} disabled={isLoading}>
          Bekor qilish
        </Button>
      </div>
    </Modal>
  );
}
