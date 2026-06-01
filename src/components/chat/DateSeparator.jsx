// src/components/chat/DateSeparator.jsx
import { isToday, isYesterday, format } from 'date-fns';
import { uz } from 'date-fns/locale';

export function DateSeparator({ date }) {
  const getLabel = () => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    if (isToday(d)) return 'Bugun';
    if (isYesterday(d)) return 'Kecha';
    
    return format(d, 'd MMMM', { locale: uz });
  };

  const label = getLabel();
  if (!label) return null;

  return (
    <div className="flex items-center gap-4 my-4 w-full">
      <div className="h-[1px] bg-edu-border grow" />
      <span className="text-[11px] font-semibold text-edu-muted bg-edu-bg px-2 rounded-full border border-edu-border uppercase tracking-wider">
        {label}
      </span>
      <div className="h-[1px] bg-edu-border grow" />
    </div>
  );
}

export default DateSeparator;
