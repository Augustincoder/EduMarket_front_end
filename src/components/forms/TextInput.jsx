// src/components/forms/TextInput.jsx
import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const TextInput = forwardRef(({
  label,
  placeholder,
  error,
  hideErrorMessage,
  maxLength,
  currentLength,
  type = 'text',
  className,
  containerClassName,
  startContent,
  endContent,
  onValueChange,
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e) => {
    if (onChange) onChange(e);
    if (onValueChange) onValueChange(e.target.value);
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      {label && (
        <motion.label 
          htmlFor={props.id || props.name} 
          animate={{ y: isFocused ? -2 : 0, color: isFocused ? 'var(--edu-primary)' : 'var(--edu-muted)' }}
          className="text-xs font-bold px-1 origin-left"
        >
          {label}
        </motion.label>
      )}
      <motion.div 
        animate={
          error 
            ? { x: [-8, 8, -6, 6, -3, 3, 0], scale: 1, boxShadow: "0 8px 24px rgba(239, 68, 68, 0.2)" } 
            : {
                scale: isFocused ? 1.015 : 1,
                boxShadow: isFocused ? "0 8px 24px rgba(16, 185, 129, 0.12)" : "0 2px 4px rgba(0, 0, 0, 0)",
              }
        }
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className={cn(
          "relative flex items-center bg-edu-surface-2 border-[1.5px] border-edu-border rounded-xl px-4 h-[48px] transition-colors duration-220 z-10",
          "focus-within:bg-edu-surface",
          error && "border-edu-urgent focus-within:border-edu-urgent",
          containerClassName
        )}
      >
        {isFocused && !error && (
          <motion.div 
            className="absolute inset-[-1.5px] rounded-xl bg-gradient-to-r from-edu-primary via-purple-500 to-edu-primary bg-[length:200%_auto] z-[-1]"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}
        {startContent && <div className="mr-3 shrink-0 flex items-center justify-center text-edu-muted transition-colors duration-220">{startContent}</div>}
        <input
          ref={ref}
          id={props.id || props.name}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id || props.name}-error` : undefined}
          className="w-full bg-transparent text-edu-text text-[14px] font-normal outline-none border-none p-0 focus:ring-0 placeholder:text-edu-muted-2"
          onChange={handleInputChange}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...props}
        />
        {endContent && <div className="ml-3 shrink-0 flex items-center justify-center text-edu-muted transition-colors duration-220">{endContent}</div>}
        {maxLength && (
          <span className="text-[10px] font-bold text-edu-muted shrink-0 ml-3" aria-hidden="true">
            {currentLength ?? 0}/{maxLength}
          </span>
        )}
      </motion.div>
      {error && typeof error === 'string' && !hideErrorMessage && (
        <span id={`${props.id || props.name}-error`} className="text-edu-urgent text-xs mt-1 px-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

TextInput.displayName = 'TextInput';
export default TextInput;
