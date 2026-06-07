// src/components/ui/Badge.jsx
import { STATUS_CONFIG, BADGE_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';

// Standardized base classes for all badges to ensure pixel-perfect consistency
const baseBadgeClass = "inline-flex items-center justify-center gap-1.5 font-black rounded-full h-[20px] px-2 text-[9px] tracking-[0.05em] uppercase transition-all select-none";

export function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;

  return (
    <span
      className={cn(baseBadgeClass, "shadow-premium-sm border border-black/[0.03] dark:border-white/5")}
      style={{ backgroundColor: `${cfg.bg}15`, color: cfg.dot }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}

export function UserBadge({ badge, size = 'sm' }) {
  const cfg = BADGE_CONFIG[badge] || BADGE_CONFIG.YANGI;
  return (
    <span
      className={cn(baseBadgeClass, "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-black/[0.03] dark:border-white/[0.05]")}
    >
      {cfg.label}
    </span>
  );
}

export function VipBadge({ size = 'sm' }) {
  return (
    <span
      className={cn(
        baseBadgeClass,
        "bg-[#AF8B3B]/10 text-[#AF8B3B] border border-[#AF8B3B]/20"
      )}
    >
      <span className="text-[11px] -mt-0.5">👑</span>
      VIP
    </span>
  );
}

export function VerifiedBadge({ size = 'sm' }) {
  return (
    <span
      className={cn(
        baseBadgeClass,
        "bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20"
      )}
    >
      <span className="text-[10px] font-black">✓</span>
      VERIFIED
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
