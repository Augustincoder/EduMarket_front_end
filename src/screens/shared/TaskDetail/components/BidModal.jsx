// src/screens/shared/TaskDetail/components/BidModal.jsx
import { BottomSheet } from '../../../../components/ui/BottomSheet';
import { TextInput } from '../../../../components/forms/TextInput';
import { TextArea } from '../../../../components/forms/TextArea';
import { Button } from '../../../../components/ui/Button';
import { formatPriceRange } from '../../../../lib/utils';

export function BidModal({
  isOpen,
  onClose,
  task,
  bidPrice,
  setBidPrice,
  bidMsg,
  setBidMsg,
  bidErrors,
  setBidErrors,
  isLoading,
  onSubmit
}) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Taklif berish">
      <div className="space-y-4 py-2">
        <div className="bg-edu-bg rounded-xl px-3 py-2 text-sm text-edu-muted">
          💡 Narx oralig'i: {formatPriceRange(task.priceMin, task.priceMax)}
        </div>
        <TextInput
          label="Narx (so'm)"
          type="number"
          placeholder={String(task.priceMin)}
          value={bidPrice}
          onValueChange={(v) => { setBidPrice(v); setBidErrors(e => ({ ...e, proposedPrice: null })); }}
          error={bidErrors.proposedPrice?.[0]}
        />
        <TextArea
          label="Xabar"
          placeholder="Tajribangiz va muddatingiz haqida yozing..."
          value={bidMsg}
          onValueChange={(v) => { setBidMsg(v); setBidErrors(e => ({ ...e, message: null })); }}
          maxLength={1000}
          error={bidErrors.message?.[0]}
        />
        <Button
          fullWidth size="lg" variant="primary"
          isLoading={isLoading}
          onClick={onSubmit}
        >
          Taklif yuborish
        </Button>
      </div>
    </BottomSheet>
  );
}
