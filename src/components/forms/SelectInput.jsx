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
    <div className={cn("w-full flex flex-col gap-2", className)}>
      {label && <label htmlFor={props.id || props.name} className="text-xs font-semibold text-edu-muted px-1">{label}</label>}
      
      <Select.Root value={value} onValueChange={onChange} {...props}>
        <Select.Trigger 
          ref={ref}
          id={props.id || props.name}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id || props.name}-error` : undefined}
          className={cn(
            "relative flex items-center justify-between bg-edu-surface-2 border-[1.5px] border-edu-border rounded-md px-4 h-[48px] shadow-none focus-within:bg-edu-surface focus-within:border-edu-primary focus-within:ring-[3px] focus-within:ring-edu-primary-l focus:bg-edu-surface outline-none transition-all duration-220 ease-in-out text-[14px] text-edu-text w-full cursor-pointer",
            error && "border-edu-urgent focus-within:border-edu-urgent focus-within:ring-edu-urgent-l focus:border-edu-urgent",
            !value && "text-edu-muted-2"
          )}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDown size={16} className="text-edu-muted" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content 
            className="overflow-hidden bg-edu-surface rounded-xl shadow-lg border border-edu-border z-[100] animate-fade-in"
            position="popper"
            sideOffset={5}
            style={{ width: 'var(--radix-select-trigger-width)' }}
          >
            <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-edu-surface-2 text-edu-muted cursor-default">
              <ChevronUp size={14} />
            </Select.ScrollUpButton>
            
            <Select.Viewport className="p-1.5">
              {options.map((opt) => (
                <Select.Item 
                  key={opt.value} 
                  value={opt.value}
                  className="relative flex items-center pl-8 pr-4 py-2.5 text-[14px] text-edu-text rounded-md hover:bg-edu-surface-3 focus:bg-edu-surface-3 outline-none cursor-pointer select-none font-medium transition-colors"
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

            <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-edu-surface-2 text-edu-muted cursor-default">
              <ChevronDown size={14} />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      
      {error && <span id={`${props.id || props.name}-error`} className="text-edu-urgent text-xs mt-1 px-1" role="alert">{error}</span>}
    </div>
  );
});

SelectInput.displayName = 'SelectInput';
export default SelectInput;
