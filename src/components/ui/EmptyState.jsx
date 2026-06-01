// src/components/ui/EmptyState.jsx
import { cn } from '../../lib/utils';
import Button from './Button';

export function EmptyState({ emoji = '📋', title, subtitle, action, actionLabel, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-6 gap-3',
      className
    )}>
      <div className="text-5xl mb-1">{emoji}</div>
      <h3 className="text-lg font-bold text-edu-text font-display">{title}</h3>
      {subtitle && <p className="text-sm text-edu-muted max-w-[280px] leading-relaxed mt-1">{subtitle}</p>}
      {action && actionLabel && (
        <Button variant="primary" size="md" className="mt-4 w-full max-w-[220px] shadow-btn font-bold rounded-2xl" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
