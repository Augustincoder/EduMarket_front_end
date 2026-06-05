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
  const baseClass = "inline-flex items-center justify-center gap-2 font-bold transition-all rounded-2xl focus:outline-none disabled:opacity-40 disabled:pointer-events-none active-spring";

  const sizeClass = {
    sm: 'h-9 px-4 text-[13px] tracking-ios-text',
    md: 'h-12 px-6 text-[15px] tracking-ios-text',
    lg: 'h-14 px-8 text-[17px] tracking-ios-display font-black',
  }[size] || 'h-12 px-6 text-[15px]';

  const variantClass = {
    primary:   'bg-edu-primary text-white shadow-btn border border-white/10',
    secondary: 'bg-edu-surface-2 text-edu-text border border-edu-border/50',
    outline:   'border-2 border-edu-primary text-edu-primary bg-transparent',
    ghost:     'bg-transparent text-edu-text',
    danger:    'bg-edu-urgent text-white shadow-lg shadow-red-500/20',
    vip:       'bg-gradient-to-br from-edu-vip to-[#D4AF37] text-white shadow-vip border border-white/20',
    accent:    'bg-edu-accent text-white shadow-lg shadow-indigo-500/20',
  }[variant] || 'bg-edu-primary text-white shadow-btn';

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
      {isLoading && <Loader2 size={18} className="animate-spin" />}
      {!isLoading && icon && icon}
      {children}
      {!isLoading && iconRight && iconRight}
    </button>
  );
}

export default Button;
