import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOnboardingStore from '../../store/onboardingStore';
import { onboardingApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useTelegram } from '../../hooks/useTelegram';
import { Button } from '../../components/ui/Button';
import { FileUpload } from '../../components/forms/FileUpload';
import toast from 'react-hot-toast';

export default function OnboardingStep4() {
  const { formData, setStep } = useOnboardingStore();
  const { updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const { HapticFeedback } = useTelegram();
  const navigate = useNavigate();

  const handleFinish = async () => {
    HapticFeedback.impactOccurred('medium');
    setLoading(true);
    try {
      if (files.length > 0) {
        await onboardingApi.verifyStudent({ fileId: files[0].id });
      }
      const res = await onboardingApi.complete(formData);
      updateProfile({ ...res.data.data.user, isOnboardingComplete: true });
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      navigate('/home', { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.serverMsg || "Xatolik yuz berdi");
      HapticFeedback.notificationOccurred('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-4">
      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Talabalikni tasdiqlash</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tizimda "Ishonchli talaba" badge-ini olish va buyurtmachilar ishonchini oshirish uchun guvohnomangizni yuklang (ixtiyoriy).
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <FileUpload value={files} onChange={setFiles} maxFiles={1} label="Talabalik guvohnomasi (Rasm)" />
        </div>
      </div>

      <div className="pt-4 pb-6 flex gap-3">
        <Button variant="outline" className="w-1/3" onClick={() => setStep(3)} disabled={loading}>Orqaga</Button>
        <Button variant="primary" className="w-2/3" onClick={handleFinish} loading={loading}>
          {files.length > 0 ? 'Yuklash va yakunlash' : 'O\'tkazib yuborish'}
        </Button>
      </div>
    </div>
  );
}
