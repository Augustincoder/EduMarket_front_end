import { Search, SlidersHorizontal, X } from 'lucide-react';
import { FilterChip } from '../../../../components/ui/Chip';
import { useCategoryStore } from '../../../../store/categoryStore';
import { hapticLight } from '../../../../lib/telegram';
import { cn } from '../../../../lib/utils';

export function TaskSearchHeader({
  localQuery,
  setLocalQuery,
  setIsFocused,
  filterState,
  setFilter,
  setFilterOpen
}) {
  const getTrendingCategories = useCategoryStore(s => s.getTrendingCategories);

  return (
    <>
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

      <div 
        className="sticky top-0 z-30 mb-2 py-4 pointer-events-none"
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 items-center pointer-events-auto">
          <div className="flex gap-2 p-1.5 bg-edu-surface/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-lg items-center min-w-max">
            <FilterChip
              label="Barchasi"
              active={!filterState.category}
              onClick={() => { setFilter('category', ''); hapticLight(); }}
              className={cn(
                "rounded-full px-5 h-9 text-[13px] font-bold transition-all duration-300 border-none",
                !filterState.category 
                  ? "bg-edu-primary text-white shadow-ios-primary" 
                  : "bg-transparent text-edu-text hover:bg-black/5"
              )}
            />
            {getTrendingCategories().map((cat) => (
              <FilterChip
                key={cat.value}
                label={`${cat.emoji} ${cat.label}`}
                active={filterState.category === cat.value}
                onClick={() => { setFilter('category', cat.value); hapticLight(); }}
                className={cn(
                  "rounded-full px-5 h-9 text-[13px] font-bold transition-all duration-300 border-none flex-shrink-0",
                  filterState.category === cat.value 
                    ? "bg-edu-primary text-white shadow-ios-primary" 
                    : "bg-transparent text-edu-text hover:bg-black/5"
                )}
              />
            ))}
            <button
              onClick={() => { setFilterOpen(true); hapticLight(); }}
              className="rounded-full px-5 h-9 text-[13px] font-bold text-edu-primary whitespace-nowrap shrink-0 hover:bg-edu-primary/10 active:scale-95 transition-all"
            >
              Barchasi...
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
