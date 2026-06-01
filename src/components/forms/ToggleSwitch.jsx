// src/components/forms/ToggleSwitch.jsx
import * as Switch from '@radix-ui/react-switch';

export function ToggleSwitch({ label, description, checked, onChange }) {
  return (
    <div className="flex flex-row-reverse w-full justify-between items-center bg-edu-surface rounded-[16px] px-4 py-3.5 border border-edu-border gap-4 shadow-sm active-bounce">
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        className="w-[50px] h-[30px] bg-edu-border/80 rounded-full relative outline-none focus:ring-[3px] focus:ring-edu-primary/20 data-[state=checked]:bg-edu-primary transition-colors cursor-pointer"
      >
        <Switch.Thumb 
          className="block w-[26px] h-[26px] bg-white rounded-full transition-transform translate-x-[2px] data-[state=checked]:translate-x-[22px] shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
        />
      </Switch.Root>
      <div className="flex flex-col gap-0.5 cursor-pointer" onClick={() => onChange?.(!checked)}>
        {label && <p className="text-sm font-semibold text-edu-text">{label}</p>}
        {description && <p className="text-xs text-edu-muted">{description}</p>}
      </div>
    </div>
  );
}

export default ToggleSwitch;
