import { ShieldAlert, Crown, Ban, Check, GraduationCap } from 'lucide-react';

export function AdminUsersTable({ 
  users, 
  isLoading, 
  openStudentModal, 
  setSelectedUser, 
  setActiveModal, 
  banMutation 
}) {
  if (isLoading) {
    return (
      <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl overflow-hidden flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yuklanmoqda...</span>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl overflow-hidden text-center py-20">
        <p className="text-slate-500 text-xs font-semibold">Hech qanday foydalanuvchi topilmadi</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl overflow-hidden overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-950/20">
            <th className="py-4 px-6">Foydalanuvchi</th>
            <th className="py-4 px-6">Rol</th>
            <th className="py-4 px-6">Talaba</th>
            <th className="py-4 px-6">VIP Maqomi</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-slate-900/20 transition-all">
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 text-xs">
                    {u.fullname?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100">{u.fullname}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">@{u.username || 'username_yoq'}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <span className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider ${
                  u.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400'
                }`}>
                  {u.role}
                </span>
              </td>
              <td className="py-4 px-6">
                {u.isVerifiedStudent ? (
                  <span className="text-emerald-500 flex items-center gap-1 font-bold text-[10px]">
                    <Check size={14} /> Tasdiqlangan
                  </span>
                ) : u.studentCardFileId ? (
                  <button 
                    onClick={() => openStudentModal(u)}
                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-xl text-[9px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5"
                  >
                    <GraduationCap size={12} /> Kutilmoqda
                  </button>
                ) : (
                  <span className="text-slate-600 text-[10px]">—</span>
                )}
              </td>
              <td className="py-4 px-6">
                {u.isVip ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1 text-[10px]">
                    👑 VIP ({u.vipExpiresAt ? new Date(u.vipExpiresAt).toLocaleDateString('uz-UZ') : 'Cheksiz'})
                  </span>
                ) : (
                  <span className="text-slate-600 text-[10px]">Oddiy</span>
                )}
              </td>
              <td className="py-4 px-6">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                  u.isBanned ? 'bg-red-500/15 text-red-500' : 'bg-emerald-500/15 text-emerald-500'
                }`}>
                  ● {u.isBanned ? 'Bloklangan' : 'Faol'}
                </span>
              </td>
              <td className="py-4 px-6">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setSelectedUser(u); setActiveModal('WARN'); }}
                    title="Ogohlantirish yuborish"
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-500 rounded-lg transition-all"
                  >
                    <ShieldAlert size={16} />
                  </button>
                  
                  <button
                    onClick={() => { setSelectedUser(u); setActiveModal('VIP'); }}
                    title="VIP Maqomi"
                    className={`p-1.5 hover:bg-slate-800 rounded-lg transition-all ${
                      u.isVip ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
                    }`}
                  >
                    <Crown size={16} />
                  </button>

                  <button
                    onClick={() => {
                      if (u.isBanned) {
                        banMutation.mutate({ userId: u.id, isBanned: false });
                      } else {
                        setSelectedUser(u);
                        setActiveModal('BAN');
                      }
                    }}
                    title={u.isBanned ? "Blokdan chiqarish" : "Bloklash"}
                    className={`p-1.5 hover:bg-slate-800 rounded-lg transition-all ${
                      u.isBanned ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                    }`}
                  >
                    <Ban size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
