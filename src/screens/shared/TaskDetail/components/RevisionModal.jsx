// src/screens/shared/TaskDetail/components/RevisionModal.jsx
import { Modal } from '../../../../components/ui/Modal';
import { TextArea } from '../../../../components/forms/TextArea';
import { Button } from '../../../../components/ui/Button';

export function RevisionModal({
  isOpen,
  onClose,
  revisionNote,
  setRevisionNote,
  revisionErrors,
  setRevisionErrors,
  isLoading,
  onSubmit
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Qayta ishlashga yuborish"
      footer={
        <Button fullWidth variant="primary" onClick={onSubmit} isLoading={isLoading}>
          Yuborish
        </Button>
      }
    >
      <div className="py-2">
        <TextArea
          label="Izoh (qayta ishlash sababi) *"
          placeholder="Nimalarni to'g'irlash kerakligini batafsil yozing..."
          value={revisionNote}
          onValueChange={(v) => { setRevisionNote(v); setRevisionErrors(e => ({ ...e, note: null })); }}
          maxLength={1000}
          minRows={4}
          error={revisionErrors.note?.[0]}
        />
      </div>
    </Modal>
  );
}
