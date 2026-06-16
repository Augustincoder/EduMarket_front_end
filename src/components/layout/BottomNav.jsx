// src/components/layout/BottomNav.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Home, ClipboardList, Plus, Briefcase, User, MessageSquare, Wallet, Bell } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '../../lib/utils';
import { hapticLight } from '../../lib/telegram';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

const ICONS = { Home, ClipboardList, Plus, Briefcase, User, MessageSquare, Wallet, Bell };

function MagneticWrapper({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = e.currentTarget.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center w-full h-full"
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

function ParticleBurst({ isActive }) {
  const particles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      // eslint-disable-next-line react-hooks/purity
      const dist = 25 + Math.random() * 15;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        // eslint-disable-next-line react-hooks/purity
        scale: Math.random() * 0.6 + 0.4
      };
    });
  }, []);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: p.scale, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("absolute w-1.5 h-1.5 rounded-full", p.id % 2 === 0 ? "bg-edu-primary" : "bg-indigo-400")}
        />
      ))}
    </div>
  );
}

function AnimatedIcon({ icon, isActive }) {
  const Icon = ICONS[icon];
  
  const variants = {
    Home: { active: { y: [0, -4, 0], scale: [1, 1.15, 1], transition: { duration: 0.4 } } },
    MessageSquare: { active: { scale: [1, 1.25, 0.9, 1.1, 1], transition: { duration: 0.5 } } },
    User: { active: { rotate: [0, -15, 15, -10, 10, 0], transition: { duration: 0.5 } } },
    Wallet: { active: { y: [0, -3, 0], scale: [1, 1.1, 1], transition: { duration: 0.4 } } },
    ClipboardList: { active: { scaleY: [1, 1.1, 1], y: [0, -2, 0], transition: { duration: 0.4 } } }
  };

  const currentVariant = variants[icon] || { active: { scale: [1, 1.1, 1] } };

  return (
    <motion.div variants={currentVariant} animate={isActive ? "active" : "inactive"}>
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="transition-colors duration-200" />
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

  // Idea 6: The Dynamic Island Dock
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 60) {
      setHidden(true); // Scrolling down
    } else {
      setHidden(false); // Scrolling up
    }
  });

  const handleNav = (route) => {
    hapticLight();
    navigate(route);
  };

  return (
    <motion.nav 
      animate={{ 
        width: hidden ? '85%' : '100%',
        bottom: hidden ? '16px' : '0px',
        borderRadius: hidden ? '32px' : '0px',
        opacity: hidden ? 0.9 : 1,
        y: hidden ? 5 : 0
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={cn(
        'fixed left-1/2 -translate-x-1/2 max-w-[768px]',
        'bg-edu-surface/85 backdrop-blur-xl border-t border-edu-border',
        'pb-safe z-40 overflow-hidden'
      )}
      style={{ borderTopWidth: hidden ? '0px' : '1px' }}
    >
      {/* Gyro Glass Shimmer */}
      <motion.div 
        animate={{ x: ['-200%', '200%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-[150%] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent skew-x-[-25deg] pointer-events-none z-0"
      />

      <AnimatePresence mode="popLayout">
        <motion.div 
          key={activeRole}
          initial={{ y: 50, opacity: 0, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -50, opacity: 0, filter: "blur(10px)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25, staggerChildren: 0.1 }}
          className="flex items-center justify-around h-[64px] px-3 w-full"
        >
          {NAV.map(({ icon, label, route, badge }) => {
          const isCenter = icon === 'Plus';
          const isActive = location.pathname === route || (
            route !== '/home' &&
            location.pathname.startsWith(route) &&
            !(route === '/tasks' && location.pathname === '/tasks/create')
          );

          if (isCenter) {
            return (
              <div key={route} className="relative -top-[20px] w-[56px] h-[56px] flex items-center justify-center z-50">
                <motion.div 
                  animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  className="absolute inset-0 bg-edu-primary rounded-full pointer-events-none"
                />
                <motion.button
                  whileTap={{ scale: 0.8, y: 5 }}
                  onClick={() => handleNav(route)}
                  className={cn(
                    'relative w-full h-full rounded-full',
                    'flex items-center justify-center z-10',
                    'border-[4px] border-edu-bg shadow-btn',
                    isActive ? 'bg-edu-primary-h' : 'bg-edu-primary'
                  )}
                >
                  <ParticleBurst isActive={isActive} />
                  <motion.div
                    animate={isActive ? { rotate: 90, scale: 1.1 } : { rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Plus size={32} className="text-white" strokeWidth={3} />
                  </motion.div>
                </motion.button>
              </div>
            );
          }

          return (
            <button
              key={route}
              onClick={() => handleNav(route)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-md relative',
                'transition-all duration-220 min-w-[50px] flex-1 h-[56px]',
                isActive ? 'text-edu-primary' : 'text-edu-muted hover:text-edu-text/60'
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute inset-x-3 -top-[2px] h-[3px] bg-edu-primary rounded-b-full shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <MagneticWrapper>
                <ParticleBurst isActive={isActive} />
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <AnimatedIcon icon={icon} isActive={isActive} />
                  {badge > 0 && (
                    <motion.span 
                      key={badge}
                    initial={{ scale: 0, y: -15, rotate: -20 }}
                    animate={{ scale: 1, y: 0, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 600, damping: 15 }}
                    className="absolute -top-1.5 -right-2 bg-edu-urgent text-white text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center border-[1.5px] border-edu-bg shadow-sm"
                  >
                    {badge > 99 ? '99+' : badge}
                  </motion.span>
                )}
              </div>
              
                <AnimatePresence>
                  {isActive && (
                    <motion.span 
                      initial={{ opacity: 0, height: 0, y: 5 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="text-[10px] font-bold tracking-[0.02em] overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </MagneticWrapper>
            </button>
          );
        })}
        </motion.div>
      </AnimatePresence>
    </motion.nav>
  );
}

export default BottomNav;
