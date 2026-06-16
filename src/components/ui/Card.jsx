// src/components/ui/Card.jsx
import { cn } from '../../lib/utils';
import { forwardRef } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { hapticLight, hapticMedium, hapticSuccess, hapticError, hapticWarning } from '../../lib/telegram';

const HAPTIC_MAP = {
  light:   hapticLight,
  medium:  hapticMedium,
  success: hapticSuccess,
  error:   hapticError,
  warning: hapticWarning,
};

export const Card = forwardRef(({ 
  className, 
  variant = 'base', 
  isPressable, 
  onClick, 
  haptic = 'light',
  tilt = false, // Design Spell: 3D Tilt
  glare = false, // Design Spell: Hover Shimmer Glare
  children,
  ...props 
}, ref) => {
  const Comp = isPressable || onClick ? motion.button : motion.div;
  
  const rotateX = useSpring(0, { stiffness: 400, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 400, damping: 30 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleClick = (e) => {
    if ((isPressable || onClick) && haptic && HAPTIC_MAP[haptic]) {
      HAPTIC_MAP[haptic]();
    }
    onClick?.(e);
  };

  const handleMouseMove = (e) => {
    if (!tilt && !glare) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (glare) {
      mouseX.set(x);
      mouseY.set(y);
    }
    
    if (tilt) {
      const width = rect.width;
      const height = rect.height;
      const xPct = x / width - 0.5;
      const yPct = y / height - 0.5;
      rotateX.set(yPct * -10); // Max 10 deg tilt
      rotateY.set(xPct * 10);
    }
  };

  const handleMouseLeave = () => {
    if (tilt) {
      rotateX.set(0);
      rotateY.set(0);
    }
  };

  const glareBackground = useMotionTemplate`
    radial-gradient(
      350px circle at ${mouseX}px ${mouseY}px,
      rgba(255, 255, 255, 0.4),
      transparent 80%
    )
  `;

  return (
    <Comp
      ref={ref}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: tilt ? rotateX : 0,
        rotateY: tilt ? rotateY : 0,
        transformPerspective: 1000,
      }}
      className={cn(
        "relative w-full block text-left overflow-hidden group",
        variant === 'elevated' ? 'card-elevated' : 'card-base',
        (isPressable || onClick) && "card-pressable cursor-pointer",
        className
      )}
      {...props}
    >
      {glare && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"
          style={{ background: glareBackground }}
        />
      )}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </Comp>
  );
});
Card.displayName = 'Card';

export const CardContent = forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("p-4", className)} {...props} />;
});
CardContent.displayName = 'CardContent';
