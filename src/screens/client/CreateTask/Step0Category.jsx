import { useCategoryStore } from '../../../store/categoryStore';
import { useCreateTaskStore } from '../../../store/useCreateTaskStore';
import { hapticLight } from '../../../lib/telegram';

export function Step0Category() {
  const categoryStore = useCategoryStore(s => s.categories);
  const { category, updateField, nextStep } = useCreateTaskStore();

  const handleSelect = (val) => {
    hapticLight();
    updateField('category', val);
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  return (
    <div className="flex flex-col h-full bg-edu-bg animate-in slide-in-from-right-8 duration-300">
      <div className="px-6 pt-6 pb-2 shrink-0">
        <h2 className="text-[26px] font-bold font-display text-edu-text tracking-tight mb-2">Qaysi yo'nalishda yordam kerak?</h2>
        <p className="text-[13px] text-edu-muted font-medium">Bu yordam orqali kerakli mutaxassisni tezroq topasiz</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 mt-4 scrollbar-hide">
        <div className="grid grid-cols-2 gap-3 pb-8">
          {categoryStore.map((cat) => {
          const isSelected = category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => handleSelect(cat.value)}
              className={`p-4 rounded-2xl border text-left transition-all active:scale-95 ${
                isSelected 
                  ? 'bg-edu-primary/10 border-edu-primary text-edu-primary shadow-sm' 
                  : 'bg-edu-surface border-edu-border/20 text-edu-text'
              }`}
            >
              <div className="text-2xl mb-2">{cat.emoji}</div>
              <div className={`text-sm ${isSelected ? 'font-bold' : 'font-semibold'}`}>
                {cat.label}
              </div>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
