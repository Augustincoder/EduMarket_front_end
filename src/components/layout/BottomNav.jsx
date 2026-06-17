// src/components/layout/BottomNav.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Home, ClipboardList, Plus, Briefcase, User, MessageSquare, Wallet, Bell } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '../../lib/utils';
import { hapticLight } from '../../lib/telegram';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

const ICONS = { Home, ClipboardList, Plus, Briefcase, User, MessageSquare, Wallet, Bell };

function AnimatedIcon({ icon, isActive }) {
  const Icon = ICONS[icon];
  return (
    <motion.div
      animate={isActive ? { y: -1, scale: 1.08 } : { y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    >
      <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} className="transition-colors duration-200" />
    </motion.div>
  );
}

export function BottomNav() {
  const location = useLocation();
  const navigate  = useNavigate();
  const activeRole = useAuthStore((s) => s.activeRole);
  const totalUnread = useChatStore((s) => s.totalUnread);

  const isFreelancerMode = activeRole === 'FREELANCER';

  const CLIENT_NAV = [
    { icon: 'Home',          label: 'Asosiy',    route: '/home'         },
    { icon: 'ClipboardList', label: 'Ishlarim',  route: '/my-tasks'     },
    { icon: 'Plus',          label: '',          route: '/tasks/create' },
    { icon: 'MessageSquare', label: 'Chat',      route: '/chats',       badge: totalUnread },
    { icon: 'User',          label: 'Profil',    route: '/profile'      },
  ];

  const FREELANCER_NAV = [
    { icon: 'Home',          label: 'Asosiy',    route: '/home'         },
    { icon: 'ClipboardList', label: 'Vazifalar', route: '/tasks'        },
    { icon: 'MessageSquare', label: 'Chat',      route: '/chats',       badge: totalUnread },
    { icon: 'Wallet',        label: 'Daromad',   route: '/earnings'     },
    { icon: 'User',          label: 'Profil',    route: '/profile'      },
  ];

  const NAV = isFreelancerMode ? FREELANCER_NAV : CLIENT_NAV;

  // Dynamic Island: shrink when scrolling down
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 60) setHidden(true);
    else setHidden(false);
  });

  const handleNav = (route) => {
    hapticLight();
    navigate(route);
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{
        y: 0,
        width: hidden ? '88%' : '100%',
        bottom: hidden ? '12px' : '0px',
        borderRadius: hidden ? '28px' : '0px',
        opacity: hidden ? 0.92 : 1,
      }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className={cn(
        'fixed left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[768px]',
        'bg-edu-surface/90 backdrop-blur-2xl border-t border-edu-border/60',
        'pb-[max(0px,env(safe-area-inset-bottom))] z-40 overflow-visible'
      )}
      style={{ borderTopWidth: hidden ? '0px' : '1px' }}
    >
      {/* subtle shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeRole}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex items-center justify-around h-[60px] px-2 w-full"
        >
          {NAV.map(({ icon, label, route, badge }) => {
            const isCenter = icon === 'Plus';
            const isActive = location.pathname === route || (
              route !== '/home' &&
              location.pathname.startsWith(route) &&
              !(route === '/tasks' && location.pathname === '/tasks/create')
            );

            // ── CENTER + BUTTON ─────────────────────────────────────────
            if (isCenter) {
              return (
                // FIX: Use flex item that takes normal space + negative margin-top to float button up
                // This keeps it fully visible at all times, even when nav shrinks
                <div key={route} className="flex-1 flex items-center justify-center" style={{ marginTop: '-28px' }}>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    whileHover={{ scale: 1.06 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    onClick={() => handleNav(route)}
                    className={cn(
                      'relative w-[52px] h-[52px] rounded-full',
                      'flex items-center justify-center',
                      'shadow-[0_4px_20px_rgba(0,0,0,0.18)] border-[3px] border-edu-bg',
                      isActive ? 'bg-edu-primary-h' : 'bg-edu-primary'
                    )}
                  >
                    {/* Soft glow ring — NOT aggressive pulse */}
                    <div className="absolute inset-0 rounded-full bg-edu-primary/20 scale-[1.35] pointer-events-none" />
                    <motion.div
                      animate={isActive ? { rotate: 45 } : { rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    >
                      <Plus size={28} className="text-white" strokeWidth={2.5} />
                    </motion.div>
                  </motion.button>
                </div>
              );
            }

            // ── REGULAR NAV ITEM ────────────────────────────────────────
            return (
              <button
                key={route}
                onClick={() => handleNav(route)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 rounded-xl relative',
                  'transition-colors duration-200 flex-1 h-[52px] min-w-0 px-1',
                  isActive ? 'text-edu-primary' : 'text-edu-muted'
                )}
              >
                {/* Active pill indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 inset-x-3 h-[3px] bg-edu-primary rounded-t-full"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}

                <div className="relative">
                  <AnimatedIcon icon={icon} isActive={isActive} />
                  {/* Unread badge */}
                  {badge > 0 && (
                    <motion.span
                      key={badge}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                      className="absolute -top-1.5 -right-2 bg-edu-urgent text-white text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center border-[1.5px] border-edu-bg shadow-sm"
                    >
                      {badge > 99 ? '99+' : badge}
                    </motion.span>
                  )}
                </div>

                {/* Label — always visible (not animated in/out to avoid layout jump) */}
                <span className={cn(
                  'text-[10px] font-semibold tracking-[0.01em] leading-none transition-opacity duration-200 truncate max-w-full px-1',
                  isActive ? 'opacity-100' : 'opacity-60'
                )}>
                  {label}
                </span>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.nav>
  );
}

export default BottomNav;
