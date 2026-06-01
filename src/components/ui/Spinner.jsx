// src/components/ui/Spinner.jsx
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function Spinner({ size = 'md', className, color = 'text-edu-primary' }) {
  return <Loader2 size={sizeMap[size] || 24} className={cn("animate-spin", color, className)} />;
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-edu-bg z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-edu-primary/10 flex items-center justify-center">
          <Spinner size="md" color="text-edu-primary" />
        </div>
        <p className="text-sm text-edu-muted font-medium animate-pulse">Yuklanmoqda...</p>
      </div>
    </div>
  );
}

export default Spinner;
