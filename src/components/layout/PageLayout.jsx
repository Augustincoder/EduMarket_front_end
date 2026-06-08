// src/components/layout/PageLayout.jsx
import { cn } from '../../lib/utils';
import { BottomNav } from './BottomNav';
import { motion, AnimatePresence } from 'framer-motion';

export function PageLayout({
  children,
  showNav    = true,
  className  = '',
  bgClass    = 'bg-edu-bg', // Default solid color, can be bg-mesh-aurora
  scrollable = true,
}) {
  return (
    <div className={cn("flex flex-col min-h-dvh relative", bgClass)}>
      <AnimatePresence mode="wait">
        <motion.main
          key={window.location.pathname}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'flex-1 w-full',
            showNav && scrollable && 'pb-nav',
            scrollable && 'overflow-y-auto overflow-x-hidden scrollbar-hide',
            !scrollable && 'overflow-hidden',
            className
          )}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </div>
  );
}

export default PageLayout;
