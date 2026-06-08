// src/screens/SplashScreen.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ready, expand, getStartParam } from '../../lib/telegram';
import { GraduationCap } from 'lucide-react';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { login, token, user, refreshUser } = useAuth();

  useEffect(() => {
    ready();
    expand();

    const init = async () => {
      const startParam = getStartParam();
      let referralCode;
      if (startParam && startParam.startsWith('ref_')) {
        referralCode = startParam.replace('ref_', '');
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        referralCode = urlParams.get('ref');
      }

      await new Promise((r) => setTimeout(r, 800)); // logo animation

      // Already logged in
      if (token) {
        let currentUser = user;
        if (!currentUser) {
          currentUser = await refreshUser();
        }
        
        if (currentUser) {
          if (!currentUser.isOnboardingComplete) {
            navigate('/onboarding', { replace: true });
          } else {
            navigate('/home', { replace: true });
          }
          return;
        } else {
          // If token exists but refreshUser failed, the token is likely invalid or stale.
          // Clear it and proceed to a fresh login.
          console.warn("Session stale, re-authenticating...");
          localStorage.removeItem('edu_auth');
        }
      }

      const result = await login(referralCode);
      if (result.success) {
        if (!result.user.isOnboardingComplete) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-edu-bg gap-6 animate-fade-in overflow-hidden">
      {/* Premium background aurora */}
      <div className="absolute inset-0 bg-mesh-aurora opacity-60" />

      {/* Logo */}
      <div className="flex flex-col items-center gap-6 animate-ios-pop relative z-10">
        {/* Logo mark */}
        <div className="w-24 h-24 rounded-[20px] bg-gradient-to-br from-edu-primary to-edu-accent flex items-center justify-center shadow-btn animate-pulse-slow border border-white/20">
          <GraduationCap size={48} className="text-white drop-shadow-lg" />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-edu-text font-display tracking-ios-display drop-shadow-sm">
            EduMarket
          </h1>
          <p className="text-[12px] font-black text-edu-muted mt-2 font-body uppercase tracking-[0.2em] opacity-70">Bilim bozori</p>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="flex flex-col items-center gap-5 w-56 mt-10 relative z-10">
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5">
          <div className="h-full bg-gradient-to-r from-edu-primary to-edu-accent rounded-full animate-shimmer w-1/2" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-edu-muted font-black opacity-60">Ulanmoqda...</p>
      </div>
    </div>
  );
}
