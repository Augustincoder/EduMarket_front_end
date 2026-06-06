import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useOnboardingStore from '../../../store/onboardingStore';
import { onboardingApi } from '../../../services/users.service';
import { useTelegram } from '../../../hooks/useTelegram';
import { Button } from '../../../components/ui/Button';

export default function OnboardingStep1() {
  const formData = useOnboardingStore((s) => s.formData);
  const setFormData = useOnboardingStore((s) => s.setFormData);
  const setStep = useOnboardingStore((s) => s.setStep);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // 'checking', 'available', 'taken'
  const { HapticFeedback } = useTelegram();
  const navigate = useNavigate();

  // Debounce username check
  useEffect(() => {
    if (formData.username.length > 2) {
      const timer = setTimeout(async () => {
        setUsernameStatus('checking');
        try {
          const res = await onboardingApi.checkUsername(formData.username);
          setUsernameStatus(res.data.data.available ? 'available' : 'taken');
        } catch (err) {
          setUsernameStatus(null);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsernameStatus(null);
    }
  }, [formData.username]);

  const handleNext = () => {
    if (formData.fullname && formData.username && usernameStatus === 'available') {
      HapticFeedback.impactOccurred('light');
      setStep(2);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Shaxsiy ma'lumotlar</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Profilingizni to'ldirib ishonchlilikni oshiring.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">To'liq ismingiz</label>
            <input 
              type="text"
              value={formData.fullname}
              onChange={(e) => setFormData({ fullname: e.target.value })}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masalan, Alisher Navoiy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400">@</span>
              <input 
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                className={`w-full bg-white dark:bg-slate-800 border ${usernameStatus === 'taken' ? 'border-red-500' : usernameStatus === 'available' ? 'border-green-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl pl-9 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="username"
              />
            </div>
            {usernameStatus === 'checking' && <p className="text-sm text-blue-500 mt-1">Tekshirilmoqda...</p>}
            {usernameStatus === 'taken' && <p className="text-sm text-red-500 mt-1">Bu username band</p>}
            {usernameStatus === 'available' && <p className="text-sm text-green-500 mt-1">Username bo'sh</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio (Siz haqingizda)</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({ bio: e.target.value })}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Qisqacha o'zingiz haqingizda..."
            />
          </div>
        </div>
      </div>

      <div className="pt-4 pb-6">
        <Button 
          variant="primary" 
          className="w-full" 
          onClick={handleNext}
          disabled={!formData.fullname || !formData.username || usernameStatus !== 'available'}
        >
          Keyingisi
        </Button>
      </div>
    </div>
  );
}
