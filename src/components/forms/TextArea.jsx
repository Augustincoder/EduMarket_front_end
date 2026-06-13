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
        <label htmlFor={props.id || props.name} className="text-xs font-semibold text-edu-muted px-1">
          {label}
        </label>
      )}
      <div className={cn(
        "relative flex bg-edu-surface-2 border-[1.5px] border-edu-border rounded-xl px-4 py-3 transition-all duration-220 ease-in-out",
        "focus-within:bg-edu-surface focus-within:border-edu-primary focus-within:ring-[3px] focus-within:ring-edu-primary-l",
        error && "border-edu-urgent focus-within:border-edu-urgent focus-within:ring-[3px] focus-within:ring-edu-urgent-l"
      )}>
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
          {...props}
        />
      </div>
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
