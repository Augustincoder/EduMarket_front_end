import { useState, useMemo } from 'react';
import { useCategoryStore } from '../../../store/categoryStore';
import { useCreateTaskStore } from '../../../store/useCreateTaskStore';
import { hapticLight } from '../../../lib/telegram';
import { Search } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function Step0Category() {
  const categoryStoreRaw = useCategoryStore(s => s.categories);
  const categoryStore = useMemo(() => categoryStoreRaw || [], [categoryStoreRaw]);
  const { category, updateField, nextStep } = useCreateTaskStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (val) => {
    hapticLight();
    updateField('category', val);
    setTimeout(() => {
      nextStep();
    }, 200);
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categoryStore;
    const lower = searchQuery.toLowerCase();
    return categoryStore.filter(c => 
      c.label.toLowerCase().includes(lower) || 
      (c.keywords && c.keywords.some(k => k.toLowerCase().includes(lower)))
    );
  }, [categoryStore, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-edu-bg animate-fade-in">
      {/* Header Area (Sticky/Unscrollable) */}
      <div className="px-5 pt-6 pb-4 shrink-0 bg-edu-bg/95 backdrop-blur-xl z-10 sticky top-0 border-b border-edu-border/50">
        <h2 className="text-2xl font-extrabold font-display text-edu-text tracking-tight mb-1.5">Yordam yo'nalishi</h2>
        <p className="text-[13px] text-edu-muted font-medium mb-4">Kerakli mutaxassisni topish uchun toifa tanlang</p>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-[18px] w-[18px] text-edu-muted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 bg-edu-surface border border-edu-border/60 rounded-xl text-[14px] font-medium text-edu-text placeholder:text-edu-muted/80 focus:ring-2 focus:ring-edu-primary/20 focus:border-edu-primary transition-all shadow-sm"
            placeholder="Kategoriya qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable Category List */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32 scrollbar-hide">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <Search className="w-10 h-10 mb-3 text-edu-muted" />
            <p className="text-[14px] font-semibold text-edu-text">Natija topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredCategories.map((cat) => {
              const isSelected = category === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleSelect(cat.value)}
                  className={cn(
                    "flex flex-col p-3.5 rounded-2xl border text-left transition-all active:scale-95 group",
                    isSelected 
                      ? "bg-edu-primary/10 border-edu-primary/50 text-edu-primary shadow-sm" 
                      : "bg-edu-surface border-edu-border/40 text-edu-text hover:border-edu-primary/30 hover:shadow-sm"
                  )}
                >
                  <div className="text-2xl mb-1.5 leading-none bg-black/5 dark:bg-white/5 w-10 h-10 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                    {cat.emoji}
                  </div>
                  <div className={cn("text-[13px] leading-tight", isSelected ? "font-bold" : "font-semibold")}>
                    {cat.label}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

