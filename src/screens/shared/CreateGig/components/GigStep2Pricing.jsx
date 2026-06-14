import { DollarSign, Clock, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import { TextInput } from '../../../../components/forms/TextInput';
import { Button } from '../../../../components/ui/Button';

export function GigStep2Pricing({ register, errors, priceVal, setStep, isPending }) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="bg-edu-surface rounded-xl p-4 border border-edu-border/30 shadow-sm flex flex-col gap-4">
        
        {/* Price Input */}
        <div>
          <TextInput
            type="number"
            label="XIZMAT NARXI (SO'M)"
            placeholder="Masalan: 50000"
            error={errors.price?.message}
            startContent={<DollarSign className="w-4 h-4 text-edu-primary shrink-0" />}
            endContent={<span className="text-[10px] font-bold text-edu-muted shrink-0">SO'M</span>}
            {...register('price')}
          />
          {priceVal && !isNaN(Number(priceVal)) && Number(priceVal) >= 5000 && (
            <p className="text-[11px] text-edu-primary font-bold mt-1.5 ml-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {new Intl.NumberFormat('uz-UZ').format(Number(priceVal))} so'm qabul qilinadi
            </p>
          )}
        </div>

        {/* Delivery Days */}
        <TextInput
          type="number"
          label="YETKAZIB BERISH MUDDATI (KUN)"
          placeholder="Masalan: 3"
          error={errors.deliveryDays?.message}
          startContent={<Clock className="w-4 h-4 text-edu-primary shrink-0" />}
          endContent={<span className="text-[10px] font-bold text-edu-muted shrink-0">KUN</span>}
          {...register('deliveryDays')}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setStep(1)}
          className="flex-1 h-12 rounded-xl font-bold active-bounce flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isPending}
          className="flex-1 h-12 rounded-xl font-bold active-bounce shadow-lg shadow-edu-primary/10 flex items-center justify-center gap-1.5"
        >
          Katalogga joylash <Sparkles className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
