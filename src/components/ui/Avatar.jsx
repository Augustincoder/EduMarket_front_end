// src/components/ui/Avatar.jsx
import { getInitials } from '../../lib/utils';
import { cn } from '../../lib/utils';

const sizeClass = {
  xs:   'w-6 h-6 text-[10px]',
  sm:   'w-8 h-8 text-xs',
  md:   'w-10 h-10 text-sm',
  lg:   'w-12 h-12 text-base',
  xl:   'w-16 h-16 text-lg',
  '2xl':'w-20 h-20 text-xl',
};

const COLORS = [
  '#007AFF', '#5856D6', '#AF8B3B', '#34C759', '#FF9500', '#FF3B30', '#5AC8FA',
];

function getColor(name = '') {
  return COLORS[(name.charCodeAt(0) || 0) % COLORS.length];
}

export function Avatar({ name, avatarUrl, size = 'md', className, onClick }) {
  const fallbackColor = getColor(name);
  const initials = getInitials(name);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full shrink-0 font-black select-none shadow-premium-sm ring-1 ring-edu-text/[0.05]",
        sizeClass[size] || sizeClass.md,
        onClick && "cursor-pointer active-spring",
        className
      )}
      style={{ backgroundColor: fallbackColor }}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name || "Avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
            <span className="text-white drop-shadow-sm">
              {initials}
            </span>
          </div>
        )}
      </div>
      {/* Premium Inner Glow & Border */}
      <div className="absolute inset-0 rounded-full border border-edu-text/[0.08] pointer-events-none" />
      <div className="absolute inset-[0.5px] rounded-full border border-white/10 pointer-events-none opacity-50" />
    </div>
  );
}

export default Avatar;
