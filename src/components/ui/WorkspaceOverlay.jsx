// src/components/ui/WorkspaceOverlay.jsx
import { useAuthStore } from '../../store/authStore';
import { Briefcase, User, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function WorkspaceOverlay() {
  const isSwitching = useAuthStore((s) => s.isSwitching);
  const activeRole = useAuthStore((s) => s.activeRole);

  if (!isSwitching) return null;

  // We are switching TO the other role, so if current is CLIENT, we are switching TO FREELANCER
  const switchingTo = activeRole === 'CLIENT' ? 'FREELANCER' : 'CLIENT';

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-edu-bg/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className={cn(
          "w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl mb-6 relative",
          switchingTo === 'FREELANCER' 
            ? "bg-indigo-600 text-white shadow-indigo-600/30" 
            : "bg-edu-primary text-white shadow-edu-primary/30"
        )}>
          {switchingTo === 'FREELANCER' ? <Briefcase size={40} /> : <User size={40} />}
          
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-edu-surface rounded-full flex items-center justify-center border-4 border-edu-bg">
            <Loader2 className="animate-spin text-edu-primary" size={20} />
          </div>
        </div>

        <h2 className="text-xl font-bold text-edu-text tracking-tight mb-2">
          {switchingTo === 'FREELANCER' ? 'Mutaxassis ish joyi' : 'Mijoz ish joyi'}
        </h2>
        <p className="text-sm font-medium text-edu-muted">
          Muhit tayyorlanmoqda...
        </p>
      </div>
    </div>
  );
}
