import { AlertTriangle, CheckCircle } from 'lucide-react';
import { formatPrice } from '../../../../lib/utils';

export function TaskAlertsSection({ task }) {
  if (!task) return null;

  return (
    <div className="space-y-3 pb-24">
      {task.status === 'CANCELED' && (
        <div className="bg-red-500/5 text-red-500 p-5 rounded-xl flex items-start gap-3 border border-red-500/10">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[14px]">Vazifa bekor qilingan</p>
            <p className="text-[12px] opacity-70 font-medium">Ushbu vazifa buyurtmachi tomonidan bekor qilingan.</p>
          </div>
        </div>
      )}

      {task.status === 'DISPUTED' && (
        <div className="bg-amber-500/5 text-amber-600 p-5 rounded-xl flex items-start gap-3 border border-amber-500/10">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-bold text-[14px]">Nizo (Dispute) jarayonida</p>
            <p className="text-[12px] opacity-70 font-medium">Hozirda ma'muriyat vaziyatni o'rganmoqda.</p>
            {task.dispute?.reason && (
              <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl italic text-[11px] font-medium text-gray-500">
                "{task.dispute.reason}"
              </div>
            )}
          </div>
        </div>
      )}

      {task.bids?.[0] && task.status !== 'OPEN' && (
        <div className="bg-edu-primary/5 rounded-xl p-5 border border-edu-primary/10 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-edu-primary uppercase tracking-widest">Kelishilgan narx</p>
            <p className="text-[16px] font-bold text-edu-primary">{formatPrice(task.agreedPrice || task.bids[0].proposedPrice)} UZS</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-edu-primary/10 flex items-center justify-center text-edu-primary">
            <CheckCircle size={20} />
          </div>
        </div>
      )}
    </div>
  );
}
