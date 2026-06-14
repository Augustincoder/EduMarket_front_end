import { Lock, Crown, Briefcase, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

export function AccessDeniedView({ isVip, completedTasks, navigate }) {
  const completedTasksProgress = Math.min(100, (completedTasks / 3) * 100);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Elegant Lock Illustration */}
      <div className="flex flex-col items-center justify-center text-center py-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500/20 to-edu-urgent/10 flex items-center justify-center shadow-inner border border-orange-500/20 mb-4 animate-pulse-slow">
          <Lock className="w-8 h-8 text-edu-urgent" />
        </div>
        <h2 className="text-xl font-bold text-edu-text font-display">Xizmat yaratish bloklangan</h2>
        <p className="text-xs text-edu-muted max-w-[85%] mt-2 leading-relaxed">
          Katalogda o'z xizmatlaringizni taklif qilish uchun quyidagi 2 ta talabdan kamida bittasini bajarishingiz kerak.
        </p>
      </div>

      {/* Checklist Items */}
      <div className="flex flex-col gap-4">
        {/* Option 1: VIP Status */}
        <div className={`p-4 rounded-xl border transition-all duration-300 ${
          isVip 
            ? 'bg-edu-primary/5 border-edu-primary/30' 
            : 'bg-edu-surface border-edu-border/40 shadow-sm'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${isVip ? 'bg-edu-primary/10 text-edu-primary' : 'bg-edu-vip/10 text-edu-vip'}`}>
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-edu-text font-display flex items-center gap-1.5">
                  VIP maqomiga ega bo'lish
                  {isVip && <span className="text-[10px] bg-edu-primary/15 text-edu-primary px-2 py-0.5 rounded-full font-bold">Faol</span>}
                </h3>
                <p className="text-xs text-edu-muted mt-1 leading-normal">
                  VIP foydalanuvchilar cheklovlarsiz katalogga xizmatlar qo'sha oladilar.
                </p>
              </div>
            </div>
            {isVip ? (
              <CheckCircle2 className="w-5 h-5 text-edu-primary shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-edu-muted shrink-0 mt-1" />
            )}
          </div>
          {!isVip && (
            <div className="mt-3.5 pt-3.5 border-t border-edu-border/20">
              <Button
                size="sm"
                variant="vip"
                onClick={() => navigate('/vip')}
                className="w-full font-bold h-10 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-edu-vip/10 active-bounce text-xs"
              >
                VIP sotib olish 👑
              </Button>
            </div>
          )}
        </div>

        {/* Option 2: Completed Tasks */}
        <div className={`p-4 rounded-xl border transition-all duration-300 ${
          completedTasks >= 3 
            ? 'bg-edu-primary/5 border-edu-primary/30' 
            : 'bg-edu-surface border-edu-border/40 shadow-sm'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${completedTasks >= 3 ? 'bg-edu-primary/10 text-edu-primary' : 'bg-edu-accent/10 text-edu-accent'}`}>
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-edu-text font-display flex items-center gap-1.5">
                  Kamida 3 ta vazifani yakunlash
                  {completedTasks >= 3 && <span className="text-[10px] bg-edu-primary/15 text-edu-primary px-2 py-0.5 rounded-full font-bold">Bajarilgan</span>}
                </h3>
                <p className="text-xs text-edu-muted mt-1 leading-normal">
                  Muvaffaqiyatli yakunlangan vazifalar soni 3 tadan kam bo'lmasligi kerak.
                </p>
              </div>
            </div>
            {completedTasks >= 3 ? (
              <CheckCircle2 className="w-5 h-5 text-edu-primary shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-edu-muted shrink-0 mt-1" />
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-edu-muted mb-1.5">
              <span>BAJARILISH PROGRESSI</span>
              <span className="text-edu-text">{completedTasks} / 3 vazifa</span>
            </div>
            <div className="w-full h-2 bg-edu-border/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-edu-accent to-edu-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completedTasksProgress}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Back Button */}
      <Button
        variant="secondary"
        onClick={() => navigate('/gigs')}
        className="w-full h-12 rounded-xl font-bold mt-2 active-bounce text-sm"
      >
        Katalogga qaytish
      </Button>
    </div>
  );
}
