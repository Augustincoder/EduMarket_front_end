import { useState } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { TextArea } from '../../../../components/forms/TextArea';
import { Button } from '../../../../components/ui/Button';
import { ShieldAlert } from 'lucide-react';
import { FileUpload } from '../../../../components/forms/FileUpload';

const REASONS = [
  { id: 'NON_DELIVERY', label: 'Vazifa umuman bajarilmadi' },
  { id: 'POOR_QUALITY', label: 'Sifat talabga javob bermaydi' },
  { id: 'COMMUNICATION', label: 'Muloqotda muammolar' },
  { id: 'OTHER', label: 'Boshqa sabab' }
];

export function DisputeModal({
  isOpen,
  onClose,
  disputeReason,
  setDisputeReason,
  disputeDescription,
  setDisputeDescription,
  disputeFiles,
  setDisputeFiles,
  disputeErrors,
  setDisputeErrors,
  isLoading,
  onSubmit
}) {
  const [activeReason, setActiveReason] = useState(disputeReason || '');

  const handleReasonSelect = (id) => {
    setActiveReason(id);
    setDisputeReason(id);
    setDisputeErrors((prev) => ({ ...prev, reason: null }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mojarolar markazi (Dispute)"
      footer={
        <Button fullWidth variant="danger" onClick={onSubmit} isLoading={isLoading}>
          Nizoni rasmiylashtirish
        </Button>
      }
    >
      <div className="py-2 space-y-5">
        
        {/* Warning Banner */}
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-xl flex gap-3 items-start">
          <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-red-700 dark:text-red-400 mb-1">Diqqat qiling!</p>
            <p className="text-red-600 dark:text-red-300 text-xs">
              Asossiz nizo ochish reytingingizga jiddiy ta'sir qiladi. Iltimos, barcha dalillarni aniq ko'rsating.
            </p>
          </div>
        </div>

        {/* Reason Selection */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-edu-text block">Nima bo'ldi? *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {REASONS.map((r) => (
              <button
                key={r.id}
                onClick={() => handleReasonSelect(r.id)}
                className={`text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  activeReason === r.id
                    ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 shadow-sm'
                    : 'border-edu-border bg-edu-surface text-edu-muted hover:border-red-200 hover:bg-red-50/50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {disputeErrors.reason && <p className="text-xs text-red-500 font-bold mt-1">{disputeErrors.reason[0]}</p>}
        </div>

        {/* Detailed Description */}
        <TextArea
          label="Batafsil izoh (kamida 50 ta harf) *"
          placeholder="Muammoni batafsil tushuntirib bering..."
          value={disputeDescription || ''}
          onValueChange={(v) => { 
            setDisputeDescription(v); 
            setDisputeErrors(e => ({ ...e, description: null })); 
          }}
          maxLength={2000}
          currentLength={disputeDescription?.length || 0}
          minRows={5}
          error={disputeErrors.description?.[0]}
        />

        {/* Evidence Files */}
        <div className="space-y-2">
          <FileUpload 
            label="Dalillar (Skrinshot, yozishmalar va hk.)"
            value={disputeFiles || []}
            onChange={setDisputeFiles}
            maxFiles={5}
          />
        </div>

      </div>
    </Modal>
  );
}
