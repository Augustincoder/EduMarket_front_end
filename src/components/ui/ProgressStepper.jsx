// src/components/ui/ProgressStepper.jsx
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ProgressStepper({ steps, current }) {
  return (
    <div className="flex items-center gap-0 w-full px-2">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone  = stepNum < current;
        const isActive= stepNum === current;

        return (
          <div key={i} className="flex items-center flex-1">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                  'transition-all duration-300',
                  isDone  && 'bg-edu-primary text-white',
                  isActive&& 'bg-edu-primary text-white ring-4 ring-edu-primary/20',
                  !isDone && !isActive && 'bg-edu-border text-edu-muted'
                )}
              >
                {isDone ? <Check size={14} /> : stepNum}
              </div>
              {label && (
                <span className={cn(
                  'text-2xs font-medium whitespace-nowrap',
                  isActive ? 'text-edu-primary' : 'text-edu-muted'
                )}>
                  {label}
                </span>
              )}
            </div>

            {/* Line */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-1 transition-all duration-300',
                  isDone ? 'bg-edu-primary' : 'bg-edu-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProgressStepper;
