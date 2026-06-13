// src/components/ui/Avatar.jsx
import { getInitials } from '../../lib/utils';
import { cn } from '../../lib/utils';

const sizeClass = {
  xs:   'w-[24px] h-[24px] text-[10px]',
  sm:   'w-[32px] h-[32px] text-[12px]',
  md:   'w-[40px] h-[40px] text-[14px]',
  lg:   'w-[48px] h-[48px] text-[16px]',
  xl:   'w-[64px] h-[64px] text-[20px]',
  '2xl':'w-[80px] h-[80px] text-3xl',
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
        "relative inline-flex items-center justify-center rounded-full shrink-0 font-bold select-none overflow-hidden",
        "bg-edu-surface-3 shadow-[0_0_0_2px_var(--edu-bg),0_0_0_3px_var(--edu-border)] dark:shadow-[0_0_0_2px_var(--edu-surface),0_0_0_3px_rgba(255,255,255,0.12)]",
        sizeClass[size] || sizeClass.md,
        onClick && "cursor-pointer active:scale-[0.96] transition-transform duration-120 ease-press",
        className
      )}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden" style={{ backgroundColor: fallbackColor }}>
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
    </div>
  );
}

export default Avatar;
