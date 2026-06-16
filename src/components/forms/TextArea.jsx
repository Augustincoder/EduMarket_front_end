// src/components/forms/TextArea.jsx
import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const TextArea = forwardRef(({
  label,
  placeholder,
  error,
  maxLength,
  minRows = 3,
  className,
  onValueChange,
  onChange,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const current = typeof props.value === 'string' ? props.value.length : 0;

  const handleTextareaChange = (e) => {
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
        animate={{
          scale: isFocused ? 1.015 : 1,
          boxShadow: isFocused && !error ? "0 8px 24px rgba(16, 185, 129, 0.12)" : isFocused && error ? "0 8px 24px rgba(239, 68, 68, 0.12)" : "0 2px 4px rgba(0, 0, 0, 0)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "relative flex bg-edu-surface-2 border-[1.5px] border-edu-border rounded-xl px-4 py-3 transition-colors duration-220 z-10",
          "focus-within:bg-edu-surface",
          error && "border-edu-urgent focus-within:border-edu-urgent"
        )}
      >
        {isFocused && !error && (
          <motion.div 
            className="absolute inset-[-1.5px] rounded-xl bg-gradient-to-r from-edu-primary via-purple-500 to-edu-primary bg-[length:200%_auto] z-[-1]"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}
        <textarea
          ref={ref}
          id={props.id || props.name}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={minRows}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id || props.name}-error` : undefined}
          className="w-full bg-transparent text-edu-text text-[14px] font-normal outline-none border-none p-0 focus:ring-0 resize-none placeholder:text-edu-muted-2"
          onChange={handleTextareaChange}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          {...props}
        />
      </motion.div>
      {maxLength && (
        <span className="text-[10px] font-bold text-edu-muted text-right mt-0.5 px-1" aria-hidden="true">
          {current}/{maxLength}
        </span>
      )}
      {error && (
        <span id={`${props.id || props.name}-error`} className="text-edu-urgent text-xs mt-1 px-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';
export default TextArea;
