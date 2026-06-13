import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/client';
import { toast } from 'react-hot-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
} from '../../components/ui/AdminComponents';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Database } from 'lucide-react';
import defaultCategories from '../../data/defaultCategories.json';
export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const handleBulkLoad = async () => {
    const confirm = window.confirm("Rostdan ham lokal JSON dagi kategoriyalarni bazaga yuklamoqchimisiz?");
    if (!confirm) return;
    
    setIsBulkLoading(true);
    let successCount = 0;
    toast.loading('Kategoriyalar yuklanmoqda...', { id: 'bulk-load' });
    
    try {
      for (const cat of defaultCategories) {
        try {
          await api.post('/categories/admin', cat);
          successCount++;
        } catch (err) {
          console.warn(`Failed to create category ${cat.value}:`, err.response?.data || err.message);
        }
      }
      toast.success(`${successCount} ta kategoriya muvaffaqiyatli yuklandi!`, { id: 'bulk-load' });
      queryClient.invalidateQueries(['admin', 'categories']);
    } catch {
      toast.error("Kategoriyalarni yuklashda xatolik yuz berdi", { id: 'bulk-load' });
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    emoji: '',
    colorHex: '#3B82F6',
    formType: 'GENERAL',
    sortOrder: 0,
    isActive: true,
    isTrending: false,
    skills: '' // comma separated
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => api.get('/categories/admin').then(r => r.data.data.categories)
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [] };
      if (selectedCategory) {
        return api.patch(`/categories/admin/${selectedCategory.id}`, payload);
      }
      return api.post('/categories/admin', payload);
    },
    onSuccess: () => {
      toast.success(selectedCategory ? "Kategoriya yangilandi" : "Kategoriya yaratildi");
      queryClient.invalidateQueries(['admin', 'categories']);
      setIsModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/categories/admin/${id}/toggle`, { isActive }),
    onSuccess: () => {
      toast.success("Status o'zgardi");
      queryClient.invalidateQueries(['admin', 'categories']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/admin/${id}`),
    onSuccess: () => {
      toast.success("Kategoriya o'chirildi");
      queryClient.invalidateQueries(['admin', 'categories']);
    }
  });

  const openModal = (cat = null) => {
    setSelectedCategory(cat);
    if (cat) {
      setFormData({
        value: cat.value,
        label: cat.label,
        emoji: cat.emoji,
        colorHex: cat.colorHex,
        formType: cat.formType,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        isTrending: cat.isTrending,
        skills: cat.skills ? cat.skills.map(s => s.name).join(', ') : ''
      });
    } else {
      setFormData({
        value: '',
        label: '',
        emoji: '📌',
        colorHex: '#3B82F6',
        formType: 'GENERAL',
        sortOrder: categories ? categories.length + 1 : 1,
        isActive: true,
        isTrending: false,
        skills: ''
      });
    }
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-white">Yuklanmoqda...</div>;

  return (
    <div className="p-8 pb-20 max-w-6xl mx-auto animate-fade-in h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Kategoriyalar boshqaruvi</h1>
          <p className="text-slate-400">Platformadagi dinamik ranglar, shakllar va ko'nikmalar sozlami</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBulkLoad}
            disabled={isBulkLoading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border border-slate-700 disabled:opacity-50"
          >
            <Database size={18} />
            {isBulkLoading ? 'Yuklanmoqda...' : 'Lokal yuklash'}
          </button>
          <button
            onClick={() => openModal()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} />
            Yangi yaratish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((cat) => (
          <div 
            key={cat.id} 
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group"
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

      {/* CREATE/EDIT MODAL */}
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
    </div>
  );
}
