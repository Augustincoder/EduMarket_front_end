// src/components/ui/Card.jsx
import { cn } from '../../lib/utils';
import { forwardRef } from 'react';
import { hapticLight, hapticMedium, hapticSuccess, hapticError, hapticWarning } from '../../lib/telegram';

const HAPTIC_MAP = {
  light:   hapticLight,
  medium:  hapticMedium,
  success: hapticSuccess,
  error:   hapticError,
  warning: hapticWarning,
};

export const Card = forwardRef(({ className, radius = 'xl', isPressable, onClick, haptic = 'light', ...props }, ref) => {
  const radiusClass = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'squircle',
    '2xl': 'rounded-[40px]',
    none: 'rounded-none',
  }[radius] || 'squircle';

  const Comp = isPressable || onClick ? 'button' : 'div';
  
  const handleClick = (e) => {
    if ((isPressable || onClick) && haptic && HAPTIC_MAP[haptic]) {
      HAPTIC_MAP[haptic]();
    }
    onClick?.(e);
  };

  return (
    <Comp
      ref={ref}
      onClick={handleClick}
      className={cn(
        "w-full block bg-edu-surface overflow-hidden text-left transition-all",
        radiusClass === 'squircle' ? 'premium-card' : cn(radiusClass, "shadow-premium-sm border border-edu-border/30"),
        (isPressable || onClick) && "active-spring cursor-pointer active:opacity-90",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

export const CardContent = forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("p-4", className)} {...props} />;
});
CardContent.displayName = 'CardContent';
