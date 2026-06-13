// src/components/ui/ProgressStepper.jsx
import { cn } from '../../lib/utils';

export function ProgressStepper({ steps, current, onStepClick }) {
  // Mobile-first minimalistic premium stepper
  return (
    <div className="w-full flex flex-col items-center">
      {/* Current Step Label */}
      <div className="mb-4 text-center">
        <p className="text-[10px] font-bold text-edu-muted uppercase tracking-[0.2em]">
          {steps[current - 1]} — {current} / {steps.length}
        </p>
      </div>

      {/* Progress Bars (iOS Home Indicator Style) */}
      <div className="flex items-center justify-center gap-2 w-full">
        {steps.map((_, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < current;
          const isActive = stepNum === current;

          return (
            <button
              key={i}
              onClick={() => onStepClick && onStepClick(stepNum)}
              disabled={!onStepClick || stepNum >= current}
              aria-label={`O'tish: ${steps[i]}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-700 ease-in-out',
                isActive ? 'w-12 bg-edu-primary shadow-lg shadow-edu-primary/30' : 
                isDone ? 'w-6 bg-edu-primary/40 cursor-pointer hover:bg-edu-primary/60 active:scale-95' : 'w-6 bg-black/[0.05] dark:bg-white/10 opacity-50 cursor-not-allowed'
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ProgressStepper;
