// src/components/chat/ReviewBanner.jsx
import { Check, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export function ReviewBanner({ isClient, onAccept, onReject, isLoading }) {
  return (
    <div className="sticky top-0 z-20 w-full bg-orange-500/10 border-b border-orange-500/20 px-4 py-3 flex items-center justify-between gap-3 shadow-sm animate-fade-in">
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-amber-900">Vazifa tekshiruvda</p>
          <p className="text-[10px] text-amber-700 truncate">
            {isClient
              ? 'Freelancer ishni topshirdi. Natijani tekshiring.'
              : 'Mijoz ishni tekshirmoqda. Tez orada javob beradi.'}
          </p>
        </div>
      </div>

      {isClient && (
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onClick={onReject}
            isLoading={isLoading}
            className="h-8 min-w-[70px] text-2xs font-bold"
            startContent={<RotateCcw size={12} />}
          >
            Qaytarish
          </Button>
          <Button
            size="sm"
            color="success"
            onClick={onAccept}
            isLoading={isLoading}
            className="h-8 min-w-[70px] text-2xs font-bold text-white bg-edu-primary"
            startContent={<Check size={12} />}
          >
            Qabul
          </Button>
        </div>
      )}
    </div>
  );
}

export default ReviewBanner;
