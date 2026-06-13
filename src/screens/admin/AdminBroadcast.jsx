import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../services/admin.service';
import { toast } from 'react-hot-toast';
import { Select } from '../../components/ui/AdminComponents';
import { Send, ShieldAlert } from 'lucide-react';
import DOMPurify from 'dompurify';
import { showConfirm } from '../../lib/telegram';

export default function AdminBroadcast() {
  const [targetType, setTargetType] = useState('ALL');
  const [text, setText] = useState('');

  const broadcastMutation = useMutation({
    mutationFn: (body) => adminApi.broadcast(body),
    onSuccess: (data) => {
      toast.success(data.data.message || 'Xabar yuborish boshlandi!');
      setText('');
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Xabar matnini kiriting');
      return;
    }

    showConfirm('Haqiqatdan ham ushbu xabarni barcha tanlangan foydalanuvchilarga yubormoqchimisiz?', (ok) => {
      if (ok) {
        const sanitizedText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
        broadcastMutation.mutate({ targetType, text: sanitizedText });
      }
    });
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in text-slate-100">
      
      <form onSubmit={handleSubmit} className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-6 space-y-5">
        
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Qabul Qiluvchilar Guruhi</label>
          <Select
            value={targetType}
            onValueChange={setTargetType}
            placeholder="Guruhni tanlang..."
            options={[
              { label: 'Barcha Foydalanuvchilar (Active)', value: 'ALL' },
              { label: 'Faqat Freelancerlar', value: 'FREELANCERS' },
              { label: 'Faqat Mijozlar', value: 'CLIENTS' },
              { label: 'Faqat VIP Foydalanuvchilar', value: 'VIP' },
            ]}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Xabar Matni</label>
          <textarea
            placeholder="Xabarni yozing...\nMasalan:\n📢 Yangi xizmatlar!\n\nTizimda yangi giglar paydo bo'ldi. O'tib ko'ring! ⚡"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-lg p-4 text-xs outline-none min-h-[180px] font-mono leading-relaxed text-slate-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={broadcastMutation.isLoading || !text.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-50"
        >
          <Send size={14} />
          {broadcastMutation.isLoading ? 'Yuborilmoqda...' : 'Telegram orqali tarqatish'}
        </button>

      </form>

      <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex gap-3 text-xs">
        <ShieldAlert size={20} className="shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold uppercase tracking-wider">Eslatma</h5>
          <p className="mt-1 text-[11px] leading-relaxed text-indigo-400/80">Xabarlar Telegram bot orqali foydalanuvchilarga shaxsan yuboriladi. Telegram cheklovlari (Rate Limits) tufayli har bir xabar orasida 50ms kechikish bilan yuboriladi. Jami foydalanuvchilar ko'p bo'lsa, xabar yetib borishi bir necha daqiqa olishi mumkin.</p>
        </div>
      </div>

    </div>
  );
}
