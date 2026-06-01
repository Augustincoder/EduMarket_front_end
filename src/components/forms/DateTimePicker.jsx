// src/components/forms/DateTimePicker.jsx
import { TextInput } from './TextInput';
import { forwardRef } from 'react';
import { Calendar } from 'lucide-react';

export const DateTimePicker = forwardRef(({
  label,
  placeholder,
  error,
  value,
  onChange,
  ...props
}, ref) => (
  <TextInput
    ref={ref}
    type="datetime-local"
    label={label}
    placeholder={placeholder}
    error={error}
    value={value}
    onChange={onChange}
    endContent={<Calendar className="w-4 h-4 text-edu-muted shrink-0" />}
    classNames={{
      base: 'w-full',
      label: 'text-edu-muted text-sm font-medium',
      inputWrapper: [
        'bg-edu-surface border border-edu-border rounded-xl',
        'hover:border-edu-primary/40 group-data-[focused=true]:border-edu-primary',
        'shadow-none h-12',
      ].join(' '),
      input: 'text-edu-text text-sm',
      errorMessage: 'text-red-500 text-xs mt-1',
    }}
    {...props}
  />
));

DateTimePicker.displayName = 'DateTimePicker';
export default DateTimePicker;
