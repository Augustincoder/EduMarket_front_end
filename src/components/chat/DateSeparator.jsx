// src/components/chat/DateSeparator.jsx
import { isToday, isYesterday, format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center gap-4 my-5 w-full justify-center sticky top-2 z-10"
    >
      <span className="text-[11px] font-bold text-edu-text/80 bg-edu-surface/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-edu-border/50 uppercase tracking-widest">
        {label}
      </span>
    </motion.div>
  );
}

export default DateSeparator;
