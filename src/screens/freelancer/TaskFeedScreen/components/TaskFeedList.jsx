import { Search, AlertOctagon } from 'lucide-react';
import TaskCard from '../../../../components/cards/TaskCard';
import { TaskCardSkeleton } from '../../../../components/ui/SkeletonCard';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Button } from '../../../../components/ui/Button';
import { useCategoryStore } from '../../../../store/categoryStore';
import { hapticLight } from '../../../../lib/telegram';

export function TaskFeedList({
  isFocused,
  localQuery,
  recentSearches,
  setLocalQuery,
  setIsFocused,
  setFilter,
  isLoading,
  error,
  allTasks,
  refetch,
  filters,
  filterState,
  resetFilters,
  isFetchingNextPage
}) {
  return (
    <div className="px-4 pt-3 pb-nav relative min-h-[60vh]">
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
  );
}
