// src/screens/shared/TaskDetail/components/RatingModal.jsx
import { useState, useEffect } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { StarRating } from '../../../../components/ui/StarRating';
import { TextArea } from '../../../../components/forms/TextArea';
import { Button } from '../../../../components/ui/Button';
import { hapticLight, hapticSuccess } from '../../../../lib/telegram';
import { AlertCircle } from 'lucide-react';

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
  const [quality, setQuality] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [deadlineScore, setDeadlineScore] = useState(0);

  const getRatingLabel = (val) => {
    switch (val) {
      case 1: return "Juda yomon 😞";
      case 2: return "Yomon 😕";
      case 3: return "O'rtacha 😐";
      case 4: return "Yaxshi 🙂";
      case 5: return "Ajoyib! 🤩";
      default: return "";
    }
  };

  useEffect(() => {
    if (rating === 5) {
      hapticSuccess();
    } else if (rating > 0) {
      hapticLight();
    }
  }, [rating]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tajribangizni baholang"
      footer={
        <div className="flex flex-col gap-3">
          <Button fullWidth variant="primary" onClick={onSubmit} isLoading={isLoading} className="h-14 rounded-xl shadow-ios-primary font-bold text-[15px]">
            ⭐ Review yuborish
          </Button>
          <button onClick={onClose} className="text-edu-muted font-bold text-xs uppercase tracking-widest py-2">
            O'tkazib yuborish — keyin yozaman
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 py-2">
        {/* Main Rating */}
        <div className="text-center space-y-2">
          <h3 className="text-[11px] font-bold text-edu-muted uppercase tracking-widest">Umumiy baho *</h3>
          <StarRating value={rating} onChange={(v) => { setRating(v); setRatingErrors(e => ({ ...e, rating: null })); }} size={42} />
          <div className="min-h-[24px]">
            {rating > 0 && <span className="inline-block bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-bold animate-fade-in">{getRatingLabel(rating)}</span>}
          </div>
          {ratingErrors?.rating && <p className="text-red-500 text-xs mt-1 font-medium">{ratingErrors.rating[0]}</p>}
        </div>

        {/* Dispute Prompt for low ratings */}
        {rating > 0 && rating <= 2 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div className="space-y-1.5 text-left">
              <p className="text-xs font-bold text-red-700">Muammo bo'ldimi?</p>
              <div className="flex gap-2">
                <button className="text-[10px] bg-red-500 text-white font-bold px-2 py-1 rounded">Dispute ochish</button>
                <button className="text-[10px] text-red-500 font-bold px-2 py-1">Yo'q, faqat past baho beraman</button>
              </div>
            </div>
          </div>
        )}

        {/* Sub-ratings (UX Showcase) */}
        <div className="bg-edu-bg rounded-xl p-4 border border-edu-border/50 space-y-3">
          <h3 className="text-[11px] font-bold text-edu-muted uppercase tracking-widest mb-2">Muayyan baholar (Ixtiyoriy)</h3>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-edu-text">Sifat</span>
            <StarRating value={quality} onChange={(v) => { setQuality(v); hapticLight(); }} size={24} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-edu-text">Muloqot</span>
            <StarRating value={communication} onChange={(v) => { setCommunication(v); hapticLight(); }} size={24} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-edu-text">Muddat</span>
            <StarRating value={deadlineScore} onChange={(v) => { setDeadlineScore(v); hapticLight(); }} size={24} />
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="space-y-1">
          <TextArea
            label="Sharhingiz *"
            placeholder="Qanday o'tdi? Nimalar yoqdi yoki yoqmadi?"
            value={ratingComment}
            onValueChange={(v) => { setRatingComment(v); setRatingErrors(e => ({ ...e, comment: null })); }}
            maxLength={500}
            minRows={4}
            error={ratingErrors?.comment?.[0]}
          />
          <div className="flex justify-between px-1">
            <p className="text-[10px] font-medium text-edu-muted">Kamida 5 ta belgi</p>
            <p className="text-[10px] font-medium text-edu-muted">{ratingComment.length}/500</p>
          </div>
        </div>

        <div className="bg-edu-primary/5 rounded-xl p-3 border border-edu-primary/10">
          <p className="text-[10px] text-edu-primary font-bold text-center">
            💡 Review 7 kun ichida majburiy. Keyin yozish imkonsiz bo'ladi.
          </p>
        </div>
      </div>
    </Modal>
  );
}
