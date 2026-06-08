import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/admin.service';
import { filesApi } from '../../services/other.service';
import { toast } from 'react-hot-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  Select
} from '../../components/ui/AdminComponents';
import { Search, Ban, Crown, ShieldAlert, GraduationCap, Check, Download } from 'lucide-react';
import { exportToCSV } from '../../lib/export';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [vipFilter, setVipFilter] = useState('ALL');
  const [banFilter, setBanFilter] = useState('ALL');

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'BAN' | 'VIP' | 'WARN' | 'STUDENT'
  
  // Action inputs
  const [banReason, setBanReason] = useState('');
  const [vipDuration, setVipDuration] = useState('30');
  const [warnMessage, setWarnMessage] = useState('');
  const [studentRejectReason, setStudentRejectReason] = useState('');
  
  // Student card screenshot URL
  const [studentCardUrl, setStudentCardUrl] = useState('');

  // 1. Fetch Users
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users', search, roleFilter, vipFilter, banFilter],
    queryFn: () => {
      const params = {};
      if (search) params.search = search;
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (vipFilter !== 'ALL') params.isVip = vipFilter === 'VIP';
      if (isFinite(banFilter) || banFilter !== 'ALL') params.isBanned = banFilter === 'BANNED';
      
      return adminApi.getUsers(params).then(r => r.data.data);
    }
  });

  // 2. Mutations
  const banMutation = useMutation({
    mutationFn: ({ userId, isBanned, reason }) => adminApi.banUser(userId, { isBanned, reason }),
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries(['admin', 'users']);
      closeModal();
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const vipMutation = useMutation({
    mutationFn: ({ userId, isVip, durationDays }) => adminApi.setUserVip(userId, { isVip, durationDays }),
    onSuccess: () => {
      toast.success('VIP statusi o\'zgartirildi');
      queryClient.invalidateQueries(['admin', 'users']);
      closeModal();
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const warnMutation = useMutation({
    mutationFn: ({ userId, message }) => adminApi.warnUser(userId, { message }),
    onSuccess: () => {
      toast.success('Ogohlantirish yuborildi');
      closeModal();
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const studentMutation = useMutation({
    mutationFn: ({ userId, isApproved, rejectReason }) => adminApi.verifyStudent(userId, { isApproved, rejectReason }),
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries(['admin', 'users']);
      closeModal();
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const closeModal = () => {
    setSelectedUser(null);
    setActiveModal(null);
    setBanReason('');
    setWarnMessage('');
    setStudentRejectReason('');
    setStudentCardUrl('');
  };

  const openStudentModal = async (user) => {
    setSelectedUser(user);
    setActiveModal('STUDENT');
    if (user.studentCardFileId) {
      // Try direct public URL first (instant)
      const publicUrl = filesApi.getPublicUrl(user.studentCardFileId);
      if (publicUrl) {
        setStudentCardUrl(publicUrl);
        return;
      }

      // Fallback: get presigned URL
      try {
        const res = await filesApi.getUrl(user.studentCardFileId);
        setStudentCardUrl(res.data.data.url);
      } catch {
        toast.error('Guvohnoma faylini yuklab bo\'lmadi');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* ── Filter Bar ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 border border-slate-800/60 p-5 rounded-3xl flex-1">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-600 transition-all"
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
          onClick={() => {
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
          }}
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 md:w-auto w-full"
        >
          <Download size={16} /> Export (CSV)
        </button>
      </div>

      {/* ── Table Grid ────────────────────────────────────── */}
      <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yuklanmoqda...</span>
          </div>
        ) : users && users.length > 0 ? (
          <div className="overflow-x-auto">
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
                        {/* Warn */}
                        <button
                          onClick={() => { setSelectedUser(u); setActiveModal('WARN'); }}
                          title="Ogohlantirish yuborish"
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-500 rounded-lg transition-all"
                        >
                          <ShieldAlert size={16} />
                        </button>
                        
                        {/* VIP Toggle */}
                        <button
                          onClick={() => { setSelectedUser(u); setActiveModal('VIP'); }}
                          title="VIP Maqomi"
                          className={`p-1.5 hover:bg-slate-800 rounded-lg transition-all ${
                            u.isVip ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
                          }`}
                        >
                          <Crown size={16} />
                        </button>

                        {/* Ban / Unban */}
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
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-xs font-semibold">Hech qanday foydalanuvchi topilmadi</p>
          </div>
        )}
      </div>

      {/* ── Radix Dialog: BAN USER ───────────────────────── */}
      <Dialog open={activeModal === 'BAN'} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent>
          <DialogTitle>Foydalanuvchini bloklash</DialogTitle>
          <DialogDescription>
            <strong>{selectedUser?.fullname}</strong> ni bloklash sababini kiriting. Ushbu sabab foydalanuvchi tizimga kirishga uringanida ko'rsatiladi.
          </DialogDescription>
          <div className="space-y-4">
            <textarea
              placeholder="Bloklash sababi (majburiy)..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-3 text-xs outline-none min-h-[100px]"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={closeModal} 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl"
              >
                Bekor qilish
              </button>
              <button
                disabled={!banReason.trim() || banMutation.isLoading}
                onClick={() => banMutation.mutate({ userId: selectedUser.id, isBanned: true, reason: banReason })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold rounded-xl text-white disabled:opacity-50"
              >
                Bloklash
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Radix Dialog: VIP ────────────────────────────── */}
      <Dialog open={activeModal === 'VIP'} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent>
          <DialogTitle>VIP Maqomini boshqarish</DialogTitle>
          <DialogDescription>
            Foydalanuvchi: <strong>{selectedUser?.fullname}</strong>. VIP muddatini yoki uni butunlay olib tashlashni tanlang.
          </DialogDescription>
          <div className="space-y-4">
            {selectedUser?.isVip ? (
              <button
                onClick={() => vipMutation.mutate({ userId: selectedUser.id, isVip: false })}
                className="w-full px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold transition-all"
              >
                VIP Maqomini Olib Tashlash
              </button>
            ) : (
              <div className="space-y-4">
                <Select
                  value={vipDuration}
                  onValueChange={setVipDuration}
                  placeholder="VIP Davomiyligi"
                  options={[
                    { label: '7 Kunlik VIP', value: '7' },
                    { label: '30 Kunlik VIP', value: '30' },
                    { label: '90 Kunlik VIP', value: '90' },
                  ]}
                />
                <button
                  onClick={() => vipMutation.mutate({ userId: selectedUser.id, isVip: true, durationDays: vipDuration })}
                  className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  VIP Maqomini Berish
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Radix Dialog: WARN ───────────────────────────── */}
      <Dialog open={activeModal === 'WARN'} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent>
          <DialogTitle>Telegram Ogohlantirish Yuborish</DialogTitle>
          <DialogDescription>
            Foydalanuvchi: <strong>{selectedUser?.fullname}</strong>. Unga yuboriladigan ogohlantirish matnini yozing.
          </DialogDescription>
          <div className="space-y-4">
            <textarea
              placeholder="Ogohlantirish xabari..."
              value={warnMessage}
              onChange={(e) => setWarnMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs outline-none min-h-[100px]"
            />
            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl">
                Bekor qilish
              </button>
              <button
                disabled={!warnMessage.trim() || warnMutation.isLoading}
                onClick={() => warnMutation.mutate({ userId: selectedUser.id, message: warnMessage })}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl text-white disabled:opacity-50"
              >
                Xabarni yuborish
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Radix Dialog: STUDENT VERIFICATION ───────────── */}
      <Dialog open={activeModal === 'STUDENT'} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Talabalik Arizasini Ko'rish</DialogTitle>
          <DialogDescription>
            Foydalanuvchi talabalik guvohnomasi va u yuborgan o'quv ma'lumotlari.
          </DialogDescription>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider">Universitet</p>
                <p className="text-slate-100 font-bold mt-1">{selectedUser?.university || 'Kiritilmagan'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider">Fakultet</p>
                <p className="text-slate-100 font-bold mt-1">{selectedUser?.faculty || 'Kiritilmagan'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider">O'qish yili (Kurs)</p>
                <p className="text-slate-100 font-bold mt-1">{selectedUser?.studyYear ? `${selectedUser.studyYear}-kurs` : 'Kiritilmagan'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider">Viloyat</p>
                <p className="text-slate-100 font-bold mt-1">{selectedUser?.region || 'Kiritilmagan'}</p>
              </div>
            </div>

            {/* Document Preview */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 min-h-[250px] max-h-[350px]">
              {studentCardUrl ? (
                <img 
                  src={studentCardUrl} 
                  alt="Talabalik Guvohnomasi" 
                  className="max-w-full max-h-[330px] object-contain rounded-lg"
                />
              ) : (
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Hujjat rasmi yuklanmoqda...</span>
              )}
            </div>

            {/* Action panel */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  onClick={() => studentMutation.mutate({ userId: selectedUser.id, isApproved: true })}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Check size={16} /> Tasdiqlash (Talaba unvonini berish)
                </button>
              </div>
              <div className="border-t border-slate-850 pt-3 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rad etish sababi</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Rad etish sababini yozing..."
                    value={studentRejectReason}
                    onChange={(e) => setStudentRejectReason(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2 text-xs outline-none text-slate-100"
                  />
                  <button
                    disabled={!studentRejectReason.trim() || studentMutation.isLoading}
                    onClick={() => studentMutation.mutate({ userId: selectedUser.id, isApproved: false, rejectReason: studentRejectReason })}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Rad etish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
