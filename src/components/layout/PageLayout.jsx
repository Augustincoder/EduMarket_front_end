// src/components/layout/PageLayout.jsx
import { cn } from '../../lib/utils';
import { BottomNav } from './BottomNav';

export function PageLayout({
  children,
  showNav    = true,
  className  = '',
  bgClass    = 'bg-edu-bg', // Default solid color, can be bg-mesh-aurora
  scrollable = true,
}) {
  return (
    <div className={cn("flex flex-col min-h-dvh relative", bgClass)}>
      <main
        className={cn(
          'flex-1 w-full',
          showNav && scrollable && 'pb-nav',
          scrollable && 'overflow-y-auto overflow-x-hidden scrollbar-hide',
          !scrollable && 'overflow-hidden',
          className
        )}
      >
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}

export default PageLayout;
