// src/components/forms/TextArea.jsx
import { forwardRef } from 'react';
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
  const current = typeof props.value === 'string' ? props.value.length : 0;

  const handleTextareaChange = (e) => {
    if (onChange) onChange(e);
    if (onValueChange) onValueChange(e.target.value);
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      {label && (
        <label htmlFor={props.id || props.name} className="text-[11px] font-bold text-edu-muted uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <div className={cn(
        "relative flex bg-edu-bg border border-edu-border rounded-[22px] px-4 py-3 transition-all duration-300",
        "focus-within:bg-white dark:focus-within:bg-white/10 focus-within:ring-[5px] focus-within:ring-edu-primary/10 focus-within:border-edu-primary/30",
        error && "border-red-500/50 focus-within:border-red-500 focus-within:ring-red-500/10"
      )}>
        <textarea
          ref={ref}
          id={props.id || props.name}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={minRows}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id || props.name}-error` : undefined}
          className="w-full bg-transparent text-edu-text text-[15px] font-bold outline-none border-none p-0 focus:ring-0 resize-none placeholder:text-gray-400/80 placeholder:font-medium"
          onChange={handleTextareaChange}
          {...props}
        />
      </div>
      {maxLength && (
        <span className="text-[10px] font-bold text-gray-400 text-right mt-0.5 px-1" aria-hidden="true">
          {current}/{maxLength}
        </span>
      )}
      {error && (
        <span id={`${props.id || props.name}-error`} className="text-red-500 text-[11px] font-bold mt-1 px-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';
export default TextArea;
