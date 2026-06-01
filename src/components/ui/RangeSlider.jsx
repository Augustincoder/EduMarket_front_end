// src/components/ui/RangeSlider.jsx
import * as Slider from '@radix-ui/react-slider';
import { cn } from '../../lib/utils';

export function RangeSlider({ min = 0, max = 1000000, step = 10000, value, onValueChange, className }) {
  return (
    <Slider.Root
      className={cn(
        'relative flex items-center select-none touch-none w-full h-5',
        className
      )}
      value={value}
      onValueChange={onValueChange}
      max={max}
      min={min}
      step={step}
    >
      <Slider.Track className="bg-edu-border relative grow rounded-full h-1.5 transition-all">
        <Slider.Range className="absolute bg-edu-primary rounded-full h-full" />
      </Slider.Track>
      <Slider.Thumb
        className="block w-5 h-5 bg-white border-2 border-edu-primary rounded-full shadow-btn cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-edu-primary/30"
        aria-label="Min price"
      />
      <Slider.Thumb
        className="block w-5 h-5 bg-white border-2 border-edu-primary rounded-full shadow-btn cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-edu-primary/30"
        aria-label="Max price"
      />
    </Slider.Root>
  );
}
