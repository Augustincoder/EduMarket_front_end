import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import useOnboardingStore from '../../../store/onboardingStore';
import OnboardingStep1 from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';

export default function OnboardingContainer() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const step = useOnboardingStore((s) => s.step);
  const navigate = useNavigate();
  const isAuthenticated = !!token;

  useEffect(() => {
    // Agar auth yo'q bo'lsa splashga qaytarish
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    } else if (user?.isOnboardingComplete) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.isOnboardingComplete) return null;

  return (
    <div className="h-screen w-full flex flex-col bg-edu-bg">
      {/* Progress Bar */}
      <div className="w-full bg-edu-border-2 h-1.5">
        <div 
          className="bg-edu-primary h-1.5 transition-all duration-300 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {step === 1 && <OnboardingStep1 />}
        {step === 2 && <OnboardingStep2 />}
        {step === 3 && <OnboardingStep3 />}
      </div>
    </div>
  );
}
