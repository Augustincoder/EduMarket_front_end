export function GigStepperHeader({ step }) {
  return (
    <div className="flex items-center justify-between px-2 mb-2">
      <div className="flex items-center gap-2">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
          step === 1 ? 'bg-edu-primary text-white scale-110 shadow-lg shadow-edu-primary/20' : 'bg-edu-primary/20 text-edu-primary'
        }`}>
          1
        </span>
        <span className={`text-xs font-bold transition-all duration-300 ${step === 1 ? 'text-edu-text' : 'text-edu-muted'}`}>
          Asosiy ma'lumotlar
        </span>
      </div>
      <div className="flex-1 h-0.5 mx-3 bg-edu-border/30 rounded-full overflow-hidden">
        <div className={`h-full bg-edu-primary transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
          step === 2 ? 'bg-edu-primary text-white scale-110 shadow-lg shadow-edu-primary/20' : 'bg-edu-border/30 text-edu-muted'
        }`}>
          2
        </span>
        <span className={`text-xs font-bold transition-all duration-300 ${step === 2 ? 'text-edu-text' : 'text-edu-muted'}`}>
          Narx va muddat
        </span>
      </div>
    </div>
  );
}
