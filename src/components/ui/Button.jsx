// src/components/ui/Button.jsx
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { hapticLight, hapticMedium, hapticSuccess, hapticError, hapticWarning } from '../../lib/telegram';

const HAPTIC_MAP = {
  light:   hapticLight,
  medium:  hapticMedium,
  success: hapticSuccess,
  error:   hapticError,
  warning: hapticWarning,
};

/**
 * EduMarket Button (Radix/Native Tailwind)
 * variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'vip' | 'accent'
 * size:    'sm' | 'md' | 'lg'
 * haptic:  'light' | 'medium' | 'success' | 'error' | 'warning' | null
 */
export function Button({
  variant   = 'primary',
  size      = 'md',
  isLoading = false,
  haptic    = 'light',
  icon,
  iconRight,
  fullWidth = false,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}) {
  const baseClass = "inline-flex items-center justify-center gap-2.5 font-bold transition-all focus:outline-none focus-visible:ring-[3px] focus-visible:ring-edu-primary/40 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none active-spring select-none";

  const sizeClass = {
    sm: 'h-10 px-5 text-[13px] tracking-ios-text rounded-sm',
    md: 'h-12 px-7 text-[15px] tracking-ios-text rounded-md',
    lg: 'h-14 px-10 text-[17px] tracking-ios-display font-bold rounded-lg',
  }[size] || 'h-12 px-7 text-[15px] rounded-md';

  const variantClass = {
    primary:   'bg-edu-primary text-white shadow-premium-btn border-t border-white/20 active:shadow-none',
    secondary: 'bg-edu-surface-2 text-edu-text border border-edu-border hover:bg-edu-border/20 dark:hover:bg-white/10',
    outline:   'border-2 border-edu-border text-edu-text bg-transparent hover:bg-edu-border/10 dark:hover:bg-white/5',
    ghost:     'bg-transparent text-edu-text hover:bg-edu-border/10 dark:hover:bg-white/5',
    danger:    'bg-edu-urgent text-white shadow-lg shadow-red-500/10 border-t border-white/10 active:shadow-none',
    vip:       'bg-gradient-to-br from-edu-vip to-[#D4AF37] text-white shadow-vip border-t border-white/30',
    accent:    'bg-edu-accent text-white shadow-lg shadow-indigo-500/20 border-t border-white/10 active:shadow-none',
  }[variant] || 'bg-edu-primary text-white shadow-premium-btn';

  const handleClick = (e) => {
    if (haptic && HAPTIC_MAP[haptic]) {
      HAPTIC_MAP[haptic]();
    }
    onClick?.(e);
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={cn(baseClass, sizeClass, variantClass, fullWidth && 'w-full', className)}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin opacity-70" />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="truncate">{children}</span>
          {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  );
}

export default Button;
