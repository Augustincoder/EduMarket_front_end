// src/components/forms/PriceRangeInput.jsx
import { TextInput } from './TextInput';

export function PriceRangeInput({
  label = 'Narx oralig\'i',
  registerMin,
  registerMax,
  errorMin,
  errorMax,
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-edu-muted text-sm font-medium">{label}</label>}
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          type="number"
          placeholder="Min (so'm)"
          error={errorMin}
          {...registerMin}
        />
        <TextInput
          type="number"
          placeholder="Max (so'm)"
          error={errorMax}
          {...registerMax}
        />
      </div>
    </div>
  );
}

export default PriceRangeInput;
