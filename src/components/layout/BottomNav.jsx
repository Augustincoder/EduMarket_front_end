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
      'bg-edu-surface/85 backdrop-blur-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.06)] border-t border-edu-border/30',
      'pb-safe z-40'
    )}>
      <div className="flex items-center justify-around h-[64px] px-2">
        {NAV.map(({ icon, label, route }) => {
          const Icon     = ICONS[icon];
          const isCenter = icon === 'Plus';
          const isActive = location.pathname === route || (
            route !== '/home' &&
            location.pathname.startsWith(route) &&
            !(route === '/tasks' && location.pathname === '/tasks/create')
          );

          if (isCenter) {
            return (
              <button
                key={route}
                onClick={() => handleNav(route)}
                className={cn(
                  'relative -top-4 w-[54px] h-[54px] rounded-full',
                  'shadow-btn flex items-center justify-center',
                  'press-scale transition-all duration-300',
                  'border-[4px] border-edu-surface',
                  isActive 
                    ? 'bg-gradient-to-tr from-edu-primary to-indigo-600 shadow-lg shadow-edu-primary/30 scale-105 border-edu-surface/90' 
                    : 'bg-edu-primary hover:bg-edu-primary-d'
                )}
              >
                <Plus 
                  size={26} 
                  className={cn(
                    'text-white transition-transform duration-300',
                    isActive && 'rotate-90 scale-110'
                  )} 
                  strokeWidth={2.5} 
                />
              </button>
            );
          }

          return (
            <button
              key={route}
              onClick={() => handleNav(route)}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl relative',
                'transition-all duration-300 min-w-[56px]',
                'press-scale mt-1',
                isActive ? 'text-edu-primary' : 'text-edu-muted'
              )}
            >
              <div className={cn(
                'w-9 h-6 flex items-center justify-center rounded-xl transition-all duration-300',
                isActive ? 'bg-edu-primary/10 scale-105' : 'bg-transparent'
              )}>
                <Icon 
                  size={20} 
                  className={cn('transition-transform duration-300', isActive && 'scale-110')} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </div>
              <span className={cn(
                'text-[10px] font-bold transition-all duration-300 mt-0.5',
                isActive ? 'opacity-100 scale-105' : 'opacity-70'
              )}>
                {label}
              </span>
              <span className={cn(
                'w-1 h-1 rounded-full bg-edu-primary absolute bottom-0 transition-all duration-300',
                isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              )} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
