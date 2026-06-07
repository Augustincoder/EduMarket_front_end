// src/components/ui/ProgressStepper.jsx
import { cn } from '../../lib/utils';

export function ProgressStepper({ steps, current }) {
  // Mobile-first minimalistic premium stepper
  return (
    <div className="w-full flex flex-col items-center">
      {/* Current Step Label */}
      <div className="mb-4 text-center">
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
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
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-700 ease-in-out',
                isActive ? 'w-12 bg-[#007AFF] shadow-lg shadow-[#007AFF]/30' : 
                isDone ? 'w-6 bg-[#007AFF]/40' : 'w-6 bg-black/[0.05] dark:bg-white/10'
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ProgressStepper;
