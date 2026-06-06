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
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
    none: 'rounded-none',
  }[radius] || 'rounded-2xl';

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
        "w-full block bg-edu-surface shadow-ios border border-edu-border/30 overflow-hidden text-left",
        radiusClass === 'rounded-2xl' ? 'squircle' : radiusClass,
        (isPressable || onClick) && "transition-all active-spring cursor-pointer",
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
