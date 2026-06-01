// src/components/layout/BottomNav.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Plus, Briefcase, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { hapticLight } from '../../lib/telegram';

const ICONS = { Home, ClipboardList, Plus, Briefcase, User };

const NAV = [
  { icon: 'Home',          label: 'Asosiy',    route: '/home'         },
  { icon: 'ClipboardList', label: 'Vazifalar', route: '/tasks'        },
  { icon: 'Plus',          label: '',           route: '/tasks/create' },
  { icon: 'Briefcase',     label: 'Xizmatlar', route: '/gigs'          },
  { icon: 'User',          label: 'Profil',    route: '/profile'       },
];

export function BottomNav() {
  const location = useLocation();
  const navigate  = useNavigate();

  const handleNav = (route) => {
    hapticLight();
    navigate(route);
  };

  return (
    <nav className={cn(
      'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px]',
      'bg-edu-surface/80 backdrop-blur-3xl shadow-nav border-t border-edu-border/50',
      'pb-safe z-40'
    )}>
      <div className="flex items-center justify-around h-[64px] px-2">
        {NAV.map(({ icon, label, route }) => {
          const Icon     = ICONS[icon];
          const isCenter = icon === 'Plus';
          const isActive = location.pathname === route ||
            (route !== '/home' && location.pathname.startsWith(route));

          if (isCenter) {
            return (
              <button
                key={route}
                onClick={() => handleNav(route)}
                className={cn(
                  'relative -top-4 w-[54px] h-[54px] rounded-full',
                  'bg-edu-primary shadow-btn flex items-center justify-center',
                  'press-scale transition-all duration-200',
                  'border-[4px] border-edu-surface'
                )}
              >
                <Plus size={26} className="text-white" strokeWidth={2.5} />
              </button>
            );
          }

          return (
            <button
              key={route}
              onClick={() => handleNav(route)}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-xl',
                'transition-all duration-200 min-w-[56px]',
                'press-scale mt-1',
                isActive ? 'text-edu-primary' : 'text-edu-muted'
              )}
            >
              <div className={cn(
                'w-8 h-6 flex items-center justify-center rounded-lg transition-all duration-200',
                isActive && 'bg-edu-primary/10'
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                'text-2xs font-semibold transition-all duration-200',
                isActive ? 'opacity-100' : 'opacity-70'
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
