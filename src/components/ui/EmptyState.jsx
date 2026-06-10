// src/components/ui/EmptyState.jsx
import { cn } from '../../lib/utils';
import Button from './Button';

export function EmptyState({ emoji = '📋', title, subtitle, action, actionLabel, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-24 px-10 animate-ios-pop',
      className
    )}>
      <div className="w-28 h-28 bg-edu-surface-2 rounded-lg flex items-center justify-center text-edu-accentxl mb-10 shadow-premium-sm border border-edu-border/30 relative">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-edu-primary/5 to-transparent pointer-events-none" />
        {emoji}
      </div>
      <h3 className="text-[22px] font-bold text-edu-text tracking-tight leading-tight mb-4 font-display">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[15px] text-edu-muted max-w-[280px] font-medium leading-relaxed opacity-80">
          {subtitle}
        </p>
      )}
      {action && actionLabel && (
        <Button 
          variant="primary" 
          size="lg" 
          className="mt-10 w-full max-w-[260px] shadow-premium-lg" 
          onClick={action}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
