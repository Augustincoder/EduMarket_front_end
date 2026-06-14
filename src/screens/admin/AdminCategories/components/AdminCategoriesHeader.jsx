import { Plus, Database } from 'lucide-react';

export function AdminCategoriesHeader({ isBulkLoading, handleBulkLoad, openModal }) {
  return (
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
  );
}
