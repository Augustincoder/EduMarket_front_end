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
    <div className={cn("w-full flex flex-col gap-2", className)}>
      {label && (
        <label htmlFor={props.id || props.name} className="text-[11px] font-bold text-edu-muted uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <div className={cn(
        "relative flex items-center bg-edu-bg border border-edu-border rounded-[20px] px-4 h-13 transition-all duration-300",
        "focus-within:bg-white dark:focus-within:bg-white/10 focus-within:ring-[5px] focus-within:ring-edu-primary/10 focus-within:border-edu-primary/30",
        error && "border-red-500/50 focus-within:border-red-500 focus-within:ring-red-500/10",
        containerClassName
      )}>
        {startContent && <div className="mr-3 shrink-0 flex items-center justify-center text-gray-400">{startContent}</div>}
        <input
          ref={ref}
          id={props.id || props.name}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id || props.name}-error` : undefined}
          className="w-full bg-transparent text-edu-text text-[15px] font-bold outline-none border-none p-0 focus:ring-0 placeholder:text-gray-400/80 placeholder:font-medium"
          onChange={handleInputChange}
          {...props}
        />
        {endContent && <div className="ml-3 shrink-0 flex items-center justify-center">{endContent}</div>}
        {maxLength && (
          <span className="text-[10px] font-bold text-gray-400 shrink-0 ml-3" aria-hidden="true">
            {currentLength ?? 0}/{maxLength}
          </span>
        )}
      </div>
      {error && (
        <span id={`${props.id || props.name}-error`} className="text-red-500 text-[11px] font-bold mt-1 px-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

TextInput.displayName = 'TextInput';
export default TextInput;
