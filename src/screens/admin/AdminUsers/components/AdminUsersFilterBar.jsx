import { Search, Download } from 'lucide-react';
import { Select } from '../../../../components/ui/AdminComponents';
import { exportToCSV } from '../../../../lib/export';
import { toast } from 'react-hot-toast';

export function AdminUsersFilterBar({ 
  search, setSearch, 
  roleFilter, setRoleFilter, 
  vipFilter, setVipFilter, 
  banFilter, setBanFilter,
  users 
}) {
  const handleExport = () => {
    if (users && users.length) {
      const exportData = users.map(u => ({
        ID: u.id,
        Ism_Sharif: u.fullname,
        Username: u.username || '',
        Role: u.role,
        VIP: u.isVip ? 'Ha' : 'Yoq',
        Talaba: u.isVerifiedStudent ? 'Tasdiqlangan' : 'Yoq',
        Ban: u.isBanned ? 'Bloklangan' : 'Faol',
        Sana: new Date(u.createdAt).toLocaleString('uz-UZ')
      }));
      exportToCSV(exportData, 'Foydalanuvchilar_Bazasi');
    } else {
      toast.error("Eksport qilish uchun ma'lumot yo'q");
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 border border-slate-800/60 p-5 rounded-xl flex-1">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-600 transition-all"
          />
        </div>
        
        <div>
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
            placeholder="Rol"
            options={[
              { label: 'Barcha Rollar', value: 'ALL' },
              { label: 'User', value: 'USER' },
              { label: 'Admin', value: 'ADMIN' },
            ]}
          />
        </div>

        <div>
          <Select
            value={vipFilter}
            onValueChange={setVipFilter}
            placeholder="VIP Status"
            options={[
              { label: 'Barcha VIP', value: 'ALL' },
              { label: 'VIP Foydalanuvchilar', value: 'VIP' },
              { label: 'Oddiy Foydalanuvchilar', value: 'NORMAL' },
            ]}
          />
        </div>

        <div>
          <Select
            value={banFilter}
            onValueChange={setBanFilter}
            placeholder="Ban Status"
            options={[
              { label: 'Barcha Holatlar', value: 'ALL' },
              { label: 'Bloklanganlar', value: 'BANNED' },
              { label: 'Faollar', value: 'ACTIVE' },
            ]}
          />
        </div>
      </div>
      
      <button
        onClick={handleExport}
        className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 md:w-auto w-full shrink-0"
      >
        <Download size={16} /> Export (CSV)
      </button>
    </div>
  );
}
