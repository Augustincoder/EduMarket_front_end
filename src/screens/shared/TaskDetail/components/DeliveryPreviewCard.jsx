import { Eye, Lock, FileText, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';

function FileRow({ fileId, label, isProtected }) {
  return (
    <div className={`h-10 rounded-xl border flex items-center px-3 gap-2 ${isProtected ? 'bg-amber-50 border-amber-200/50' : 'bg-edu-surface border-edu-border/30'}`}>
      <FileText className={`w-4 h-4 ${isProtected ? 'text-amber-500' : 'text-edu-primary'}`} />
      <span className="text-xs font-medium text-edu-text truncate flex-1">{label}</span>
      <a href={`https://pub-9fc1a116a1974e199a0fd81575e831bc.r2.dev/${fileId}`} target="_blank" rel="noreferrer" className="text-[10px] bg-edu-bg border border-edu-border/50 px-2 py-1 rounded-md text-edu-primary font-bold">
        {isProtected ? 'Ko\'rish' : 'Ochish'}
      </a>
    </div>
  );
}

export function DeliveryPreviewCard({ delivery, task, isClient, onApprovePreview, onLeaveReview, isApproving }) {
  if (!delivery) return null;

  const isFullRevealed = !!delivery.fullRevealedAt;

  return (
    <Card className="border-2 border-edu-primary/20 bg-gradient-to-br from-edu-primary/5 to-transparent shadow-lg">
      <CardContent className="p-4 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-edu-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-edu-primary" />
            </div>
            <div>
              <p className="text-xs font-black text-edu-text">Himoyalangan Yetkazib Berish</p>
              <p className="text-[10px] text-edu-muted">
                {new Date(delivery.submittedAt).toLocaleDateString('uz-UZ')}
              </p>
            </div>
          </div>
          {isFullRevealed ? (
            <span className="text-[10px] font-black bg-green-500/10 text-green-600 px-2 py-1 rounded-full border border-green-500/20">
              ✅ OCHILGAN
            </span>
          ) : (
            <span className="text-[10px] font-black bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full border border-amber-500/20">
              🔒 HIMOYALANGAN
            </span>
          )}
        </div>

        {/* Freelancer's delivery note */}
        {delivery.previewNote && (
          <div className="bg-edu-bg rounded-xl p-3 border border-edu-border/30">
            <p className="text-[10px] font-black text-edu-muted uppercase tracking-wider mb-1">
              Freelancer izohi
            </p>
            <p className="text-sm text-edu-text leading-relaxed italic">
              "{delivery.previewNote}"
            </p>
          </div>
        )}

        {/* Preview Files */}
        <div>
          <p className="text-[10px] font-black text-edu-muted uppercase tracking-wider mb-2 flex items-center gap-1">
            <Eye className="w-3 h-3" /> KO'RISH UCHUN FAYLLAR ({delivery.previewFileIds?.length || 0})
          </p>
          <div className="space-y-2">
            {delivery.previewFileIds?.map((fileId, idx) => (
              <FileRow
                key={fileId}
                fileId={fileId}
                label={`Ko'rish fayli #${idx + 1}`}
                isProtected={isClient} 
              />
            ))}
          </div>
        </div>

        {/* Full Files */}
        <div>
          <p className="text-[10px] font-black text-edu-muted uppercase tracking-wider mb-2 flex items-center gap-1">
            <Lock className="w-3 h-3" /> TO'LIQ FAYLLAR ({delivery.fullFileIds?.length || 0})
          </p>
          
          {isClient && !isFullRevealed ? (
            <div className="relative mt-2">
              <div className="space-y-2 select-none pointer-events-none blur-[3px] opacity-50">
                {delivery.fullFileIds?.map((_, idx) => (
                  <div key={idx} className="h-10 bg-edu-surface rounded-xl border border-edu-border/30 flex items-center px-3 gap-2">
                    <FileText className="w-4 h-4 text-edu-muted" />
                    <span className="text-xs text-edu-muted">████████████████</span>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-edu-bg/60 backdrop-blur-[2px] rounded-xl z-10">
                <Lock className="w-6 h-6 text-edu-primary" />
                <p className="text-[11px] font-bold text-edu-text text-center px-4 leading-tight">
                  {task.status === 'COMPLETED' 
                    ? 'Baho qoldiringiz — to\'liq fayllar shundan so\'ng ochiladi' 
                    : 'Ko\'rishni tasdiqlang — fayllar keyingi bosqichda ochiladi'}
                </p>
                {task.status === 'COMPLETED' && (
                  <Button size="sm" variant="primary" onClick={onLeaveReview} className="text-[10px] px-4 h-7 min-h-0 mt-1">
                    Baho qoldirish ⭐
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {delivery.fullFileIds?.map((fileId, idx) => (
                <FileRow
                  key={fileId}
                  fileId={fileId}
                  label={`To'liq fayl #${idx + 1}`}
                />
              ))}
              {isFullRevealed && (
                <div className="flex items-center gap-2 text-green-600 text-[11px] font-bold mt-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Fayllar muvaffaqiyatli ochildi
                </div>
              )}
            </div>
          )}
        </div>

        {/* Client Action: Approve Preview */}
        {isClient && task.status === 'PREVIEW_PENDING' && (
          <div className="space-y-2 pt-3 border-t border-edu-border/20">
            <p className="text-[11px] text-edu-muted font-medium text-center mb-1">
              Ko'rish fayllari talabga mos bo'lsa, tasdiqlang. 
            </p>
            <Button
              fullWidth
              variant="primary"
              isLoading={isApproving}
              onClick={onApprovePreview}
            >
              ✅ Ko'rinishni tasdiqlash
            </Button>
          </div>
        )}

        {/* Revision count indicator */}
        {(delivery.revisionCount || 0) > 0 && (
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-edu-muted font-bold pt-2">
            <AlertCircle className="w-3 h-3" />
            {delivery.revisionCount} marta qayta ishlandi
          </div>
        )}
      </CardContent>
    </Card>
  );
}
