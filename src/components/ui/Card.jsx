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

export const Card = forwardRef(({ className, radius = 'xl', isPressable, onPress, haptic = 'light', ...props }, ref) => {
  const radiusClass = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
    none: 'rounded-none',
  }[radius] || 'rounded-2xl';

  const Comp = isPressable || onPress ? 'button' : 'div';
  
  const handleClick = (e) => {
    if ((isPressable || onPress) && haptic && HAPTIC_MAP[haptic]) {
      HAPTIC_MAP[haptic]();
    }
    onPress?.(e);
  };

  return (
    <Comp
      ref={ref}
      onClick={handleClick}
      className={cn(
        "w-full block bg-edu-surface shadow-card border border-edu-border/40 overflow-hidden text-left",
        radiusClass,
        (isPressable || onPress) && "transition-all active:scale-[0.98] cursor-pointer hover:border-edu-primary/30",
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
