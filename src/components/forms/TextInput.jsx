// src/components/forms/TextInput.jsx
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const TextInput = forwardRef(({
  label,
  placeholder,
  error,
  maxLength,
  currentLength,
  type = 'text',
  className,
  containerClassName,
  startContent,
  endContent,
  onValueChange,
  onChange,
  ...props
}, ref) => {
  const handleInputChange = (e) => {
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
        "relative flex items-center bg-edu-surface border border-edu-border rounded-[16px] px-3 h-12 shadow-sm transition-all duration-300",
        "focus-within:border-edu-primary focus-within:ring-[4px] focus-within:ring-edu-primary/20",
        error && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20",
        containerClassName
      )}>
        {startContent && <div className="mr-2 shrink-0 flex items-center justify-center">{startContent}</div>}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full bg-transparent text-edu-text text-sm outline-none border-none p-0 focus:ring-0"
          onChange={handleInputChange}
          {...props}
        />
        {endContent && <div className="ml-2 shrink-0 flex items-center justify-center">{endContent}</div>}
        {maxLength && (
          <span className="text-xs text-edu-muted shrink-0 ml-2">
            {currentLength ?? 0}/{maxLength}
          </span>
        )}
      </div>
      {error && (
        <span className="text-red-500 text-xs mt-1">
          {error}
        </span>
      )}
    </div>
  );
});

TextInput.displayName = 'TextInput';
export default TextInput;
