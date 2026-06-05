// src/screens/shared/TaskDetail/components/RatingModal.jsx
import { Modal } from '../../../../components/ui/Modal';
import { StarRating } from '../../../../components/ui/StarRating';
import { TextArea } from '../../../../components/forms/TextArea';
import { Button } from '../../../../components/ui/Button';

export function RatingModal({
  isOpen,
  onClose,
  rating,
  setRating,
  ratingComment,
  setRatingComment,
  ratingErrors,
  setRatingErrors,
  isLoading,
  onSubmit
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bajaruvchini baholang"
      footer={
        <Button fullWidth variant="primary" onClick={onSubmit} isLoading={isLoading}>
          Yuborish
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="text-center">
          <StarRating value={rating} onChange={(v) => { setRating(v); setRatingErrors(e => ({ ...e, rating: null })); }} size={36} />
          {ratingErrors.rating && <p className="text-red-500 text-xs mt-1 font-medium">{ratingErrors.rating[0]}</p>}
          <p className="text-xs text-edu-muted mt-2 font-medium">(1 — 5 yulduz)</p>
        </div>
        <TextArea
          label="Fikr-mulohaza (sharh) *"
          placeholder="Fikringizni yozing (kamida 5 ta belgi)..."
          value={ratingComment}
          onValueChange={(v) => { setRatingComment(v); setRatingErrors(e => ({ ...e, comment: null })); }}
          maxLength={500}
          error={ratingErrors.comment?.[0]}
        />
      </div>
    </Modal>
  );
}
