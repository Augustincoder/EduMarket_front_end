import { useState, useEffect } from 'react';
import useOnboardingStore from '../../../store/onboardingStore';
import { onboardingApi } from '../../../services/users.service';
import { useTelegram } from '../../../hooks/useTelegram';
import { Button } from '../../../components/ui/Button';

export default function OnboardingStep1() {
  const formData = useOnboardingStore((s) => s.formData);
  const setFormData = useOnboardingStore((s) => s.setFormData);
  const setStep = useOnboardingStore((s) => s.setStep);
  const [usernameStatus, setUsernameStatus] = useState(null); // 'checking', 'available', 'taken'
  const { HapticFeedback } = useTelegram();

  // Debounce username check
  useEffect(() => {
    if (formData.username.length > 2) {
      const timer = setTimeout(async () => {
        setUsernameStatus('checking');
        try {
          const res = await onboardingApi.checkUsername(formData.username);
          setUsernameStatus(res.data.data.available ? 'available' : 'taken');
        } catch {
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
    <div className="flex flex-col h-full bg-edu-bg p-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-edu-text mb-2">Shaxsiy ma'lumotlar</h1>
        <p className="text-edu-muted mb-6">Profilingizni to'ldirib ishonchlilikni oshiring.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-edu-text-2 mb-1">To'liq ismingiz</label>
            <input 
              type="text"
              value={formData.fullname}
              onChange={(e) => setFormData({ fullname: e.target.value })}
              className="w-full bg-edu-surface border border-edu-border rounded-xl px-4 py-3 text-edu-text focus:outline-none focus:ring-2 focus:ring-edu-primary/20 focus:border-edu-primary transition-colors shadow-sm"
              placeholder="Masalan, Alisher Navoiy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-edu-text-2 mb-1">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-edu-muted">@</span>
              <input 
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                className={`w-full bg-edu-surface border ${usernameStatus === 'taken' ? 'border-red-500' : usernameStatus === 'available' ? 'border-green-500' : 'border-edu-border'} rounded-xl pl-9 pr-4 py-3 text-edu-text focus:outline-none focus:ring-2 focus:ring-edu-primary/20 focus:border-edu-primary transition-colors shadow-sm`}
                placeholder="username"
              />
            </div>
            {usernameStatus === 'checking' && <p className="text-sm text-edu-info mt-1">Tekshirilmoqda...</p>}
            {usernameStatus === 'taken' && <p className="text-sm text-red-500 mt-1">Bu username band</p>}
            {usernameStatus === 'available' && <p className="text-sm text-green-500 mt-1">Username bo'sh</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-edu-text-2 mb-1">Bio (Siz haqingizda)</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({ bio: e.target.value })}
              className="w-full bg-edu-surface border border-edu-border rounded-xl px-4 py-3 text-edu-text focus:outline-none focus:ring-2 focus:ring-edu-primary/20 focus:border-edu-primary min-h-[100px] transition-colors shadow-sm"
              placeholder="Qisqacha o'zingiz haqingizda..."
            />
          </div>
        </div>
      </div>

      <div className="pt-4 pb-6">
        <Button 
          variant="primary" 
          className="w-full shadow-btn rounded-xl h-12 text-[15px] font-bold" 
          onClick={handleNext}
          disabled={!formData.fullname || !formData.username || usernameStatus !== 'available'}
        >
          Keyingisi
        </Button>
      </div>
    </div>
  );
}
