// src/screens/SplashScreen.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ready, expand, getStartParam } from '../../lib/telegram';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { login, token, user, refreshUser } = useAuth();

  useEffect(() => {
    ready();
    expand();

    const init = async () => {
      const startParam = getStartParam();
      let referralCode = null;
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
          localStorage.removeItem('edu_token');
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
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-mesh-aurora gap-6 animate-fade-in">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        {/* Logo mark */}
        <div className="w-22 h-22 rounded-[32px] bg-gradient-to-br from-edu-primary to-edu-primary-d flex items-center justify-center shadow-lg shadow-edu-primary/20 animate-pulse-slow border border-white/10">
          <span className="text-5xl">📚</span>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-edu-text font-display tracking-tight drop-shadow-sm">
            EduMarket
          </h1>
          <p className="text-sm font-medium text-edu-muted mt-1 font-body uppercase tracking-widest">Bilim bozori</p>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="flex flex-col items-center gap-4 w-48 mt-8">
        {/* Progress bar */}
        <div className="w-full h-1 bg-edu-border/40 rounded-full overflow-hidden">
          <div className="h-full bg-edu-primary rounded-full animate-shimmer w-1/2" />
        </div>
        <p className="text-[11px] uppercase tracking-wider text-edu-muted/80 font-semibold">Ulanmoqda...</p>
      </div>
    </div>
  );
}
