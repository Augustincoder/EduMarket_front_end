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
  '#1D9E75','#534AB7','#185FA5','#BA7517','#3B6D11','#A32D2D','#D85A30',
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
        "relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 font-bold select-none",
        sizeClass[size] || sizeClass.md,
        onClick && "cursor-pointer active:scale-95 transition-transform",
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
        <span className="text-white">
          {initials}
        </span>
      )}
    </div>
  );
}

export default Avatar;
