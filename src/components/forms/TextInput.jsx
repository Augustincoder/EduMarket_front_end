// src/components/forms/TextInput.jsx
import { forwardRef } from 'react';
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
  ...props
}, ref) => {
  const handleInputChange = (e) => {
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
        "relative flex items-center bg-edu-surface-2 border-[1.5px] border-edu-border rounded-xl px-4 h-[48px] transition-all duration-220 ease-in-out",
        "focus-within:bg-edu-surface focus-within:border-edu-primary focus-within:ring-[3px] focus-within:ring-edu-primary-l",
        error && "border-edu-urgent focus-within:border-edu-urgent focus-within:ring-[3px] focus-within:ring-edu-urgent-l",
        containerClassName
      )}>
        {startContent && <div className="mr-3 shrink-0 flex items-center justify-center text-edu-muted">{startContent}</div>}
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
          {...props}
        />
        {endContent && <div className="ml-3 shrink-0 flex items-center justify-center text-edu-muted">{endContent}</div>}
        {maxLength && (
          <span className="text-[10px] font-bold text-edu-muted shrink-0 ml-3" aria-hidden="true">
            {currentLength ?? 0}/{maxLength}
          </span>
        )}
      </div>
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
