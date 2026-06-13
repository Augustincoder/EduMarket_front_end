// src/components/ui/Spinner.jsx
import { cn } from '../../lib/utils';

export function Spinner({ size = 'md', className, color = 'border-edu-primary' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div 
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "rounded-full border-t-transparent animate-spin",
        sizes[size] || sizes.md,
        color,
        className
      )} 
    >
      <span className="sr-only">Yuklanmoqda...</span>
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="fixed inset-0 flex flex-col items-center justify-center bg-edu-bg z-50 animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Pulsing glow background */}
          <div className="absolute inset-0 bg-edu-primary/20 blur-xl rounded-full animate-pulse-slow" />
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-edu-primary/10 rounded-full" />
          {/* Spinning segment */}
          <div className="absolute inset-0 border-4 border-t-edu-primary rounded-full animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-edu-primary drop-shadow-sm">EduMarket</p>
          <p className="text-[10px] font-bold text-edu-muted/80 uppercase tracking-widest animate-pulse">Yuklanmoqda</p>
        </div>
      </div>
    </div>
  );
}

export default Spinner;
