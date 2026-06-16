// src/components/ui/Button.jsx
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
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
  isSuccess = false, // Design Spell: success state morphing
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
  // Design Spell: Magnetic Hover State
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current || disabled || isLoading || isSuccess) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = buttonRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.15, y: y * 0.15 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const baseClass = "relative inline-flex items-center justify-center gap-2 font-medium transition-colors duration-220 ease-in-out focus:outline-none focus-visible:ring-[3px] focus-visible:ring-edu-primary/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] active:duration-120 select-none overflow-hidden";

  const sizeClass = {
    sm: 'h-[36px] px-[14px] text-[13px] rounded-sm after:absolute after:inset-x-0 after:-inset-y-[4px]', // Touch target compensation
    md: 'h-[44px] px-[20px] text-[14px] rounded-md',
    lg: 'h-[52px] px-[28px] text-[15px] rounded-md',
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
    <motion.button
      ref={buttonRef}
      disabled={isLoading || isSuccess || disabled}
      className={cn(baseClass, sizeClass, variantClass, fullWidth && 'w-full', className)}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      {...props}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader2 size={18} className="animate-spin opacity-80" />
          </motion.div>
        ) : isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center text-white"
          >
            <Check size={20} strokeWidth={3} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 w-full"
          >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span className="truncate">{children}</span>
            {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default Button;
