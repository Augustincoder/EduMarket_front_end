// src/components/ui/Badge.jsx
import { STATUS_CONFIG, BADGE_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';

// Standardized base classes for all badges to ensure pixel-perfect consistency
const baseBadgeClass = "inline-flex items-center justify-center gap-[5px] font-bold rounded-full h-[22px] px-2 text-[10px] tracking-[0.04em] uppercase transition-all select-none";

export function StatusBadge({ status, className }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;

  return (
    <span
      className={cn(baseBadgeClass, className)}
      style={{ 
        backgroundColor: cfg.bg, 
        color: cfg.text 
      }}
    >
      <span
        className="w-[6px] h-[6px] rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}

export function UserBadge({ badge, className }) {
  const cfg = BADGE_CONFIG[badge] || BADGE_CONFIG.YANGI;
  return (
    <span
      className={cn(baseBadgeClass, className)}
      style={{ 
        backgroundColor: cfg.bg, 
        color: cfg.color 
      }}
    >
      {cfg.label}
    </span>
  );
}

export function VipBadge({ className }) {
  return (
    <span
      className={cn(
        baseBadgeClass,
        "bg-edu-vip-l text-edu-vip",
        className
      )}
    >
      <span className="text-[12px] -mt-0.5">👑</span>
      VIP
    </span>
  );
}

export function VerifiedBadge({ className }) {
  return (
    <span
      className={cn(
        baseBadgeClass,
        "bg-edu-primary-l text-edu-primary",
        className
      )}
    >
      <span className="text-[11px] font-bold -mt-0.5">✓</span>
      TASDIQLANGAN
    </span>
  );
}

export function UrgentBadge({ className }) {
  return (
    <span
      className={cn(
        baseBadgeClass,
        'bg-edu-urgent-l text-edu-urgent animate-pulse',
        className
      )}
    >
      <span className="w-[6px] h-[6px] rounded-full bg-edu-urgent flex-shrink-0" />
      SHOSHILINCH
    </span>
  );
}

export function CategoryChip({ category, emoji, className }) {
  return (
    <span className={cn(
      baseBadgeClass,
      'bg-edu-surface text-edu-text border border-edu-border',
      className
    )}>
      {emoji && <span className="text-[12px]">{emoji}</span>}
      {category}
    </span>
  );
}
