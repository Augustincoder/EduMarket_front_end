import { Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export function CategoryGrid({ categories, toggleMutation, deleteMutation, openModal }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories?.map((cat) => (
        <div 
          key={cat.id} 
          className="bg-slate-900 border border-slate-800 rounded-lg p-5 relative overflow-hidden group"
        >
          {/* Background Glow based on Category Color */}
          <div 
            className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20"
            style={{ backgroundColor: cat.colorHex }}
          />
          
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-700 shadow-inner">
                {cat.emoji}
              </span>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">{cat.label}</h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{cat.value}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-slate-900 shadow-sm"
                style={{ backgroundColor: cat.colorHex }}
                title={cat.colorHex}
              />
              <span className="text-[9px] uppercase tracking-wider font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                {cat.formType}
              </span>
            </div>
          </div>

          <div className="relative z-10 mb-4">
            <p className="text-xs font-medium text-slate-500 mb-1">Ko'nikmalar ({cat.skills?.length || 0}):</p>
            <div className="flex flex-wrap gap-1.5">
              {cat.skills?.slice(0, 5).map(s => (
                <span key={s.id} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {s.name}
                </span>
              ))}
              {cat.skills?.length > 5 && <span className="text-[10px] text-slate-500">+{cat.skills.length - 5}</span>}
              {cat.skills?.length === 0 && <span className="text-[10px] text-slate-600 italic">Mavjud emas</span>}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-slate-800/50 pt-4 mt-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleMutation.mutate({ id: cat.id, isActive: !cat.isActive })}
                className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md transition-colors ${
                  cat.isActive ? 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20' : 'text-slate-500 bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {cat.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {cat.isActive ? 'Faol' : 'Yashiringan'}
              </button>
              {cat.isTrending && (
                <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md flex items-center gap-1">
                  🔥 Trend
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => openModal(cat)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={() => {
                  if (window.confirm("Rostan ham o'chirmoqchimisiz? Agar unga bog'langan vazifalar bo'lsa xatolik berishi mumkin!")) {
                    deleteMutation.mutate(cat.id);
                  }
                }}
                className="w-8 h-8 rounded-lg bg-slate-800 text-red-400 flex items-center justify-center hover:text-white hover:bg-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
