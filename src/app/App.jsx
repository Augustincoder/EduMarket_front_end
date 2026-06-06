// src/app/App.jsx
import { useState, useEffect } from 'react';
import { AppRouter } from './router';
import { Providers } from './providers';
import { WorkspaceOverlay } from '../components/ui/WorkspaceOverlay';
import { RefreshCw, X } from 'lucide-react';
import { hapticLight } from '../lib/telegram';

function CacheClearButton() {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide after 15 seconds so it doesn't stay forever
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const handleClearCache = () => {
    hapticLight();
    // Clear local storage (except tokens if needed, but we can clear specific UI states)
    localStorage.removeItem('edu_onboarding');
    // Force reload
    window.location.reload(true);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999999] animate-in slide-in-from-top-10 fade-in duration-500">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-2 pl-4 pr-2 rounded-full shadow-2xl flex items-center gap-3">
        <span className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">
          Eski xotira?
        </span>
        <button
          onClick={handleClearCache}
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors active:scale-95"
        >
          <RefreshCw size={12} /> Yangilash
        </button>
        <button 
          onClick={() => setIsVisible(false)}
          className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Providers>
      <AppRouter />
      <WorkspaceOverlay />
      <CacheClearButton />
    </Providers>
  );
}
