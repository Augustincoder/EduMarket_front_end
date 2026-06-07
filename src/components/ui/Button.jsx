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
  const baseClass = "inline-flex items-center justify-center gap-2.5 font-bold transition-all rounded-[20px] focus:outline-none disabled:opacity-30 disabled:grayscale disabled:pointer-events-none active-spring";

  const sizeClass = {
    sm: 'h-10 px-5 text-[13px] tracking-ios-text rounded-xl',
    md: 'h-13 px-7 text-[15px] tracking-ios-text',
    lg: 'h-15 px-10 text-[17px] tracking-ios-display font-black rounded-[22px]',
  }[size] || 'h-13 px-7 text-[15px]';

  const variantClass = {
    primary:   'bg-edu-primary text-white shadow-premium-btn border-t border-white/20 active:shadow-none',
    secondary: 'bg-gray-100 dark:bg-white/5 text-edu-text border border-transparent hover:bg-gray-200 dark:hover:bg-white/10',
    outline:   'border-2 border-gray-200 dark:border-white/10 text-edu-text bg-transparent hover:bg-gray-50 dark:hover:bg-white/5',
    ghost:     'bg-transparent text-edu-text hover:bg-black/5 dark:hover:bg-white/5',
    danger:    'bg-edu-urgent text-white shadow-lg shadow-red-500/20 active:shadow-none',
    vip:       'bg-gradient-to-br from-[#AF8B3B] to-[#D4AF37] text-white shadow-vip border-t border-white/30',
    accent:    'bg-edu-accent text-white shadow-lg shadow-indigo-500/20 active:shadow-none',
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
      {isLoading && <Loader2 size={18} className="animate-spin" />}
      {!isLoading && icon && icon}
      {children}
      {!isLoading && iconRight && iconRight}
    </button>
  );
}

export default Button;
