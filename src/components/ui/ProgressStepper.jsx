// src/components/ui/ProgressStepper.jsx
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ProgressStepper({ steps, current }) {
  // Mobile-first minimalistic stepper
  return (
    <div className="w-full flex flex-col items-center">
      {/* Current Step Text */}
      <div className="mb-3 text-center">
        <span className="text-[10px] font-bold text-edu-primary uppercase tracking-wider bg-edu-primary/10 px-2 py-1 rounded-full">
          Qadam {current} / {steps.length}
        </span>
        <h4 className="text-sm font-bold text-edu-text mt-1.5">
          {steps[current - 1]}
        </h4>
      </div>

      {/* Progress Bars / Dots */}
      <div className="flex items-center justify-center gap-1.5 w-full max-w-[280px]">
        {steps.map((_, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < current;
          const isActive = stepNum === current;

          return (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-500 ease-out',
                isActive ? 'w-8 bg-edu-primary shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 
                isDone ? 'w-4 bg-edu-primary/60' : 'w-4 bg-edu-border/50'
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ProgressStepper;
