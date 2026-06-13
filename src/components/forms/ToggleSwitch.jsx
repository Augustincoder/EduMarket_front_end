// src/components/forms/ToggleSwitch.jsx
import * as Switch from '@radix-ui/react-switch';

export function ToggleSwitch({ label, description, checked, onChange }) {
  const switchId = label ? label.replace(/\s+/g, '-').toLowerCase() : 'switch';
  return (
    <div className="flex flex-row-reverse w-full justify-between items-center bg-edu-surface rounded-xl px-4 py-3.5 border border-edu-border gap-4 shadow-sm active-bounce">
      <Switch.Root
        id={switchId}
        aria-label={label}
        checked={checked}
        onCheckedChange={onChange}
        className="w-[50px] h-[30px] bg-edu-border/80 rounded-full relative outline-none focus-visible:ring-[3px] focus-visible:ring-edu-primary/40 focus:outline-none data-[state=checked]:bg-edu-primary transition-colors cursor-pointer"
      >
        <Switch.Thumb 
          className="block w-[26px] h-[26px] bg-white rounded-full transition-transform translate-x-[2px] data-[state=checked]:translate-x-[22px] shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
        />
      </Switch.Root>
      <div className="flex flex-col gap-0.5">
        {label && <label htmlFor={switchId} className="text-sm font-semibold text-edu-text cursor-pointer">{label}</label>}
        {description && <p className="text-xs text-edu-muted cursor-pointer" onClick={() => onChange?.(!checked)}>{description}</p>}
      </div>
    </div>
  );
}

export default ToggleSwitch;
