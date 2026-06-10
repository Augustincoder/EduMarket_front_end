// src/components/layout/BottomNav.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Plus, Briefcase, User, MessageSquare, Wallet, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { hapticLight } from '../../lib/telegram';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

const ICONS = { Home, ClipboardList, Plus, Briefcase, User, MessageSquare, Wallet, Bell };

export function BottomNav() {
  const location = useLocation();
  const navigate  = useNavigate();
  const activeRole = useAuthStore((s) => s.activeRole);
  const totalUnread = useChatStore((s) => s.totalUnread);

  const isFreelancerMode = activeRole === 'FREELANCER';

  const CLIENT_NAV = [
    { icon: 'Home',          label: 'Asosiy',    route: '/home'         },
    { icon: 'ClipboardList', label: 'Mening ishim', route: '/my-tasks'  },
    { icon: 'Plus',          label: '',          route: '/tasks/create' },
    { icon: 'MessageSquare', label: 'Chat',      route: '/chats',        badge: totalUnread },
    { icon: 'User',          label: 'Profil',    route: '/profile'      },
  ];

  const FREELANCER_NAV = [
    { icon: 'Home',          label: 'Asosiy',    route: '/home'         },
    { icon: 'ClipboardList', label: 'Vazifalar', route: '/tasks'        },
    { icon: 'MessageSquare', label: 'Chat',      route: '/chats',        badge: totalUnread },
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
      'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px]',
      'ios-glass border-t border-edu-border shadow-nav',
      'pb-safe z-40'
    )}>
      <div className="flex items-center justify-around h-[64px] px-3">
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
                  'relative -top-5 w-[60px] h-[60px] rounded-full',
                  'shadow-premium-btn flex items-center justify-center',
                  'active-spring transition-all duration-300',
                  'border-[4px] border-edu-surface shadow-premium-lg',
                  isActive 
                    ? 'bg-gradient-to-tr from-edu-primary to-edu-accent scale-105' 
                    : 'bg-edu-primary'
                )}
              >
                <Plus 
                  size={32} 
                  className={cn(
                    'text-white transition-transform duration-300',
                    isActive && 'rotate-90'
                  )} 
                  strokeWidth={3} 
                />
              </button>
            );
          }

          return (
            <button
              key={route}
              onClick={() => handleNav(route)}
              className={cn(
                'flex flex-col items-center gap-1 py-1 rounded-md relative',
                'transition-all duration-300 min-w-[50px] flex-1',
                'active-spring',
                isActive ? 'text-edu-primary scale-105' : 'text-edu-muted hover:text-edu-text/60'
              )}
            >
              <div className="relative">
                <Icon 
                  size={23} 
                  className="transition-transform duration-300"
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-edu-urgent text-white text-[10px] font-bold min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center border-2 border-edu-surface shadow-premium-sm">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] font-bold tracking-tight transition-all duration-300',
                isActive ? 'opacity-100' : 'opacity-60'
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
