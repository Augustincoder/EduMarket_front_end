// TaskSearchHeader.jsx — iOS Telegram Folders style sticky category island
import { useRef, useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCategoryStore } from '../../../../store/categoryStore';
import { hapticLight } from '../../../../lib/telegram';
import { cn } from '../../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Individual Category Chip ─────────────────────────────────────────────────
function CategoryChip({ label, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        'relative px-4 h-[34px] rounded-full text-[13px] font-bold whitespace-nowrap flex-shrink-0',
        'transition-colors duration-200 outline-none select-none',
        active
          ? 'text-white'
          : 'text-edu-text/75 hover:text-edu-text'
      )}
    >
      {/* Active background pill (layoutId animates between chips) */}
      {active && (
        <motion.span
          layoutId="cat-pill"
          className="absolute inset-0 rounded-full bg-edu-primary shadow-[0_2px_12px_rgba(var(--color-primary-rgb,59,130,246),0.4)]"
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

export function TaskSearchHeader({
  localQuery,
  setLocalQuery,
  setIsFocused,
  filterState,
  setFilter,
  setFilterOpen,
  scrollY = 0,
}) {
  const getTrendingCategories = useCategoryStore(s => s.getTrendingCategories);
  const scrollRef = useRef(null);

  // Keep active chip in view when category changes
  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [filterState.category]);

  // Header collapse threshold
  const COLLAPSE_AT = 60;
  const collapsed = scrollY > COLLAPSE_AT;
  const headerOpacity = Math.max(0, 1 - scrollY / COLLAPSE_AT);
  const headerScale = Math.max(0.92, 1 - scrollY / (COLLAPSE_AT * 8));
  const headerHeight = collapsed ? 0 : 'auto';

  const hasFilters = filterState.category || filterState.minPrice || filterState.maxPrice < 200000 || filterState.sort !== 'newest';

  const categories = getTrendingCategories();

  return (
    <>
      {/* ── Collapsible Header (title + search) ──────────────────────────── */}
      <div
        className="px-4 overflow-hidden"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
          opacity: headerOpacity,
          transform: `scale(${headerScale})`,
          transformOrigin: 'top center',
          maxHeight: collapsed ? 0 : 200,
          transition: 'max-height 0.25s ease, opacity 0.2s ease, transform 0.2s ease',
          pointerEvents: collapsed ? 'none' : 'auto',
        }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[28px] font-bold font-display text-edu-text tracking-tight leading-tight">
              Vazifalar
            </h1>
            <p className="text-[13px] text-edu-muted font-medium mt-0.5">
              O'zingizga mos ishni toping
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setFilterOpen(true); hapticLight(); }}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center border shadow-sm transition-colors',
              hasFilters
                ? 'bg-edu-primary text-white border-transparent'
                : 'bg-edu-surface border-edu-border text-edu-text'
            )}
          >
            <SlidersHorizontal size={18} />
            {hasFilters && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-edu-urgent rounded-full border border-edu-bg" />
            )}
          </motion.button>
        </div>

        {/* Search bar */}
        <div className="relative group mb-2">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-edu-muted group-focus-within:text-edu-primary transition-colors duration-200">
            <Search size={17} />
          </div>
          <input
            id="taskSearchInput"
            type="text"
            placeholder="Vazifa yoki ko'nikma qidirish..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="w-full h-11 bg-edu-surface/80 border border-edu-border/70 rounded-2xl pl-11 pr-11 text-[14.5px] font-medium outline-none focus:ring-2 focus:ring-edu-primary/20 focus:border-edu-primary/60 transition-all text-edu-text placeholder:text-edu-muted/60 shadow-sm"
          />
          <AnimatePresence>
            {localQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.12 }}
                onClick={() => { setLocalQuery(''); hapticLight(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-edu-muted/20 rounded-full flex items-center justify-center text-edu-muted active:scale-90 transition-transform"
              >
                <X size={13} strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Sticky Category Island — iOS Telegram Folders style ───────────── */}
      <div className="sticky top-0 z-30 py-2.5 px-4 pointer-events-none">
        {/*
          Floating glass island — 4 tarafdan uqmoqda,
          backdrop-blur + subtle border + shadow
        */}
        <div
          className={cn(
            'pointer-events-auto',
            'relative rounded-2xl overflow-hidden',
            // Glass island container
            'bg-edu-surface/70 dark:bg-edu-surface/60',
            'backdrop-blur-2xl',
            'border border-white/30 dark:border-white/10',
            'shadow-[0_4px_24px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)]',
            'dark:shadow-[0_4px_24px_rgba(0,0,0,0.30)]'
          )}
        >
          {/* Shimmer gloss line at top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent pointer-events-none" />

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="flex gap-1 overflow-x-auto scrollbar-hide px-2 py-2 items-center"
          >
            {/* "Barchasi" chip */}
            <span data-active={!filterState.category ? 'true' : 'false'}>
              <CategoryChip
                label="Barchasi"
                active={!filterState.category}
                onClick={() => { setFilter('category', ''); hapticLight(); }}
              />
            </span>

            {/* Category chips */}
            {categories.map((cat) => (
              <span
                key={cat.value}
                data-active={filterState.category === cat.value ? 'true' : 'false'}
              >
                <CategoryChip
                  label={`${cat.emoji} ${cat.label}`}
                  active={filterState.category === cat.value}
                  onClick={() => { setFilter('category', cat.value); hapticLight(); }}
                />
              </span>
            ))}

            {/* "Ko'proq" button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => { setFilterOpen(true); hapticLight(); }}
              className="px-4 h-[34px] rounded-full text-[13px] font-bold text-edu-primary whitespace-nowrap flex-shrink-0 hover:bg-edu-primary/10 active:scale-95 transition-colors"
            >
              Ko'proq...
            </motion.button>
          </div>

          {/* Right fade — indicates scrollability */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-edu-surface/80 to-transparent pointer-events-none rounded-r-2xl" />
        </div>
      </div>
    </>
  );
}
