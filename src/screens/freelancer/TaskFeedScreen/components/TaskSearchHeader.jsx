// TaskSearchHeader.jsx — iOS Telegram Folders style sticky category island
// 🪄 Design Spells: spring-physics pill transition + floating island morph
import { useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCategoryStore } from '../../../../store/categoryStore';
import { hapticLight } from '../../../../lib/telegram';
import { cn } from '../../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Individual Category Chip ─────────────────────────────────────────────────
function CategoryChip({ label, active, onClick, chipRef }) {
  return (
    <motion.button
      ref={chipRef}
      onClick={onClick}
      whileTap={{ scale: 0.90 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      className={cn(
        'relative px-4 h-[34px] rounded-full text-[13px] font-bold whitespace-nowrap shrink-0',
        'outline-none select-none transition-colors duration-150',
        active ? 'text-white' : 'text-edu-text/70 hover:text-edu-text'
      )}
    >
      {/* 🪄 Shared layoutId pill morphs between chips */}
      {active && (
        <motion.span
          layoutId="cat-active-pill"
          className="absolute inset-0 rounded-full bg-edu-primary shadow-[0_2px_10px_rgba(var(--color-primary-rgb,99,102,241),0.45)]"
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
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
  const scrollRef  = useRef(null);
  const activeRef  = useRef(null);

  // Scroll active chip into view
  useEffect(() => {
    if (!scrollRef.current || !activeRef.current) return;
    activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [filterState.category]);

  const COLLAPSE_AT = 56;
  const collapsed   = scrollY > COLLAPSE_AT;
  // Clamp opacity/scale for the collapsible header block
  const headerOpacity = Math.max(0, 1 - (scrollY / COLLAPSE_AT));
  const headerScale   = Math.max(0.93, 1 - scrollY / (COLLAPSE_AT * 6));

  const hasFilters = filterState.category || filterState.minPrice || filterState.maxPrice < 200000 || filterState.sort !== 'newest';
  const categories = getTrendingCategories();

  return (
    <>
      {/* ── Collapsible Title + Search block ─────────────────────────────── */}
      <div
        className="px-4 overflow-hidden will-change-transform"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
          opacity: headerOpacity,
          transform: `scale(${headerScale})`,
          transformOrigin: 'top center',
          maxHeight: collapsed ? 0 : 200,
          paddingBottom: collapsed ? 0 : undefined,
          transition: 'max-height 0.28s cubic-bezier(.4,0,.2,1), opacity 0.22s ease, transform 0.22s ease, padding 0.22s ease',
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
            whileTap={{ scale: 0.88 }}
            onClick={() => { setFilterOpen(true); hapticLight(); }}
            className={cn(
              'relative w-10 h-10 rounded-full flex items-center justify-center border shadow-sm transition-colors',
              hasFilters
                ? 'bg-edu-primary text-white border-transparent'
                : 'bg-edu-surface border-edu-border text-edu-text'
            )}
          >
            <SlidersHorizontal size={18} />
            {hasFilters && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-edu-urgent rounded-full border-2 border-edu-bg" />
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

      {/* ── Sticky Category Island — 🪄 morphs like iOS bottom nav when scrolled ─ */}
      {/* 
        KEY FIX: This MUST be `position: sticky` with `top: 0` and its parent
        must be the scrollable container itself (not a child of it).
        We use inline style for sticky positioning to guarantee browser compatibility.
      */}
      <div
        style={{ position: 'sticky', top: 0, zIndex: 30 }}
        className="pointer-events-none flex justify-center w-full"
      >
        <motion.div
          animate={{
            width: collapsed ? '88%' : '100%',
            marginTop: collapsed ? '10px' : '0px',
            borderRadius: collapsed ? '24px' : '0px',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className={cn(
            'pointer-events-auto relative overflow-hidden',
            // Glass surface
            'bg-edu-surface/88 dark:bg-edu-surface/80',
            'backdrop-blur-2xl',
          )}
          style={{
            boxShadow: collapsed
              ? '0 8px 32px -8px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.04)'
              : '0 1px 0 rgba(0,0,0,0.06)',
            borderBottom: collapsed ? 'none' : '1px solid rgba(var(--color-border, 0,0,0),0.07)',
            border: collapsed ? '1px solid rgba(255,255,255,0.18)' : undefined,
          }}
        >
          {/* Shimmer top edge */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent pointer-events-none" />

          {/* Chips scroll row */}
          <div
            ref={scrollRef}
            className="flex gap-1 overflow-x-auto scrollbar-hide items-center py-2 px-3"
          >
            {/* All chip */}
            <CategoryChip
              label="Barchasi"
              active={!filterState.category}
              onClick={() => { setFilter('category', ''); hapticLight(); }}
              chipRef={!filterState.category ? activeRef : undefined}
            />

            {/* Category chips */}
            {categories.map((cat) => (
              <CategoryChip
                key={cat.value}
                label={`${cat.emoji} ${cat.label}`}
                active={filterState.category === cat.value}
                onClick={() => { setFilter('category', cat.value); hapticLight(); }}
                chipRef={filterState.category === cat.value ? activeRef : undefined}
              />
            ))}

            {/* More button */}
            <motion.button
              whileTap={{ scale: 0.90 }}
              onClick={() => { setFilterOpen(true); hapticLight(); }}
              className="px-4 h-[34px] rounded-full text-[13px] font-bold text-edu-primary whitespace-nowrap shrink-0 hover:bg-edu-primary/8 transition-colors relative"
            >
              Ko'proq...
            </motion.button>
          </div>

          {/* Right-side fade gradient — hints at scrollability */}
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-edu-surface/90 to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </>
  );
}
