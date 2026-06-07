// src/components/layout/Header.jsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { hapticLight } from '../../lib/telegram';

export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  right,
  transparent = false,
  className,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    hapticLight();
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header className={cn(
      'sticky top-0 z-30 w-full max-w-[768px]',
      !transparent && 'ios-glass border-b border-edu-border',
      transparent && 'bg-transparent',
      className
    )}>
      <div className="flex items-center min-h-[56px] px-4 py-2 gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              'bg-black/5 dark:bg-white/5 active-spring transition-all'
            )}
          >
            <ArrowLeft size={20} className="text-edu-text" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="text-[17px] font-bold font-display text-edu-text tracking-ios-display truncate leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-[11px] font-semibold text-edu-muted tracking-wide truncate uppercase opacity-80">{subtitle}</p>
          )}
        </div>

        {right && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {right}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
