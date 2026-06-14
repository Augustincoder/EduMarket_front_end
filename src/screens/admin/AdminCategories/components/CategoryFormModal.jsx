import { Dialog, DialogContent, DialogTitle } from '../../../../components/ui/AdminComponents';

export function CategoryFormModal({
  isModalOpen,
  setIsModalOpen,
  selectedCategory,
  formData,
  setFormData,
  saveMutation
}) {
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogTitle>{selectedCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</DialogTitle>
        <div className="grid grid-cols-2 gap-4 mt-4">
          
          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">Value (Unique ID)</label>
            <input 
              type="text"
              value={formData.value}
              onChange={e => setFormData({...formData, value: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
              disabled={!!selectedCategory}
              placeholder="DASTURLASH"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none disabled:opacity-50"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">Ko'rinadigan Nomi (Label)</label>
            <input 
              type="text"
              value={formData.label}
              onChange={e => setFormData({...formData, label: e.target.value})}
              placeholder="Dasturlash"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="col-span-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">Emoji (Ikonka)</label>
            <input 
              type="text"
              value={formData.emoji}
              onChange={e => setFormData({...formData, emoji: e.target.value})}
              placeholder="💻"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xl text-center text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="col-span-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">Asosiy Rang (HEX)</label>
            <div className="flex gap-2">
              <input 
                type="color"
                value={formData.colorHex}
                onChange={e => setFormData({...formData, colorHex: e.target.value})}
                className="w-10 h-10 rounded cursor-pointer bg-slate-950 border border-slate-800"
              />
              <input 
                type="text"
                value={formData.colorHex}
                onChange={e => setFormData({...formData, colorHex: e.target.value})}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none uppercase font-mono"
              />
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">Polymorphic Form Type</label>
            <select
              value={formData.formType}
              onChange={e => setFormData({...formData, formType: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            >
              <option value="GENERAL">General (Standart)</option>
              <option value="ACADEMIC">Academic (Sahifa, Plagiat)</option>
              <option value="PROGRAMMING">Programming (Dasturlash tili)</option>
              <option value="TRANSLATION">Translation (Til dan -&gt; Til ga)</option>
              <option value="DESIGN">Design (Dizayn asbobi)</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">Tartib raqami (Sort Order)</label>
            <input 
              type="number"
              value={formData.sortOrder}
              onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-bold text-slate-400 mb-1 block">Ko'nikmalar (Vergul bilan ajrating)</label>
            <textarea 
              value={formData.skills}
              onChange={e => setFormData({...formData, skills: e.target.value})}
              placeholder="React, Node.js, Python, Java"
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="col-span-2 flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 accent-indigo-500 rounded bg-slate-800 border-slate-700"
              />
              <span className="text-sm font-medium">Aktiv kategoriya</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.isTrending}
                onChange={e => setFormData({...formData, isTrending: e.target.checked})}
                className="w-4 h-4 accent-orange-500 rounded bg-slate-800 border-slate-700"
              />
              <span className="text-sm font-medium text-orange-400">🔥 Trending (Top-5 da chiqadi)</span>
            </label>
          </div>

        </div>
        
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={() => saveMutation.mutate(formData)}
            disabled={saveMutation.isPending}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
