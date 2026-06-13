import { BottomSheet } from '../../../../components/ui/BottomSheet';
import { TextInput } from '../../../../components/forms/TextInput';
import { TextArea } from '../../../../components/forms/TextArea';
import { Button } from '../../../../components/ui/Button';
import { formatPriceRange } from '../../../../lib/utils';
import { UploadCloud, Calendar } from 'lucide-react';
import { useState } from 'react';

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
  // Local state for UI showcasing
  const [deliveryDate, setDeliveryDate] = useState('');

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Taklif yuborish">
      <div className="space-y-5 py-2">
        {/* Client Budget Context */}
        <div className="bg-edu-primary/5 border border-edu-primary/10 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-edu-primary uppercase tracking-widest mb-0.5">Mijoz Byudjeti</p>
            <p className="text-sm font-bold text-edu-text">{formatPriceRange(task?.priceMin, task?.priceMax)} so'm</p>
          </div>
          <div className="text-2xl">💰</div>
        </div>

        {/* Price Input */}
        <div className="space-y-1">
          <TextInput
            label="Taklifingiz (so'm) *"
            type="number"
            placeholder={String(task?.priceMin || '')}
            value={bidPrice}
            onValueChange={(v) => { setBidPrice(v); setBidErrors(e => ({ ...e, proposedPrice: null })); }}
            error={bidErrors?.proposedPrice?.[0]}
          />
          <p className="text-[11px] text-edu-muted px-1 mt-1">Platforma xizmat haqi (10%) ushlanib qoladi</p>
        </div>

        {/* Delivery Date (UX Showcase) */}
        <div className="space-y-1">
          <label className="text-[13px] font-bold text-edu-text px-1 block mb-1">Qachon topshirasiz?</label>
          <div className="relative">
            <input
              type="datetime-local"
              className="w-full bg-edu-bg border border-edu-border/40 rounded-xl px-4 py-3.5 pl-11 text-edu-text text-sm font-medium outline-none focus:border-edu-primary focus:ring-1 focus:ring-edu-primary/50 transition-all"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-edu-muted" size={18} />
          </div>
        </div>

        {/* Message Input */}
        <TextArea
          label="Xabar (Cover Letter) *"
          placeholder="Nega aynan siz bu vazifaga mos ekansiz? Tajribangiz haqida yozing..."
          value={bidMsg}
          onValueChange={(v) => { setBidMsg(v); setBidErrors(e => ({ ...e, message: null })); }}
          maxLength={1000}
          minRows={4}
          error={bidErrors?.message?.[0]}
        />

        {/* Portfolio Attachment (UX Showcase) */}
        <div className="space-y-1">
          <label className="text-[13px] font-bold text-edu-text px-1 block mb-1">Portfolio yoki Namuna (Ixtiyoriy)</label>
          <div className="w-full h-14 bg-edu-bg border border-dashed border-edu-border/50 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform">
            <UploadCloud size={18} className="text-edu-primary" />
            <span className="text-sm font-semibold text-edu-primary">Fayl biriktirish</span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            fullWidth size="lg" variant="primary"
            isLoading={isLoading}
            onClick={onSubmit}
            className="h-14 rounded-xl text-[15px] font-bold shadow-ios-primary"
          >
            Taklifni yuborish
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
