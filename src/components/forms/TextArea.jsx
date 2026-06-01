// src/components/forms/TextArea.jsx
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const TextArea = forwardRef(({
  label,
  placeholder,
  error,
  maxLength,
  minRows = 3,
  maxRows = 6,
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
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-edu-muted text-sm font-medium">
          {label}
        </label>
      )}
      <div className={cn(
        "relative flex bg-edu-surface border border-edu-border rounded-[16px] px-3 py-2 shadow-sm transition-all duration-300",
        "focus-within:border-edu-primary focus-within:ring-[4px] focus-within:ring-edu-primary/20",
        error && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20"
      )}>
        <textarea
          ref={ref}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={minRows}
          className="w-full bg-transparent text-edu-text text-sm outline-none border-none p-0 focus:ring-0 resize-none"
          onChange={handleTextareaChange}
          {...props}
        />
      </div>
      {maxLength && (
        <span className="text-xs text-edu-muted text-right mt-0.5">
          {current}/{maxLength}
        </span>
      )}
      {error && (
        <span className="text-red-500 text-xs mt-1">
          {error}
        </span>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';
export default TextArea;
