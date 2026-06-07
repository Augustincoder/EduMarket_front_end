import { Eye, Lock, FileText, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { cn } from '../../../../lib/utils';

function FileRow({ label, isProtected, onView }) {
  return (
    <button 
      className={cn(
        "w-full h-11 rounded-xl border flex items-center px-4 gap-3 transition-all active:scale-[0.98]",
        isProtected 
          ? "bg-amber-50/50 dark:bg-amber-500/5 border-amber-200/30 dark:border-amber-500/10" 
          : "bg-gray-50 dark:bg-white/5 border-black/[0.03] dark:border-white/[0.05]"
      )}
      onClick={onView}
    >
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
        isProtected ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600" : "bg-[#007AFF]/10 text-[#007AFF]"
      )}>
        <FileText size={16} />
      </div>
      <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300 truncate flex-1 text-left">{label}</span>
      <div className="text-[10px] font-black text-[#007AFF] uppercase tracking-wider">
        {isProtected ? 'Ko\'rish' : 'Ochish'}
      </div>
    </button>
  );
}

export function DeliveryPreviewCard({ delivery, task, isClient, onApprovePreview, onLeaveReview, isApproving, onViewFile }) {
  if (!delivery) return null;

  const isFullRevealed = !!delivery.fullRevealedAt;

  return (
    <Card className="border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-[#1C1C1E] shadow-ios rounded-[28px] overflow-hidden">
      <CardContent className="p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[14px] font-black text-gray-900 dark:text-white leading-tight tracking-tight">Vazifa natijasi</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {new Date(delivery.submittedAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          {isFullRevealed ? (
            <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-500/10 tracking-widest uppercase">
              Ochilgan
            </span>
          ) : (
            <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full border border-amber-500/10 tracking-widest uppercase animate-pulse">
              Himoyalangan
            </span>
          )}
        </div>

        {/* Freelancer's delivery note */}
        {delivery.previewNote && (
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-black/[0.02] dark:border-white/0.02">
            <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium italic">
              "{delivery.previewNote}"
            </p>
          </div>
        )}

        {/* Files Section */}
        <div className="space-y-5">
          {/* Preview Files */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] px-1 flex items-center gap-2">
              <Eye size={12} /> Ko'rish fayllari ({delivery.previewFileIds?.length || 0})
            </p>
            <div className="grid gap-2">
              {delivery.previewFileIds?.map((fileId, idx) => (
                <FileRow
                  key={fileId}
                  label={`Preview fayl #${idx + 1}`}
                  isProtected={isClient && !isFullRevealed}
                  onView={() => onViewFile(fileId)}
                />
              ))}
            </div>
          </div>

          {/* Full Files */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] px-1 flex items-center gap-2">
              <Lock size={12} /> To'liq fayllar ({delivery.fullFileIds?.length || 0})
            </p>
            
            {isClient && !isFullRevealed ? (
              <div className="relative rounded-2xl overflow-hidden">
                <div className="space-y-2 select-none pointer-events-none blur-[2px] opacity-30">
                  {delivery.fullFileIds?.map((_, idx) => (
                    <div key={idx} className="h-11 bg-gray-50 dark:bg-white/5 rounded-xl border border-black/[0.02] flex items-center px-4 gap-3">
                      <FileText size={16} className="text-gray-400" />
                      <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] z-10">
                  <p className="text-[12px] font-black text-gray-900 dark:text-white text-center px-8 leading-relaxed">
                    {task.status === 'COMPLETED' 
                      ? 'Baho qoldiring va fayllarni oching' 
                      : 'Natijani tasdiqlang va fayllarni oching'}
                  </p>
                  {task.status === 'COMPLETED' && (
                    <Button size="sm" variant="primary" onClick={onLeaveReview} className="text-[11px] px-5 h-9 rounded-xl font-black uppercase tracking-wider shadow-ios-primary">
                      Baho qoldirish ⭐
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                {delivery.fullFileIds?.map((fileId, idx) => (
                  <FileRow
                    key={fileId}
                    label={`To'liq fayl #${idx + 1}`}
                    onView={() => onViewFile(fileId)}
                  />
                ))}
                {isFullRevealed && (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 text-[11px] font-black bg-emerald-500/5 py-3 rounded-xl border border-emerald-500/10">
                    <ShieldCheck size={14} />
                    Hujjatlar ochildi
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Client Action: Approve Preview */}
        {isClient && task.status === 'PREVIEW_PENDING' && (
          <div className="pt-2">
            <Button
              fullWidth
              variant="primary"
              isLoading={isApproving}
              onClick={onApprovePreview}
              className="h-13 rounded-2xl font-black uppercase tracking-widest text-[13px] shadow-ios-primary"
            >
              ✅ Natijani tasdiqlash
            </Button>
            <p className="text-[11px] text-gray-400 font-medium text-center mt-3 px-2 leading-relaxed">
              Natija tasdiqlangandan so'ng to'liq fayllarni yuklab olishingiz mumkin bo'ladi.
            </p>
          </div>
        )}

        {/* Revision count indicator */}
        {(delivery.revisionCount || 0) > 0 && (
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-60">
            <AlertCircle size={12} />
            {delivery.revisionCount} marta tuzatildi
          </div>
        )}
      </CardContent>
    </Card>
  );
}

