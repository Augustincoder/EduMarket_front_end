// src/components/layout/PageLayout.jsx
import { cn } from '../../lib/utils';
import { BottomNav } from './BottomNav';
import { motion, AnimatePresence } from 'framer-motion';

import { SectionErrorBoundary } from '../ui/SectionErrorBoundary';

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
          <SectionErrorBoundary 
            fallbackTitle="Sahifani yuklashda xatolik" 
            fallbackMessage="Tizimda kichik uzilish yuz berdi. Iltimos sahifani yangilang yoki pastki menyudan boshqa bo'limga o'ting."
            className="h-full min-h-[50vh] border-none bg-transparent"
          >
            {children}
          </SectionErrorBoundary>
        </motion.main>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </div>
  );
}

export default PageLayout;
