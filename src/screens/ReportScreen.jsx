import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Header } from '../components/layout/Header';
import { reportsApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { useTelegram } from '../hooks/useTelegram';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { value: 'SCAM', label: "Firibgarlik (Scam)" },
  { value: 'INAPPROPRIATE_CONTENT', label: "Nojo'ya kontent" },
  { value: 'HARASSMENT', label: "Haqorat / Noto'g'ri muloqot" },
  { value: 'SPAM', label: "Spam" },
  { value: 'TASK_QUALITY', label: "Vazifa sifati pastligi" },
  { value: 'DEADLINE_BREACH', label: "Muddati buzilishi" },
  { value: 'FAKE_PROFILE', label: "Soxta profil" },
  { value: 'OTHER', label: "Boshqa" },
];

export default function ReportScreen() {
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('targetId');
  const targetType = searchParams.get('targetType'); // 'USER' | 'TASK' | 'MESSAGE'

  const navigate = useNavigate();
  const { HapticFeedback } = useTelegram();

  const [formData, setFormData] = useState({
    type: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.type) return toast.error("Shikoyat turini tanlang");
    if (!formData.reason.trim()) return toast.error("Sababini kiriting");
    if (!targetId || !targetType) return toast.error("Noma'lum xatolik");

    setLoading(true);
    try {
      HapticFeedback.impactOccurred('medium');
      await reportsApi.create({
        targetId,
        targetType,
        type: formData.type,
        reason: formData.reason
      });
      toast.success("Shikoyatingiz yuborildi. Tez orada ko'rib chiqiladi.");
      navigate(-1);
    } catch (err) {
      toast.error(err.serverMsg || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout bgClass="bg-slate-50 dark:bg-slate-900">
      <Header title="Shikoyat qilish" onBack={() => navigate(-1)} />
      <div className="p-4 flex flex-col h-full overflow-y-auto pb-24 space-y-6">
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
          <p className="text-sm text-red-800 dark:text-red-300">
            Iltimos, faqat qoidalarni buzgan foydalanuvchilar yoki kontent haqida xabar bering. Yolg'on shikoyatlar hisobingiz bloklanishiga olib kelishi mumkin.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shikoyat turi</label>
          <div className="space-y-2">
            {REPORT_TYPES.map(type => (
              <label key={type.value} className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 cursor-pointer">
                <input 
                  type="radio" 
                  name="reportType" 
                  value={type.value} 
                  checked={formData.type === type.value}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-4 h-4 text-red-600 border-slate-300 focus:ring-red-500"
                />
                <span className="ml-3 text-sm font-medium text-slate-900 dark:text-white">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Batafsil ma'lumot</label>
          <textarea 
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[120px]"
            placeholder="Muammo haqida batafsil yozing..."
          />
        </div>

        <div className="mt-auto pt-4">
          <Button variant="primary" className="w-full bg-red-600 hover:bg-red-700" onClick={handleSubmit} loading={loading}>
            Shikoyatni yuborish
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
