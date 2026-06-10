import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as SelectPrimitive from '@radix-ui/react-select';
import { X, ChevronDown, Check } from 'lucide-react';

// ─── Radix UI Dialog (Modal) ──────────────────────────
export function Dialog({ children, open, onOpenChange }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogContent({ children, className = '' }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity" />
      <DialogPrimitive.Content className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-50 focus:outline-none max-h-[90vh] overflow-y-auto ${className}`}>
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full p-1 focus:outline-none transition-colors">
          <X size={18} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ children }) {
  return (
    <DialogPrimitive.Title className="text-lg font-bold text-slate-950 dark:text-white mb-2">
      {children}
    </DialogPrimitive.Title>
  );
}

export function DialogDescription({ children }) {
  return (
    <DialogPrimitive.Description className="text-sm text-slate-500 dark:text-slate-400 mb-5">
      {children}
    </DialogPrimitive.Description>
  );
}

// ─── Radix UI Switch ──────────────────────────────────
export function Switch({ checked, onCheckedChange, id }) {
  return (
    <SwitchPrimitive.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative data-[state=checked]:bg-indigo-600 outline-none cursor-pointer transition-colors duration-200"
    >
      <SwitchPrimitive.Thumb className="block w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
    </SwitchPrimitive.Root>
  );
}

// ─── Radix UI Select ──────────────────────────────────
export function Select({ value, onValueChange, placeholder, options }) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger className="inline-flex items-center justify-between rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 w-full outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer">
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown size={16} className="opacity-60" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="overflow-hidden bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
          <SelectPrimitive.Viewport className="p-1 min-w-[160px]">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className="relative flex items-center pl-8 pr-4 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer outline-none select-none hover:bg-slate-100 dark:hover:bg-slate-700 data-[state=checked]:font-bold data-[state=checked]:text-indigo-600"
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center justify-center">
                  <Check size={14} className="text-indigo-600" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
