import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/admin.service';
import { toast } from 'react-hot-toast';
import { Save, Percent, ShieldAlert } from 'lucide-react';

export default function AdminSettings() {
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.getSettings().then(r => r.data.data)
  });

  const [vipPrice7, setVipPrice7] = useState('');
  const [vipPrice30, setVipPrice30] = useState('');
  const [commission, setCommission] = useState('');

  useEffect(() => {
    if (settingsData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVipPrice7(settingsData.vip_price_7_days || '15000');
       
      setVipPrice30(settingsData.vip_price_30_days || '45000');
       
      setCommission(settingsData.commission_percentage || '10');
    }
  }, [settingsData]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ key, value }) => adminApi.updateSetting({ key, value }),
    onSuccess: () => {
      toast.success('Sozlama muvaffaqiyatli saqlandi');
      queryClient.invalidateQueries(['admin', 'settings']);
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const handleSave = (key, value) => {
    if (!value) {
      toast.error('Qiymat kiritilishi majburiy');
      return;
    }
    updateMutation.mutate({ key, value });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sozlamalar yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in text-slate-100">
      
      <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl p-6 space-y-6">
        
        {/* VIP Price 7 Days */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-850">
          <div>
            <h4 className="text-xs font-bold text-slate-200">7 Kunlik VIP Narxi</h4>
            <p className="text-[10px] text-slate-500 mt-1">Foydalanuvchilar VIP 7 kunlik arizasi uchun to'lashi kerak bo'lgan miqdor (UZS)</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={vipPrice7}
              onChange={(e) => setVipPrice7(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-650 outline-none focus:border-indigo-600 w-36 font-bold"
            />
            <button
              onClick={() => handleSave('vip_price_7_days', vipPrice7)}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
            >
              <Save size={16} />
            </button>
          </div>
        </div>

        {/* VIP Price 30 Days */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-850">
          <div>
            <h4 className="text-xs font-bold text-slate-200">30 Kunlik VIP Narxi</h4>
            <p className="text-[10px] text-slate-500 mt-1">Foydalanuvchilar VIP 30 kunlik arizasi uchun to'lashi kerak bo'lgan miqdor (UZS)</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={vipPrice30}
              onChange={(e) => setVipPrice30(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-650 outline-none focus:border-indigo-600 w-36 font-bold"
            />
            <button
              onClick={() => handleSave('vip_price_30_days', vipPrice30)}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
            >
              <Save size={16} />
            </button>
          </div>
        </div>

        {/* Commission Percentage */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-850">
          <div>
            <h4 className="text-xs font-bold text-slate-200">Tizim Komissiya Foizi</h4>
            <p className="text-[10px] text-slate-500 mt-1">Vazifalar yakunlanganda platforma ushlab qoladigan komissiya foizi (%)</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-650 outline-none focus:border-indigo-600 w-36 font-bold"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500">
                <Percent size={14} />
              </span>
            </div>
            <button
              onClick={() => handleSave('commission_percentage', commission)}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
            >
              <Save size={16} />
            </button>
          </div>
        </div>

      </div>

      <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-3xl flex gap-3 text-xs">
        <ShieldAlert size={20} className="shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold uppercase tracking-wider">Ehtiyot Bo'ling!</h5>
          <p className="mt-1 text-[11px] leading-relaxed text-yellow-500/80">Bu yerda o'rnatilgan sozlamalar platformadagi barcha foydalanuvchilar hisob-kitoblariga bevosita ta'sir ko'rsatadi. Iltimos, o'zgartirishlardan so'ng qiymatlar to'g'riligini qayta tekshiring.</p>
        </div>
      </div>

    </div>
  );
}
