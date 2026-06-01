// src/screens/TaskFeedScreen.jsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput } from '../components/forms/TextInput';
import { Button } from '../components/ui/Button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { PageLayout } from '../components/layout/PageLayout';
import TaskCard from '../components/cards/TaskCard';
import { FilterChip } from '../components/ui/Chip';
import { BottomSheet } from '../components/ui/BottomSheet';
import { TaskCardSkeleton } from '../components/ui/SkeletonCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ToggleSwitch } from '../components/forms/ToggleSwitch';
import { useTaskFeed } from '../hooks/useTasks';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useUiStore } from '../store/uiStore';
import { useDebounce } from '../hooks/useDebounce';
import { CATEGORIES } from '../lib/constants';
import { hapticLight } from '../lib/telegram';
import { cn } from '../lib/utils';

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Eng yangi' },
  { value: 'priceAsc', label: 'Narxi ↑' },
  { value: 'priceDesc','label': 'Narxi ↓' },
];

export default function TaskFeedScreen() {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { filterState, setFilter, resetFilters } = useUiStore();

  const [localQuery, setLocalQuery] = useState('');
  const debouncedQuery = useDebounce(localQuery, 400);

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

  const sentinelRef = useInfiniteScroll(
    useCallback(() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }, [hasNextPage, isFetchingNextPage, fetchNextPage]),
    { enabled: hasNextPage }
  );

  const allTasks = data?.pages.flatMap((p) => p.tasks) ?? [];

  return (
    <PageLayout>
      {/* ── Morphing iOS Navigation Bar ──────────────── */}
      <div className="sticky top-0 z-30 w-full max-w-[430px] h-[56px] bg-edu-surface/85 backdrop-blur-2xl border-b border-edu-border/50 overflow-hidden">
        
        {/* Normal Header State */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-between px-4 transition-all duration-400 ease-out",
            (isFocused || localQuery) ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
          )}
        >
          <h1 className="text-[22px] font-black font-display text-edu-text tracking-tight">
            Vazifalar
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                hapticLight();
                setIsFocused(true);
                setTimeout(() => document.getElementById('taskSearchInput')?.focus(), 50);
              }}
              className="w-9 h-9 rounded-full bg-edu-muted/10 flex items-center justify-center active-bounce hover:bg-edu-muted/15 transition-colors border border-black/5 dark:border-white/5"
            >
              <Search size={18} className="text-edu-text" />
            </button>
            <button
              onClick={() => {
                hapticLight();
                setFilterOpen(true);
              }}
              className="w-9 h-9 rounded-full bg-edu-muted/10 flex items-center justify-center active-bounce relative hover:bg-edu-muted/15 transition-colors border border-black/5 dark:border-white/5"
            >
              <SlidersHorizontal size={18} className="text-edu-text" />
              {(filterState.category || filterState.minPrice || filterState.maxPrice < 200000) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-edu-primary border-2 border-edu-surface rounded-full shadow-sm" />
              )}
            </button>
          </div>
        </div>

        {/* Search State */}
        <div
          className={cn(
            "absolute inset-0 flex items-center px-2 transition-all duration-400 ease-out",
            (isFocused || localQuery) ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          )}
        >
          <div className="flex-1 px-1">
            <TextInput
              id="taskSearchInput"
              placeholder="Vazifa qidirish..."
              value={localQuery}
              onValueChange={setLocalQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => !localQuery && setIsFocused(false)}
              startIcon={<Search size={16} className="text-edu-muted" />}
              className="bg-transparent border-none shadow-none focus-within:ring-0"
              containerClassName="bg-edu-bg border-none rounded-[16px] shadow-sm h-10"
            />
          </div>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              hapticLight();
              setLocalQuery('');
              setIsFocused(false);
              document.activeElement?.blur();
            }}
            className="w-10 h-10 flex items-center justify-center text-edu-text active-bounce"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Category filter chips ───────────────────── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3">
        <FilterChip
          label="Barchasi"
          active={!filterState.category}
          onClick={() => { hapticLight(); setFilter('category', ''); }}
        />
        {CATEGORIES.map((cat) => (
          <FilterChip
            key={cat.value}
            label={`${cat.emoji} ${cat.label}`}
            active={filterState.category === cat.value}
            onClick={() => { hapticLight(); setFilter('category', cat.value); }}
          />
        ))}
      </div>

      {/* ── Sort ────────────────────────────────────── */}
      <div className="flex gap-2 px-4 pb-3">
        {SORT_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => { hapticLight(); setFilter('sort', s.value); }}
            className={[
              'text-xs font-semibold px-3 py-1.5 rounded-full border transition-all press-scale',
              filterState.sort === s.value
                ? 'bg-edu-primary text-white border-edu-primary'
                : 'bg-edu-surface text-edu-muted border-edu-border',
            ].join(' ')}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Task list ───────────────────────────────── */}
      <div className="px-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <TaskCardSkeleton key={i} />)
        ) : allTasks.length === 0 ? (
          <EmptyState
            emoji="📋"
            title="Vazifalar topilmadi"
            subtitle={Object.values(filterState).some(Boolean) 
              ? "Siz tanlagan filtrlar bo'yicha vazifa topilmadi." 
              : "Hozircha vazifalar yo'q. Birinchilardan bo'lib o'z vazifangizni e'lon qiling va mutaxassislarni jalb qiling!"}
            action={Object.values(filterState).some(Boolean) ? resetFilters : () => navigate('/tasks/create')}
            actionLabel={Object.values(filterState).some(Boolean) ? "Filtrlarni tozalash" : "Vazifa yaratish 🚀"}
          />
        ) : (
          allTasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
        {isFetchingNextPage && <TaskCardSkeleton />}
      </div>

      {/* ── Filter BottomSheet ──────────────────────── */}
      <BottomSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filterlar"
      >
        <div className="space-y-5 py-2">
          <div>
            <p className="text-sm font-semibold text-edu-text mb-2">Kategoriya</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="Barchasi" active={!filterState.category} onClick={() => setFilter('category', '')} />
              {CATEGORIES.map((cat) => (
                <FilterChip
                  key={cat.value}
                  label={`${cat.emoji} ${cat.label}`}
                  active={filterState.category === cat.value}
                  onClick={() => setFilter('category', cat.value)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-edu-text mb-2">Narx oralig'i</p>
            <div className="flex items-center gap-3">
              <TextInput
                className="flex-1"
                type="number"
                placeholder="Min"
                value={filterState.minPrice || ''}
                onChange={(e) => setFilter('minPrice', Number(e.target.value))}
              />
              <span className="text-edu-muted">—</span>
              <TextInput
                className="flex-1"
                type="number"
                placeholder="Max"
                value={filterState.maxPrice < 200000 ? filterState.maxPrice : ''}
                onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => { resetFilters(); setFilterOpen(false); }}>
              Tozalash
            </Button>
            <Button variant="primary" fullWidth onClick={() => setFilterOpen(false)}>
              Qo'llash
            </Button>
          </div>
        </div>
      </BottomSheet>
    </PageLayout>
  );
}
