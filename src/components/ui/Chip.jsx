// src/components/ui/Chip.jsx
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

import { hapticLight } from '../../lib/telegram';

export function FilterChip({ label, active, onClick }) {
  const handleClick = (e) => {
    hapticLight();
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'cursor-pointer active-bounce h-8 px-4 rounded-[12px] flex items-center justify-center transition-all flex-shrink-0 font-medium',
        active
          ? 'bg-gradient-to-r from-edu-primary to-edu-primary-d text-white border-transparent shadow-md shadow-edu-primary/20'
          : 'bg-edu-surface text-edu-text border border-edu-border hover:border-edu-primary/40 shadow-sm'
      )}
    >
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}

export function SkillChip({ label, onRemove }) {
  const handleRemove = (e) => {
    hapticLight();
    onRemove?.(e);
  };

  return (
    <div className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-edu-bg border border-edu-border text-edu-text flex-shrink-0">
      <span className="text-xs font-medium">{label}</span>
      {onRemove && (
        <button
          onClick={handleRemove}
          className="w-4 h-4 rounded-full bg-edu-border/50 hover:bg-edu-border flex items-center justify-center press-scale"
        >
          <X size={10} className="text-edu-muted" />
        </button>
      )}
    </div>
  );
}

export default FilterChip;
