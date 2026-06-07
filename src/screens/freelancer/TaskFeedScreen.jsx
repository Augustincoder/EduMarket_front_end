// src/screens/TaskFeedScreen.jsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import TaskCard from '../../components/cards/TaskCard';
import { FilterChip } from '../../components/ui/Chip';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { TaskCardSkeleton } from '../../components/ui/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { useTaskFeed } from '../../hooks/useTasks';
import { useUiStore } from '../../store/uiStore';
import { useDebounce } from '../../hooks/useDebounce';
import { CATEGORIES } from '../../lib/constants';
import { hapticLight } from '../../lib/telegram';
import { cn } from '../../lib/utils';

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Eng yangi' },
  { value: 'priceAsc', label: 'Narxi ↑' },
  { value: 'priceDesc', label: 'Narxi ↓' },
];

export default function TaskFeedScreen() {
  const [isFocused, setIsFocused] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterState = useUiStore((s) => s.filterState);
  const setFilter = useUiStore((s) => s.setFilter);
  const resetFilters = useUiStore((s) => s.resetFilters);

  const [localQuery, setLocalQuery] = useState('');
  const debouncedQuery = useDebounce(localQuery, 400);

  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches')) || []; }
    catch { return []; }
  });

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
    data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage,
  } = useTaskFeed(filters);

  const allTasks = data?.pages.flatMap((p) => p.tasks) ?? [];

  const parentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!parentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      if (scrollHeight - scrollTop <= clientHeight + 200 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
    const el = parentRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <PageLayout className="h-dvh flex flex-col overflow-hidden" scrollable={false}>
      {/* ── Fixed Header (Search + Category) ── */}
      <div className="z-30 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-black/[0.03] dark:border-white/[0.05] shadow-sm shrink-0">
        
        {/* Top Row: Title & Filter */}
        <div className="px-4 pt-5 pb-2 flex items-center justify-between">
          <h1 className="text-[26px] font-black font-display text-gray-900 dark:text-white tracking-tight">
            Vazifalar
          </h1>
          <button
            onClick={() => { setFilterOpen(true); hapticLight(); }}
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 border",
              (filterState.category || filterState.minPrice || filterState.maxPrice < 200000 || filterState.sort !== 'newest')
                ? "bg-[#007AFF]/10 border-[#007AFF]/20 text-[#007AFF] shadow-sm"
                : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600"
            )}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Search Bar Row */}
        <div className="px-4 pb-3 pt-1">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#007AFF] transition-colors">
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
              className="w-full h-11 bg-gray-100/80 dark:bg-white/5 border-none rounded-2xl pl-11 pr-11 text-[15px] font-medium outline-none focus:ring-2 focus:ring-[#007AFF]/10 focus:bg-white dark:focus:bg-white/10 transition-all"
            />
            {localQuery && (
              <button 
                onClick={() => { setLocalQuery(''); hapticLight(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-300 dark:bg-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
              >
                <X size={14} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Row (Minimalist) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-4">
          <FilterChip
            label="Barchasi"
            active={!filterState.category}
            onClick={() => { setFilter('category', ''); hapticLight(); }}
            className="rounded-xl px-4 h-8 text-[12px] font-bold border-transparent"
          />
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat.value}
              label={`${cat.emoji} ${cat.label}`}
              active={filterState.category === cat.value}
              onClick={() => { setFilter('category', cat.value); hapticLight(); }}
              className="rounded-xl px-4 h-8 text-[12px] font-bold border-transparent"
            />
          ))}
        </div>
      </div>

      {/* ── Task List Container ── */}
      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-nav bg-[#F2F2F7] dark:bg-black scrollbar-hide relative"
      >
        {/* Recent Searches Overlay */}
        {isFocused && !localQuery && recentSearches.length > 0 && (
          <div className="absolute inset-0 z-40 bg-white/60 dark:bg-black/60 backdrop-blur-md animate-fade-in px-4 py-4">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-2xl border border-black/5 dark:border-white/5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                Oxirgi qidiruvlar
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(q => (
                  <button
                    key={q}
                    onClick={() => { setLocalQuery(q); hapticLight(); }}
                    className="px-4 py-2 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 text-[14px] font-bold rounded-2xl flex items-center gap-2 active:scale-95 transition-all border border-gray-100 dark:border-white/5 hover:border-[#007AFF]/30"
                  >
                    <Search size={14} className="text-gray-400" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <TaskCardSkeleton key={i} />)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="rounded-2xl h-13 font-black uppercase tracking-widest text-[12px] bg-gray-100 dark:bg-white/5 border-none"
            >
              Tozalash
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={() => { setFilterOpen(false); hapticLight(); }} 
              className="rounded-2xl h-13 font-black uppercase tracking-widest text-[12px] bg-[#007AFF] shadow-ios-primary"
            >
              Qo'llash
            </Button>
          </div>
        }
      >
        <div className="space-y-8 pb-4">
          {/* Sorting Section: Horizontal Segmented Control */}
          <div>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4 px-1">Saralash</p>
            <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setFilter('sort', s.value); hapticLight(); }}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-[13px] font-black transition-all duration-300 active:scale-95',
                    filterState.sort === s.value
                      ? 'bg-white dark:bg-white/10 text-[#007AFF] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories: Improved Grid */}
          <div>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4 px-1">Kategoriya</p>
            <div className="grid grid-cols-2 gap-2">
              <FilterChip 
                label="Barchasi" 
                active={!filterState.category} 
                onClick={() => setFilter('category', '')} 
                className="rounded-xl h-11 px-4 text-[13px] font-bold border-transparent bg-gray-50 dark:bg-white/5" 
              />
              {CATEGORIES.map((cat) => (
                <FilterChip
                  key={cat.value}
                  label={`${cat.emoji} ${cat.label}`}
                  active={filterState.category === cat.value}
                  onClick={() => setFilter('category', cat.value)}
                  className="rounded-xl h-11 px-4 text-[13px] font-bold border-transparent bg-gray-50 dark:bg-white/5"
                />
              ))}
            </div>
          </div>

          {/* Pricing: Clean Inputs */}
          <div>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4 px-1">Narx oralig'i (UZS)</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-2xl px-5 py-4 border border-black/[0.03] dark:border-white/[0.05] focus-within:border-[#007AFF]/30 transition-all">
                <input
                  type="number"
                  placeholder="Min"
                  value={filterState.minPrice || ''}
                  onChange={(e) => setFilter('minPrice', Number(e.target.value))}
                  className="bg-transparent w-full text-[15px] font-black outline-none placeholder:text-gray-400"
                />
              </div>
              <div className="w-4 h-[1px] bg-gray-300 dark:bg-white/10" />
              <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-2xl px-5 py-4 border border-black/[0.03] dark:border-white/[0.05] focus-within:border-[#007AFF]/30 transition-all">
                <input
                  type="number"
                  placeholder="Max"
                  value={filterState.maxPrice < 200000 ? filterState.maxPrice : ''}
                  onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
                  className="bg-transparent w-full text-[15px] font-black outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </BottomSheet>
    </PageLayout>
  );
}
