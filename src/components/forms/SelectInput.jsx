// src/components/forms/SelectInput.jsx
import { forwardRef } from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

export const SelectInput = forwardRef(({
  label,
  placeholder,
  options = [],
  error,
  value,
  onChange,
  className,
  ...props
}, ref) => {
  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {label && <label className="text-edu-muted text-sm font-medium">{label}</label>}
      
      <Select.Root value={value} onValueChange={onChange} {...props}>
        <Select.Trigger 
          ref={ref}
          className={cn(
            "relative flex items-center justify-between bg-edu-surface border border-edu-border rounded-xl px-3 h-12 shadow-none focus-within:border-edu-primary focus:border-edu-primary outline-none transition-all text-sm text-edu-text w-full cursor-pointer",
            error && "border-red-500 focus-within:border-red-500 focus:border-red-500",
            !value && "text-edu-muted"
          )}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDown size={16} className="text-edu-muted" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content 
            className="overflow-hidden bg-edu-surface rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-edu-border z-[100] animate-fade-in"
            position="popper"
            sideOffset={5}
            style={{ width: 'var(--radix-select-trigger-width)' }}
          >
            <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-edu-surface text-edu-text cursor-default">
              <ChevronUp size={14} />
            </Select.ScrollUpButton>
            
            <Select.Viewport className="p-1.5">
              {options.map((opt) => (
                <Select.Item 
                  key={opt.value} 
                  value={opt.value}
                  className="relative flex items-center px-8 py-2.5 text-sm text-edu-text rounded-lg hover:bg-edu-surface focus:bg-edu-surface outline-none cursor-pointer select-none font-medium transition-colors"
                >
                  <Select.ItemText>
                    {opt.emoji ? `${opt.emoji} ` : ''}{opt.label}
                  </Select.ItemText>
                  
                  <Select.ItemIndicator className="absolute left-2.5 inline-flex items-center justify-center text-edu-primary">
                    <Check size={16} strokeWidth={3} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>

            <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-edu-surface text-edu-text cursor-default">
              <ChevronDown size={14} />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
});

SelectInput.displayName = 'SelectInput';
export default SelectInput;
