// src/components/ui/StarRating.jsx
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export function StarRating({ value = 0, onChange, size = 28, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={cn(
            'transition-all duration-100',
            !readonly && 'press-scale cursor-pointer',
            readonly && 'cursor-default'
          )}
        >
          <Star
            size={size}
            className={cn(
              'transition-all duration-150',
              star <= active ? 'fill-yellow-400 text-yellow-400' : 'text-edu-border fill-edu-border'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function DisplayRating({ rating, count, size = 14 }) {
  const avg = typeof rating === 'number' ? (rating).toFixed(1) : '—';
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold">
      <Star size={size} className="fill-yellow-400 text-yellow-400" />
      {avg}
      {count !== undefined && (
        <span className="text-edu-muted font-normal text-xs">({count})</span>
      )}
    </span>
  );
}

export default StarRating;
