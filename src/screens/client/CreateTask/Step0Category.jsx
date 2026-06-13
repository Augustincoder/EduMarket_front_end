import { useState, useMemo } from 'react';
import { useCategoryStore } from '../../../store/categoryStore';
import { useCreateTaskStore } from '../../../store/useCreateTaskStore';
import { hapticLight } from '../../../lib/telegram';
import { Search, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SmartBriefModal } from './components/SmartBriefModal';

export function Step0Category() {
  const categoryStoreRaw = useCategoryStore(s => s.categories);
  const categoryStore = useMemo(() => categoryStoreRaw || [], [categoryStoreRaw]);
  const { category, updateField, nextStep } = useCreateTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

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
    <div className="flex flex-col bg-edu-bg animate-fade-in">
      {/* Header Area (Sticky/Unscrollable) */}
      <div className="px-5 pt-4 pb-4 shrink-0 bg-edu-bg/95 backdrop-blur-xl z-10 sticky top-0 border-b border-edu-border/50">
        
        {/* AI Action Button */}
        <button 
          onClick={() => { hapticLight(); setIsAiModalOpen(true); }}
          className="w-full mb-4 relative overflow-hidden rounded-2xl p-[2px] bg-gradient-to-r from-edu-primary via-edu-accent to-blue-500 active:scale-[0.98] transition-transform shadow-sm group"
        >
          <div className="bg-edu-surface w-full rounded-[14px] px-4 py-3.5 flex items-center justify-between group-hover:bg-opacity-90 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-edu-primary/10 flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-edu-primary" />
              </div>
              <div className="text-left">
                <p className="text-[15px] font-bold text-edu-text leading-tight">AI bilan yaratish</p>
                <p className="text-[12px] text-edu-muted font-medium mt-0.5">Tez va aqlli yordamchi</p>
              </div>
            </div>
            <div className="px-2 py-1 bg-edu-primary/10 rounded-lg text-[10px] font-extrabold text-edu-primary uppercase tracking-wider">Beta</div>
          </div>
        </button>

        {/* Modal instance */}
        <SmartBriefModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

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

      {/* Category List */}
      <div className="px-5 pt-4">
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
                    "flex flex-col p-3.5 rounded-lg border text-left transition-all active:scale-95 group",
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

