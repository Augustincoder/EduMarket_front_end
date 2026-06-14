import { Search } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { BottomSheet } from '../../../../components/ui/BottomSheet';
import { FilterChip } from '../../../../components/ui/Chip';
import { useCategoryStore } from '../../../../store/categoryStore';
import { hapticLight } from '../../../../lib/telegram';
import { cn } from '../../../../lib/utils';
import { useState } from 'react';

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Eng yangi' },
  { value: 'priceAsc', label: 'Narxi ↑' },
  { value: 'priceDesc', label: 'Narxi ↓' },
];

export function TaskFilterSheet({
  filterOpen,
  setFilterOpen,
  filterState,
  setFilter,
  resetFilters
}) {
  const [categoryFilterSearch, setCategoryFilterSearch] = useState('');

  return (
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
        {/* Sorting Section */}
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

        {/* Categories Section */}
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

        {/* Pricing Section */}
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
  );
}
