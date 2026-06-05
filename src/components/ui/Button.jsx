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
  const baseClass = "inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-edu-primary disabled:opacity-50 disabled:pointer-events-none active:scale-95";
  
  const sizeClass = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }[size] || 'h-11 px-4 text-sm';

  const variantClass = {
    primary:   'bg-edu-primary text-white hover:bg-edu-primary-d shadow-btn',
    secondary: 'bg-edu-border/50 text-edu-text hover:bg-edu-border',
    outline:   'border-2 border-edu-primary text-edu-primary hover:bg-edu-primary/10',
    ghost:     'bg-transparent text-edu-text hover:bg-edu-surface',
    danger:    'bg-edu-urgent text-white hover:opacity-90',
    vip:       'bg-gradient-to-r from-edu-vip to-yellow-500 text-white shadow-vip border-none',
    accent:    'bg-edu-accent text-white hover:opacity-90 shadow-accent',
  }[variant] || 'bg-edu-primary text-white hover:bg-edu-primary-d';

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
