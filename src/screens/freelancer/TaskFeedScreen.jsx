// src/screens/TaskFeedScreen.jsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X, AlertOctagon, ArrowUp } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from '../../components/cards/TaskCard';
import { FilterChip } from '../../components/ui/Chip';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { TaskCardSkeleton } from '../../components/ui/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { useTaskFeed } from '../../hooks/useTasks';
import { useUiStore } from '../../store/uiStore';
import { useDebounce } from '../../hooks/useDebounce';
import { useCategoryStore } from '../../store/categoryStore';
import { hapticLight } from '../../lib/telegram';
import { cn } from '../../lib/utils';

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Eng yangi' },
  { value: 'priceAsc', label: 'Narxi ↑' },
  { value: 'priceDesc', label: 'Narxi ↓' },
];

export default function TaskFeedScreen() {
  const getTrendingCategories = useCategoryStore(s => s.getTrendingCategories);
  const [isFocused, setIsFocused] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const filterState = useUiStore((s) => s.filterState);
  const setFilter = useUiStore((s) => s.setFilter);
  const resetFilters = useUiStore((s) => s.resetFilters);

  const [localQuery, setLocalQuery] = useState('');
  const debouncedQuery = useDebounce(localQuery, 400);

  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches')) || []; }
    catch { return []; }
  });

  const [categoryFilterSearch, setCategoryFilterSearch] = useState('');

  const addSearch = useCallback((query) => {
    if (!query) return;
    setRecentSearches(prev => {
      const newSearches = [query, ...prev.filter(q => q !== query)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      return newSearches;
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (debouncedQuery) addSearch(debouncedQuery);
  }, [debouncedQuery, addSearch]);

  const filters = {
    category:  filterState.category  || undefined,
    query:     debouncedQuery         || undefined,
    minPrice:  filterState.minPrice   || undefined,
    maxPrice:  filterState.maxPrice < 200000 ? filterState.maxPrice : undefined,
    status:    'OPEN',
    sort:      filterState.sort,
  };

  const {
    data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error, refetch
  } = useTaskFeed(filters);

  const allTasks = data?.pages ? data.pages.reduce((acc, p) => acc.concat(p.tasks || []), []) : [];

  const parentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!parentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      
      if (scrollTop > 250) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      if (scrollHeight - scrollTop <= clientHeight + 200 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
    const el = parentRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const scrollToTop = () => {
    hapticLight();
    parentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageLayout className="flex flex-col min-h-0 relative bg-edu-bg" scrollable={false}>
      {/* ── Scrollable Container ── */}
      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto scrollbar-hide relative"
      >
        {/* Title and Search (Scrolls away) */}
        <div className="px-4 pt-[calc(env(safe-area-inset-top)_+_20px)] pb-4 bg-edu-bg">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-[28px] font-bold font-display text-edu-text tracking-tight">
              Vazifalar
            </h1>
            <button
              onClick={() => { setFilterOpen(true); hapticLight(); }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border shadow-sm active:scale-95",
                (filterState.category || filterState.minPrice || filterState.maxPrice < 200000 || filterState.sort !== 'newest')
                  ? "bg-edu-primary text-white border-transparent"
                  : "bg-edu-surface border-edu-border text-edu-text"
              )}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          <div className="relative group z-10">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-edu-muted group-focus-within:text-edu-primary transition-colors">
              <Search size={18} />
            </div>
            <input
              id="taskSearchInput"
              type="text"
              placeholder="Vazifa yoki ko'nikma qidirish..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="w-full h-12 bg-edu-surface border border-edu-border rounded-xl pl-12 pr-12 text-[15px] font-medium outline-none focus:ring-2 focus:ring-edu-primary/20 focus:border-edu-primary/50 transition-all text-edu-text shadow-sm"
            />
            {localQuery && (
              <button 
                onClick={() => { setLocalQuery(''); hapticLight(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-edu-surface-2 rounded-full flex items-center justify-center text-edu-muted hover:text-edu-text active:scale-90 transition-all"
              >
                <X size={16} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Floating Glassmorphism Bar (Sticky) */}
        <div 
          className="sticky top-0 z-30 mb-4 bg-white/70 dark:bg-[#121212]/70 backdrop-blur-[24px] border-b border-black/5 dark:border-white/5 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#121212]/60"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-3 items-center">
            <FilterChip
              label="Barchasi"
              active={!filterState.category}
              onClick={() => { setFilter('category', ''); hapticLight(); }}
              className={cn(
                "rounded-full px-5 h-9 text-[13px] font-bold transition-all duration-300 border",
                !filterState.category 
                  ? "bg-edu-text text-edu-bg border-transparent shadow-sm" 
                  : "bg-edu-surface/50 text-edu-text border-black/5 dark:border-white/5 hover:bg-edu-surface"
              )}
            />
            {getTrendingCategories().map((cat) => (
              <FilterChip
                key={cat.value}
                label={`${cat.emoji} ${cat.label}`}
                active={filterState.category === cat.value}
                onClick={() => { setFilter('category', cat.value); hapticLight(); }}
                className={cn(
                  "rounded-full px-5 h-9 text-[13px] font-bold transition-all duration-300 border flex-shrink-0",
                  filterState.category === cat.value 
                    ? "bg-edu-text text-edu-bg border-transparent shadow-sm" 
                    : "bg-edu-surface/50 text-edu-text border-black/5 dark:border-white/5 hover:bg-edu-surface"
                )}
              />
            ))}
            <button
              onClick={() => { setFilterOpen(true); hapticLight(); }}
              className="rounded-full px-5 h-9 text-[13px] font-bold bg-edu-surface/50 text-edu-primary border border-black/5 dark:border-white/5 whitespace-nowrap shrink-0 hover:bg-edu-primary/10 active:scale-95 transition-all"
            >
              Barchasi...
            </button>
          </div>
        </div>

        {/* Main List Container */}
        <div className="px-4 pb-nav relative min-h-[60vh]">
        {/* Recent Searches Overlay */}
        {isFocused && !localQuery && recentSearches.length > 0 && (
          <div className="absolute inset-0 z-40 bg-edu-bg/80 backdrop-blur-md animate-fade-in px-4 py-4">
            <div className="bg-edu-surface rounded-xl p-6 shadow-lg border border-edu-border">
              <h3 className="text-[10px] font-bold text-edu-muted uppercase tracking-[0.2em] mb-4">
                Oxirgi qidiruvlar
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(q => (
                  <button
                    key={q}
                    onClick={() => { setLocalQuery(q); hapticLight(); }}
                    className="px-4 py-2 bg-edu-bg text-edu-text text-[14px] font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all border border-edu-border hover:border-edu-primary/30"
                  >
                    <Search size={14} className="text-edu-muted" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Predictive Search Overlay */}
        {isFocused && localQuery && (
          <div className="absolute inset-0 z-40 bg-edu-bg/90 backdrop-blur-md animate-fade-in px-4 py-4">
            <div className="bg-edu-surface rounded-xl p-4 shadow-lg border border-edu-border flex flex-col gap-4">
              
              {/* Category Matches */}
              {(() => {
                const matchedCats = useCategoryStore.getState().categories.filter(c => 
                  c.label.toLowerCase().includes(localQuery.toLowerCase()) || 
                  (c.skills && c.skills.some(s => s.name.toLowerCase().includes(localQuery.toLowerCase())))
                );
                if (matchedCats.length === 0) return null;
                return (
                  <div>
                    <h3 className="text-[10px] font-bold text-edu-muted uppercase tracking-[0.1em] mb-2 px-2">🏷 Kategoriyalar bo'yicha</h3>
                    <div className="flex flex-col gap-1">
                      {matchedCats.slice(0, 3).map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => { setFilter('category', cat.value); setLocalQuery(''); setIsFocused(false); hapticLight(); }}
                          className="text-left w-full px-4 py-3 rounded-xl bg-edu-bg border border-edu-border/50 hover:bg-edu-primary/5 hover:border-edu-primary/30 flex items-center gap-3 transition-colors"
                        >
                          <span className="w-8 h-8 rounded-lg bg-edu-surface flex items-center justify-center text-lg border border-edu-border">{cat.emoji}</span>
                          <div>
                            <p className="text-[14px] font-bold text-edu-text">{cat.label}</p>
                            <p className="text-[10px] text-edu-muted">Kategoriya ichiga kirish</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Task Match Prompt */}
              <div>
                <h3 className="text-[10px] font-bold text-edu-muted uppercase tracking-[0.1em] mb-2 px-2">🔍 Vazifalar ichidan qidirish</h3>
                <button
                  onClick={() => { setIsFocused(false); hapticLight(); }}
                  className="text-left w-full px-4 py-3 rounded-xl bg-edu-primary text-white hover:bg-edu-primary/90 flex items-center gap-3 transition-colors shadow-sm"
                >
                  <Search size={18} />
                  <div>
                    <p className="text-[14px] font-bold">"{localQuery}" ni qidirish</p>
                    <p className="text-[10px] opacity-80">Barcha ochiq vazifalar ro'yxatidan</p>
                  </div>
                </button>
              </div>

            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <TaskCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
             <div className="w-full bg-edu-surface border border-red-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
                  <AlertOctagon size={24} className="text-red-500" />
                </div>
                <h3 className="text-sm font-bold text-edu-text mb-1">Xatolik yuz berdi</h3>
                <p className="text-[11px] text-edu-muted font-medium mb-4 max-w-[200px]">E'lonlarni yuklashda tarmoq xatosi yuz berdi.</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl h-9 text-xs font-bold border-edu-border">
                  Qayta urinish
                </Button>
             </div>
          </div>
        ) : allTasks.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="Hech narsa topilmadi"
            subtitle={Object.values(filters).some(Boolean) 
              ? "Siz tanlagan filtrlar bo'yicha vazifalar mavjud emas." 
              : "Hozircha ochiq vazifalar yo'q. Keyinroq qayta urinib ko'ring."}
            action={Object.values(filterState).some(v => v && v !== 'newest') ? resetFilters : undefined}
            actionLabel="Filtrlarni tozalash"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {isFetchingNextPage && (
              <>
                <TaskCardSkeleton />
                <TaskCardSkeleton />
              </>
            )}
          </div>
        )}
      </div>
      {/* End of Main List Container */}
      </div>
      {/* End of Scrollable Container */}
      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)_+_80px)] right-4 w-12 h-12 rounded-full bg-edu-surface/80 backdrop-blur-md border border-edu-border shadow-lg flex items-center justify-center text-edu-text active:scale-95 transition-transform z-40"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Filter BottomSheet ── */}
      <BottomSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filtrlash va Saralash"
        footer={
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={() => { resetFilters(); setFilterOpen(false); }} 
              className="rounded-xl h-13 font-bold uppercase tracking-widest text-[12px] bg-edu-surface-2 border-none text-edu-text"
            >
              Tozalash
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={() => { setFilterOpen(false); hapticLight(); }} 
              className="rounded-xl h-13 font-bold uppercase tracking-widest text-[12px] bg-edu-primary shadow-ios-primary"
            >
              Qo'llash
            </Button>
          </div>
        }
      >
        <div className="space-y-8 pb-4">
          {/* Sorting Section: Horizontal Segmented Control */}
          <div>
            <p className="text-[10px] font-bold text-edu-muted uppercase tracking-[0.15em] mb-4 px-1">Saralash</p>
            <div className="flex p-1 bg-edu-surface-2 rounded-xl">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setFilter('sort', s.value); hapticLight(); }}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 active:scale-95',
                    filterState.sort === s.value
                      ? 'bg-edu-surface text-edu-primary shadow-sm'
                      : 'text-edu-muted hover:text-edu-text'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories: Improved Grid */}
          <div>
            <div className="flex justify-between items-center mb-3 px-1">
              <p className="text-[10px] font-bold text-edu-muted uppercase tracking-[0.15em]">Kategoriya</p>
              <div className="relative w-40">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-edu-muted" />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={categoryFilterSearch}
                  onChange={(e) => setCategoryFilterSearch(e.target.value)}
                  className="w-full h-7 bg-edu-surface-2 border border-transparent focus:border-edu-primary/30 rounded-lg pl-7 pr-2 text-[12px] font-medium outline-none text-edu-text transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
              <FilterChip 
                label="Barchasi" 
                active={!filterState.category} 
                onClick={() => setFilter('category', '')} 
                className="rounded-xl h-11 px-4 text-[13px] font-bold border-transparent bg-edu-bg" 
              />
              {useCategoryStore.getState().categories
                .filter(cat => cat.label.toLowerCase().includes(categoryFilterSearch.toLowerCase()))
                .map((cat) => {
                  const r = parseInt(cat.colorHex.slice(1, 3), 16) || 100;
                  const g = parseInt(cat.colorHex.slice(3, 5), 16) || 100;
                  const b = parseInt(cat.colorHex.slice(5, 7), 16) || 100;
                  const bgRgba = `rgba(${r}, ${g}, ${b}, ${filterState.category === cat.value ? '0.2' : '0.05'})`;
                  const borderRgba = `rgba(${r}, ${g}, ${b}, ${filterState.category === cat.value ? '0.5' : '0.1'})`;
                  const color = filterState.category === cat.value ? cat.colorHex : 'inherit';

                  return (
                    <button
                      key={cat.value}
                      onClick={() => { setFilter('category', cat.value); hapticLight(); }}
                      style={{ backgroundColor: bgRgba, borderColor: borderRgba, color }}
                      className={cn(
                        "rounded-xl h-11 px-4 text-[13px] font-bold border flex items-center justify-center gap-2 transition-all active:scale-95",
                        filterState.category === cat.value ? "shadow-sm" : ""
                      )}
                    >
                      <span>{cat.emoji}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
              })}
            </div>
          </div>

          {/* Pricing: Clean Inputs */}
          <div>
            <p className="text-[10px] font-bold text-edu-muted uppercase tracking-[0.15em] mb-4 px-1">Narx oralig'i (UZS)</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-edu-bg rounded-xl px-5 py-4 border border-edu-border focus-within:border-edu-primary/30 transition-all">
                <input
                  type="number"
                  placeholder="Min"
                  value={filterState.minPrice || ''}
                  onChange={(e) => setFilter('minPrice', Number(e.target.value))}
                  className="bg-transparent w-full text-[15px] font-bold outline-none placeholder:text-edu-muted text-edu-text"
                />
              </div>
              <div className="w-4 h-[1px] bg-edu-border" />
              <div className="flex-1 bg-edu-bg rounded-xl px-5 py-4 border border-edu-border focus-within:border-edu-primary/30 transition-all">
                <input
                  type="number"
                  placeholder="Max"
                  value={filterState.maxPrice < 200000 ? filterState.maxPrice : ''}
                  onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
                  className="bg-transparent w-full text-[15px] font-bold outline-none placeholder:text-edu-muted text-edu-text"
                />
              </div>
            </div>
          </div>
        </div>
      </BottomSheet>
    </PageLayout>
  );
}
