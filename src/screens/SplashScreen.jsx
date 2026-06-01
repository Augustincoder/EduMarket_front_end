// src/screens/SplashScreen.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ready, expand } from '../lib/telegram';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { login, token } = useAuth();

  useEffect(() => {
    ready();
    expand();

    const init = async () => {
      // Already logged in
      if (token) {
        navigate('/home', { replace: true });
        return;
      }

      await new Promise((r) => setTimeout(r, 800)); // logo animation

      const result = await login();
      if (result.success) {
        navigate('/home', { replace: true });
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
