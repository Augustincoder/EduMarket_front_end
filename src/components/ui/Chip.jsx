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
        'cursor-pointer active:scale-[0.97] transition-transform duration-[120ms] h-9 px-5 rounded-[16px] flex items-center justify-center transition-all flex-shrink-0 border',
        active
          ? 'bg-edu-primary text-white border-transparent shadow-lg shadow-edu-primary/25'
          : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-black/[0.03] dark:border-white/[0.05] shadow-premium-sm hover:border-edu-primary/30'
      )}
    >
      <span className="text-[12px] font-bold tracking-tight">{label}</span>
    </button>
  );
}

export function SkillChip({ label, onRemove }) {
  const handleRemove = (e) => {
    hapticLight();
    onRemove?.(e);
  };

  return (
    <div className="inline-flex items-center gap-2 h-8 px-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-edu-border text-gray-700 dark:text-gray-200 flex-shrink-0">
      <span className="text-[11px] font-bold">{label}</span>
      {onRemove && (
        <button
          onClick={handleRemove}
          className="w-4.5 h-4.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={10} strokeWidth={3} className="text-gray-500" />
        </button>
      )}
    </div>
  );
}

export default FilterChip;
