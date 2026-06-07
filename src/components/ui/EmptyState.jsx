// src/components/ui/EmptyState.jsx
import { cn } from '../../lib/utils';
import Button from './Button';

export function EmptyState({ emoji = '📋', title, subtitle, action, actionLabel, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-20 px-8 animate-in fade-in duration-700',
      className
    )}>
      <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-5xl mb-8 shadow-inner border border-black/[0.03] dark:border-white/5">
        {emoji}
      </div>
      <h3 className="text-[20px] font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-3">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[14px] text-gray-400 dark:text-gray-500 max-w-[260px] font-medium leading-relaxed">
          {subtitle}
        </p>
      )}
      {action && actionLabel && (
        <Button 
          variant="primary" 
          size="lg" 
          className="mt-10 w-full max-w-[240px]" 
          onClick={action}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
