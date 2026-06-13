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

/**
 * EduMarket Card
 * variant: 'base' | 'elevated'
 */
export const Card = forwardRef(({ className, variant = 'base', isPressable, onClick, haptic = 'light', ...props }, ref) => {
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
        "w-full block text-left",
        variant === 'elevated' ? 'card-elevated' : 'card-base',
        (isPressable || onClick) && "card-pressable cursor-pointer",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

export const CardContent = forwardRef(({ className, ...props }, ref) => {
  // default padding is 16px (p-4)
  return <div ref={ref} className={cn("p-4", className)} {...props} />;
});
CardContent.displayName = 'CardContent';
