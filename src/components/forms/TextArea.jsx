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
        <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <div className={cn(
        "relative flex bg-gray-50 dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.03] rounded-[22px] px-4 py-3 transition-all duration-300",
        "focus-within:bg-white dark:focus-within:bg-white/10 focus-within:ring-[5px] focus-within:ring-[#007AFF]/10 focus-within:border-[#007AFF]/30",
        error && "border-red-500/50 focus-within:border-red-500 focus-within:ring-red-500/10"
      )}>
        <textarea
          ref={ref}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={minRows}
          className="w-full bg-transparent text-gray-900 dark:text-white text-[15px] font-bold outline-none border-none p-0 focus:ring-0 resize-none placeholder:text-gray-400/80 placeholder:font-medium"
          onChange={handleTextareaChange}
          {...props}
        />
      </div>
      {maxLength && (
        <span className="text-[10px] font-black text-gray-400 text-right mt-0.5 px-1">
          {current}/{maxLength}
        </span>
      )}
      {error && (
        <span className="text-red-500 text-[11px] font-bold mt-1 px-1">
          {error}
        </span>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';
export default TextArea;
