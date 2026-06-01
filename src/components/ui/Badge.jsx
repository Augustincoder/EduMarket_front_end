// src/components/ui/Badge.jsx
import { STATUS_CONFIG, BADGE_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';

// Standardized base classes for all badges to ensure pixel-perfect consistency
const baseBadgeClass = "inline-flex items-center justify-center gap-1.5 font-semibold rounded-md h-[24px] px-2 text-[11px] tracking-wide uppercase";

export function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;

  return (
    <span
      className={cn(baseBadgeClass)}
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}

export function UserBadge({ badge, isVip, size = 'sm' }) {
  const cfg = BADGE_CONFIG[badge] || BADGE_CONFIG.YANGI;
  return (
    <span
      className={cn(
        baseBadgeClass,
        isVip && 'ring-1 ring-edu-vip/40'
      )}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {isVip && <span>👑</span>}
      {cfg.label}
    </span>
  );
}

export function UrgentBadge({ size = 'sm' }) {
  return (
    <span
      className={cn(
        baseBadgeClass,
        'bg-red-500/10 text-red-500 animate-pulse'
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
      SHOSHILINCH
    </span>
  );
}

export function CategoryChip({ category, emoji, className }) {
  return (
    <span className={cn(
      baseBadgeClass,
      'bg-edu-surface text-edu-text border border-edu-border/50',
      className
    )}>
      {emoji && <span className="text-[12px]">{emoji}</span>}
      {category}
    </span>
  );
}
