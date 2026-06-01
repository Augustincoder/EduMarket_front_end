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
      'sticky top-0 z-30 w-full max-w-[430px]',
      !transparent && 'bg-edu-surface/80 backdrop-blur-3xl border-b border-edu-border/50',
      transparent && 'bg-transparent',
      className
    )}>
      <div className="flex items-center min-h-[56px] px-4 py-2 gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
              'bg-edu-bg press-scale transition-all hover:bg-edu-border/60'
            )}
          >
            <ArrowLeft size={18} className="text-edu-text" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="text-lg font-bold font-display text-edu-text truncate leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs text-edu-muted truncate">{subtitle}</p>
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
