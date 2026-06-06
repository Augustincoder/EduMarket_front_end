// src/screens/TaskFeedScreen.jsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput } from '../../components/forms/TextInput';
import { Button } from '../../components/ui/Button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import TaskCard from '../../components/cards/TaskCard';
import { FilterChip } from '../../components/ui/Chip';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { TaskCardSkeleton } from '../../components/ui/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch';
import { useTaskFeed } from '../../hooks/useTasks';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useUiStore } from '../../store/uiStore';
import { useDebounce } from '../../hooks/useDebounce';
import { CATEGORIES } from '../../lib/constants';
import { hapticLight } from '../../lib/telegram';
import { cn } from '../../lib/utils';
import { useRef, useEffect } from 'react';

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Eng yangi' },
  { value: 'priceAsc', label: 'Narxi ↑' },
  { value: 'priceDesc','label': 'Narxi ↓' },
];

export default function TaskFeedScreen() {
  const navigate = useNavigate();
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

  // We keep simple mapping for now to avoid virtualization bugs reported by user
  // Infinite scroll is handled by manual check
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
    <PageLayout className="flex flex-col h-full overflow-hidden" scrollable={false}>
      {/* ── Fixed Header Block (Search + Chips + Sort) ── */}
      <div className="z-30 bg-edu-bg/95 backdrop-blur-xl border-b border-edu-border/40 shadow-sm shrink-0">
        
        {/* Navigation Bar */}
        <div className="h-[60px] flex items-center justify-between px-4">
          <div className={cn(
            "flex-1 flex items-center transition-all duration-300",
            (isFocused || localQuery) ? "mr-2" : ""
          )}>
            {(isFocused || localQuery) ? (
              <div className="flex-1 relative animate-fade-in">
                <TextInput
                  id="taskSearchInput"
                  placeholder="Vazifa qidirish..."
                  value={localQuery}
                  onValueChange={setLocalQuery}
                  onFocus={() => setIsFocused(true)}
                  startContent={<Search size={16} className="text-gray-400" />}
                  className="bg-gray-100 dark:bg-white/5 border-none h-10 rounded-2xl pl-10 pr-10 text-[15px]"
                  containerClassName="shadow-none border-none ring-0 focus-within:ring-2 focus-within:ring-[#007AFF]/20"
                />
                {localQuery && (
                  <button 
                    onClick={() => setLocalQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 dark:bg-white/20 rounded-full flex items-center justify-center text-white"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                )}
              </div>
            ) : (
              <h1 className="text-2xl font-black font-display text-gray-900 dark:text-white tracking-tight animate-fade-in">
                Vazifalar
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {!(isFocused || localQuery) && (
              <button
                onClick={() => {
                  setIsFocused(true);
                  setTimeout(() => document.getElementById('taskSearchInput')?.focus(), 50);
                }}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center active:scale-90 transition-all"
              >
                <Search size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
            )}
            
            {(isFocused || localQuery) ? (
               <button 
                onClick={() => {
                  setLocalQuery('');
                  setIsFocused(false);
                }}
                className="text-[15px] font-bold text-[#007AFF] px-2"
               >
                 Bekor qilish
               </button>
            ) : (
              <button
                onClick={() => setFilterOpen(true)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all border",
                  (filterState.category || filterState.minPrice || filterState.maxPrice < 200000)
                    ? "bg-[#007AFF]/10 border-[#007AFF]/20 text-[#007AFF]"
                    : "bg-gray-100 dark:bg-white/5 border-transparent text-gray-700 dark:text-gray-300"
                )}
              >
                <SlidersHorizontal size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-3">
          <FilterChip
            label="Barchasi"
            active={!filterState.category}
            onClick={() => { setFilter('category', ''); hapticLight(); }}
            className="rounded-xl px-4 h-8 text-[13px] font-bold"
          />
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat.value}
              label={`${cat.emoji} ${cat.label}`}
              active={filterState.category === cat.value}
              onClick={() => { setFilter('category', cat.value); hapticLight(); }}
              className="rounded-xl px-4 h-8 text-[13px] font-bold"
            />
          ))}
        </div>

        {/* Sort Bar */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => { setFilter('sort', s.value); hapticLight(); }}
              className={cn(
                'text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all whitespace-nowrap active:scale-95',
                filterState.sort === s.value
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-transparent shadow-md'
                  : 'bg-white dark:bg-[#1C1C1E] text-gray-500 border-gray-100 dark:border-white/5'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Task List Container ── */}
      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-nav bg-[#F2F2F7] dark:bg-black scrollbar-hide"
      >
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
        
        {/* Recent Searches Overlay */}
        {isFocused && !localQuery && recentSearches.length > 0 && (
          <div className="absolute inset-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md animate-fade-in p-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Oxirgi qidiruvlar
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map(q => (
                <button
                  key={q}
                  onClick={() => { setLocalQuery(q); hapticLight(); }}
                  className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-[14px] font-bold rounded-2xl flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Search size={14} className="text-gray-400" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Filter BottomSheet ── */}
      <BottomSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filtrlash"
      >
        <div className="space-y-6 py-4">
          <div>
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3">Kategoriya</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="Barchasi" active={!filterState.category} onClick={() => setFilter('category', '')} className="rounded-xl h-9" />
              {CATEGORIES.map((cat) => (
                <FilterChip
                  key={cat.value}
                  label={`${cat.emoji} ${cat.label}`}
                  active={filterState.category === cat.value}
                  onClick={() => setFilter('category', cat.value)}
                  className="rounded-xl h-9"
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3">Narx oralig'i (UZS)</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-2xl px-4 py-3 border border-transparent focus-within:border-[#007AFF]/30 transition-all">
                <input
                  type="number"
                  placeholder="Min"
                  value={filterState.minPrice || ''}
                  onChange={(e) => setFilter('minPrice', Number(e.target.value))}
                  className="bg-transparent w-full text-[15px] font-bold outline-none"
                />
              </div>
              <div className="w-4 h-[2px] bg-gray-300 dark:bg-white/10" />
              <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-2xl px-4 py-3 border border-transparent focus-within:border-[#007AFF]/30 transition-all">
                <input
                  type="number"
                  placeholder="Max"
                  value={filterState.maxPrice < 200000 ? filterState.maxPrice : ''}
                  onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
                  className="bg-transparent w-full text-[15px] font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="secondary" fullWidth onClick={() => { resetFilters(); setFilterOpen(false); }} className="rounded-2xl h-12 font-black uppercase tracking-widest text-[13px]">
              Tozalash
            </Button>
            <Button variant="primary" fullWidth onClick={() => { setFilterOpen(false); hapticLight(); }} className="rounded-2xl h-12 font-black uppercase tracking-widest text-[13px] bg-[#007AFF]">
              Qo'llash
            </Button>
          </div>
        </div>
      </BottomSheet>
    </PageLayout>
  );
}
