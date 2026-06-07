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
        <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <div className={cn(
        "relative flex items-center bg-gray-50 dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] px-4 h-13 transition-all duration-300",
        "focus-within:bg-white dark:focus-within:bg-white/10 focus-within:ring-[5px] focus-within:ring-[#007AFF]/10 focus-within:border-[#007AFF]/30",
        error && "border-red-500/50 focus-within:border-red-500 focus-within:ring-red-500/10",
        containerClassName
      )}>
        {startContent && <div className="mr-3 shrink-0 flex items-center justify-center text-gray-400">{startContent}</div>}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full bg-transparent text-gray-900 dark:text-white text-[15px] font-bold outline-none border-none p-0 focus:ring-0 placeholder:text-gray-400/80 placeholder:font-medium"
          onChange={handleInputChange}
          {...props}
        />
        {endContent && <div className="ml-3 shrink-0 flex items-center justify-center">{endContent}</div>}
        {maxLength && (
          <span className="text-[10px] font-black text-gray-400 shrink-0 ml-3">
            {currentLength ?? 0}/{maxLength}
          </span>
        )}
      </div>
      {error && (
        <span className="text-red-500 text-[11px] font-bold mt-1 px-1">
          {error}
        </span>
      )}
    </div>
  );
});

TextInput.displayName = 'TextInput';
export default TextInput;
