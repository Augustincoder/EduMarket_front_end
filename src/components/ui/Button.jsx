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
 * EduMarket Button
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
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
  const baseClass = "relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-220 ease-in-out focus:outline-none focus-visible:ring-[3px] focus-visible:ring-edu-primary/40 disabled:opacity-45 disabled:pointer-events-none active:scale-[0.97] active:duration-120 select-none";

  const sizeClass = {
    sm: 'h-[36px] px-[14px] text-[13px] rounded-sm after:absolute after:inset-x-0 after:-inset-y-[4px]', // Touch target compensation
    md: 'h-[44px] px-[20px] text-[14px] rounded-md',
    lg: 'h-[52px] px-[28px] text-[15px] rounded-xl',
  }[size] || 'h-[44px] px-[20px] text-[14px] rounded-md';

  const variantClass = {
    primary:   'bg-edu-primary text-white font-semibold shadow-btn border-none hover:bg-edu-primary-h active:shadow-none',
    secondary: 'bg-edu-surface-2 text-edu-text font-medium border border-edu-border hover:bg-edu-surface-3 hover:border-edu-border-focus',
    ghost:     'bg-transparent text-edu-primary font-medium border-none hover:bg-edu-primary-xl',
    danger:    'bg-edu-urgent text-white font-semibold shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:bg-[#DC2626] active:shadow-none',
  }[variant] || 'bg-edu-primary text-white font-semibold shadow-btn border-none';

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
