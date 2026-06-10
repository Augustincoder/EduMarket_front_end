import { CATEGORIES } from '../../../lib/constants';
import { useCreateTaskStore } from '../../../store/useCreateTaskStore';
import { hapticLight } from '../../../lib/telegram';

export function Step0Category() {
  const { category, updateField, nextStep } = useCreateTaskStore();

  const handleSelect = (val) => {
    hapticLight();
    updateField('category', val);
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-edu-text">Qanday yordam kerak?</h2>
        <p className="text-sm text-edu-muted">Vazifangiz turini tanlang</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => {
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
  );
}
