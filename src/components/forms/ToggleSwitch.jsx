// src/components/forms/ToggleSwitch.jsx
import * as Switch from '@radix-ui/react-switch';
import { cn } from '../../lib/utils';

export function ToggleSwitch({ label, description, checked, onChange }) {
  const switchId = label ? label.replace(/\s+/g, '-').toLowerCase() : 'switch';
  
  return (
    <div 
      className={cn(
        "flex w-full justify-between items-center bg-edu-surface rounded-xl px-4 py-4 border border-edu-border gap-4 shadow-sm transition-all",
        checked && "border-edu-primary/30 bg-edu-primary/[0.02]"
      )}
    >
      <div 
        className="flex flex-col gap-0.5 flex-1 cursor-pointer select-none"
        onClick={() => onChange?.(!checked)}
      >
        {label && (
          <label 
            htmlFor={switchId} 
            className="text-[14px] font-bold text-edu-text cursor-pointer leading-tight"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-[12px] text-edu-muted leading-relaxed font-medium">
            {description}
          </p>
        )}
      </div>

      <Switch.Root
        id={switchId}
        aria-label={label}
        checked={checked}
        onCheckedChange={onChange}
        className="w-[44px] h-[26px] bg-edu-border/50 rounded-full relative outline-none focus-visible:ring-2 focus-visible:ring-edu-primary/40 focus:outline-none data-[state=checked]:bg-edu-primary transition-colors cursor-pointer shrink-0"
      >
        <Switch.Thumb 
          className="block w-[22px] h-[22px] bg-white rounded-full transition-transform translate-x-[2px] data-[state=checked]:translate-x-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
        />
      </Switch.Root>
    </div>
  );
}

export default ToggleSwitch;
