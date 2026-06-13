// src/components/ui/EmptyState.jsx
import { cn } from '../../lib/utils';
import Button from './Button';

export function EmptyState({ emoji = '📋', title, subtitle, action, actionLabel, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center px-6 py-16 animate-fade-in',
      className
    )}>
      <div className="w-[80px] h-[80px] rounded-xl bg-edu-surface-3 flex items-center justify-center text-[32px] mb-6 border border-edu-border relative shadow-sm">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-edu-primary/5 to-transparent pointer-events-none" />
        {emoji}
      </div>
      <h3 className="text-[20px] font-bold text-edu-text tracking-tight leading-tight mb-2 font-display">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[14px] text-edu-muted max-w-[280px] font-medium leading-relaxed">
          {subtitle}
        </p>
      )}
      {action && actionLabel && (
        <Button 
          variant="primary" 
          size="md" 
          className="mt-8 w-full max-w-[200px]" 
          onClick={action}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
