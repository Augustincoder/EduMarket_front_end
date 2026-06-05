// src/screens/shared/TaskDetail/components/DisputeModal.jsx
import { Modal } from '../../../../components/ui/Modal';
import { TextArea } from '../../../../components/forms/TextArea';
import { Button } from '../../../../components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export function DisputeModal({
  isOpen,
  onClose,
  disputeReason,
  setDisputeReason,
  disputeErrors,
  setDisputeErrors,
  isLoading,
  onSubmit
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nizo ochish"
      footer={
        <Button fullWidth variant="danger" onClick={onSubmit} isLoading={isLoading}>
          Tasdiqlash va Nizo ochish
        </Button>
      }
    >
      <div className="py-2 space-y-3">
        <div className="bg-red-50 text-red-600 p-3 rounded-xl flex gap-2 items-start text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>Nizo ochilgandan so'ng ma'muriyat aralashadi va muammoni hal qiladi.</p>
        </div>
        <TextArea
          label="Sabab *"
          placeholder="Nima uchun nizo ochayotganingizni yozing..."
          value={disputeReason}
          onValueChange={(v) => { setDisputeReason(v); setDisputeErrors(e => ({ ...e, reason: null })); }}
          maxLength={1000}
          minRows={4}
          error={disputeErrors.reason?.[0]}
        />
      </div>
    </Modal>
  );
}
