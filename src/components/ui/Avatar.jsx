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
        "relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 font-black select-none ring-1 ring-black/[0.03] dark:ring-white/10 shadow-sm",
        sizeClass[size] || sizeClass.md,
        onClick && "cursor-pointer active-spring",
        className
      )}
      style={{ backgroundColor: fallbackColor }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name || "Avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-white drop-shadow-sm">
          {initials}
        </span>
      )}
      <div className="absolute inset-0 rounded-full border border-black/5 pointer-events-none" />
    </div>
  );
}

export default Avatar;
