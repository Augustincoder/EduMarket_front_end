// src/components/ui/Badge.jsx
import { STATUS_CONFIG, BADGE_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';

// Standardized base classes for all badges to ensure pixel-perfect consistency
const baseBadgeClass = "inline-flex items-center justify-center gap-1.5 font-bold rounded-full h-[22px] px-2.5 text-[10px] tracking-wide uppercase transition-all select-none border";

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;

  return (
    <span
      className={cn(baseBadgeClass)}
      style={{ 
        backgroundColor: `color-mix(in srgb, ${cfg.dot} 12%, transparent)`, 
        borderColor: `color-mix(in srgb, ${cfg.dot} 20%, transparent)`,
        color: cfg.dot 
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-[0_0_4px_rgba(0,0,0,0.1)]"
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}

export function UserBadge({ badge }) {
  const cfg = BADGE_CONFIG[badge] || BADGE_CONFIG.YANGI;
  return (
    <span
      className={cn(baseBadgeClass, "bg-edu-surface-2 text-edu-muted border-edu-border/50 font-bold")}
    >
      {cfg.label}
    </span>
  );
}

export function VipBadge() {
  return (
    <span
      className={cn(
        baseBadgeClass,
        "bg-gradient-to-r from-edu-vip/15 to-edu-vip/5 text-edu-vip border-edu-vip/30 font-bold"
      )}
    >
      <span className="text-[12px] -mt-0.5">👑</span>
      VIP
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span
      className={cn(
        baseBadgeClass,
        "bg-edu-primary/10 text-edu-primary border-edu-primary/30 font-bold"
      )}
    >
      <span className="text-[11px] font-bold -mt-0.5">✓</span>
      TASDIQLANGAN
    </span>
  );
}

export function UrgentBadge() {
  return (
    <span
      className={cn(
        baseBadgeClass,
        'bg-edu-urgent/10 text-edu-urgent border-edu-urgent/30 animate-pulse font-bold'
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-edu-urgent flex-shrink-0 shadow-[0_0_6px_rgba(255,59,48,0.4)]" />
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
