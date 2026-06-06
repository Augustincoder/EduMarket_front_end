import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/admin.service';
import { filesApi } from '../../services/other.service';
import { formatPrice } from '../../lib/constants';
import { toast } from 'react-hot-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from '../../components/ui/AdminComponents';
import { Crown, Eye, Check, X } from 'lucide-react';

export default function AdminVipRequests() {
  const queryClient = useQueryClient();
  const [selectedReq, setSelectedReq] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // 1. Fetch requests
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'vip-requests'],
    queryFn: () => adminApi.getVipRequests().then(r => r.data.data)
  });
  const requests = data?.requests || [];

  // 2. Mutation to process payment
  const processMutation = useMutation({
    mutationFn: ({ id, isApproved, rejectReason }) => 
      adminApi.processVipRequest(id, { isApproved, rejectReason }),
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries(['admin', 'vip-requests']);
      queryClient.invalidateQueries(['admin', 'stats']);
      closeModal();
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const openRequest = async (req) => {
    setSelectedReq(req);
    setScreenshotUrl('');

    // 1. Try direct public URL (instant)
    const publicUrl = filesApi.getPublicUrl(req.screenshotFileId);
    if (publicUrl) {
      setScreenshotUrl(publicUrl);
      return;
    }

    // 2. Fallback: get presigned URL
    try {
      const res = await filesApi.getUrl(req.screenshotFileId);
      setScreenshotUrl(res.data.data.url);
    } catch (err) {
      toast.error('Chek rasmini yuklab bo\'lmadi');
    }
  };

  const closeModal = () => {
    setSelectedReq(null);
    setScreenshotUrl('');
    setRejectReason('');
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">VIP Arizalar yuklanmoqda...</span>
          </div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-950/20">
                  <th className="py-4 px-6">Foydalanuvchi</th>
                  <th className="py-4 px-6">Paket turi</th>
                  <th className="py-4 px-6">To'lov miqdori</th>
                  <th className="py-4 px-6">Telefon</th>
                  <th className="py-4 px-6">Sana</th>
                  <th className="py-4 px-6 text-right">Tekshirish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-900/20 transition-all">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-100">{req.user?.fullname}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">@{req.user?.username || 'username_yoq'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                        👑 {req.packageType}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-100">
                      {formatPrice(req.amount)} UZS
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono">
                      {req.phoneNumber || 'Kiritilmagan'}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(req.createdAt).toLocaleString('uz-UZ')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end">
                        <button
                          onClick={() => openRequest(req)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Eye size={14} /> Ko'rish
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
            <p className="text-slate-500 text-xs font-semibold">Kutilayotgan VIP so'rovlar mavjud emas</p>
          </div>
        )}
      </div>

      {/* ── Radix Dialog: VIP ariza ko'rish ───────────────── */}
      <Dialog open={!!selectedReq} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>VIP Arizasini Tekshirish</DialogTitle>
          <DialogDescription>
            Foydalanuvchi: <strong>{selectedReq?.user?.fullname}</strong>. Yuborilgan to'lov cheki va uning haqiqiyligini tekshiring.
          </DialogDescription>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider">Paket</p>
                <p className="text-amber-400 font-bold mt-1">👑 {selectedReq?.packageType}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider">To'lov miqdori</p>
                <p className="text-slate-100 font-bold mt-1">{formatPrice(selectedReq?.amount || 0)} UZS</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider">Telefon raqam</p>
                <p className="text-slate-100 font-bold mt-1">{selectedReq?.phoneNumber || 'Kiritilmagan'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider">Yuborilgan sana</p>
                <p className="text-slate-100 font-bold mt-1">{selectedReq && new Date(selectedReq.createdAt).toLocaleString('uz-UZ')}</p>
              </div>
            </div>

            {/* Check Screenshot */}
            <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 min-h-[300px] max-h-[400px]">
              {screenshotUrl ? (
                <img 
                  src={screenshotUrl} 
                  alt="To'lov Cheki" 
                  className="max-w-full max-h-[380px] object-contain rounded-lg"
                />
              ) : (
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Chek rasmi yuklanmoqda...</span>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-2">
              <button
                disabled={processMutation.isLoading}
                onClick={() => processMutation.mutate({ id: selectedReq.id, isApproved: true })}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Check size={16} /> To'lovni tasdiqlash (VIP maqomini yoqish)
              </button>

              <div className="border-t border-slate-850 pt-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">To'lovni rad etish</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Rad etish sababini yozing..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-100"
                  />
                  <button
                    disabled={!rejectReason.trim() || processMutation.isLoading}
                    onClick={() => processMutation.mutate({ id: selectedReq.id, isApproved: false, rejectReason })}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all"
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
