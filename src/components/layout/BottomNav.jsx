// src/components/layout/BottomNav.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Plus, Briefcase, User, MessageCircle, Wallet } from 'lucide-react';
import { cn } from '../../lib/utils';
import { hapticLight } from '../../lib/telegram';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

const ICONS = { Home, ClipboardList, Plus, Briefcase, User, MessageCircle, Wallet };

export function BottomNav() {
  const location = useLocation();
  const navigate  = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);
  const totalUnread = useChatStore((s) => s.totalUnread);

  const isFreelancerMode = activeRole === 'FREELANCER';

  const CLIENT_NAV = [
    { icon: 'Home',          label: 'Asosiy',    route: '/home'         },
    { icon: 'ClipboardList', label: 'Mening ishim', route: '/my-tasks'  },
    { icon: 'Plus',          label: '',          route: '/tasks/create' },
    { icon: 'MessageCircle', label: 'Chat',      route: '/chats',        badge: totalUnread },
    { icon: 'User',          label: 'Profil',    route: '/profile'      },
  ];

  const FREELANCER_NAV = [
    { icon: 'Home',          label: 'Asosiy',    route: '/home'         },
    { icon: 'ClipboardList', label: 'Vazifalar', route: '/tasks'        },
    { icon: 'MessageCircle', label: 'Chat',      route: '/chats',        badge: totalUnread },
    { icon: 'Wallet',        label: 'Daromad',   route: '/earnings'     },
    { icon: 'User',          label: 'Profil',    route: '/profile'      },
  ];

  const NAV = isFreelancerMode ? FREELANCER_NAV : CLIENT_NAV;

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
        {NAV.map(({ icon, label, route, badge }) => {
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
                'w-9 h-6 flex items-center justify-center rounded-xl transition-all duration-300 relative',
                isActive ? 'bg-edu-primary/10 scale-105' : 'bg-transparent'
              )}>
                <Icon 
                  size={20} 
                  className={cn('transition-transform duration-300', isActive && 'scale-110')} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center border border-edu-surface">
                    {badge}
                  </span>
                )}
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
