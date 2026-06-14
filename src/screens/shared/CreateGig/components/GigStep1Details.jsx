import { Sparkles, ArrowRight } from 'lucide-react';
import { TextInput } from '../../../../components/forms/TextInput';
import { TextArea } from '../../../../components/forms/TextArea';
import { Button } from '../../../../components/ui/Button';

export function GigStep1Details({ register, errors, titleVal, descVal, handleNextStep }) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="bg-edu-surface rounded-xl p-4 border border-edu-border/30 shadow-sm flex flex-col gap-4">
        {/* Title */}
        <TextInput
          label="XIZMAT SARLAVHASI"
          placeholder="Masalan: Professional tarjima inglizchadan o'zbekchaga"
          error={errors.title?.message}
          maxLength={100}
          currentLength={titleVal.length}
          startContent={<Sparkles className="w-4 h-4 text-edu-primary shrink-0" />}
          {...register('title')}
        />

        {/* Description */}
        <TextArea
          label="XIZMAT TAVSIFI"
          placeholder="Freelancer sifatida nimalarni taklif qilishingizni, tajribangizni va buyurtmachi nimalar olishini batafsil tushuntiring..."
          error={errors.description?.message}
          maxLength={1000}
          value={descVal}
          minRows={6}
          {...register('description')}
        />
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={handleNextStep}
        className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-1.5 active-bounce mt-2 shadow-lg shadow-edu-primary/10"
      >
        Keyingi bosqich <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
