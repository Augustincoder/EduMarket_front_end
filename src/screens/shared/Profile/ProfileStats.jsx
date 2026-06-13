import { Trophy, Star, TrendingUp, Zap, Flame, ClipboardList, Wallet } from 'lucide-react';
import { calculateLevel, calculateStreak } from '../../../lib/gamification';
import { formatPrice } from '../../../lib/utils';
import { WidgetError } from '../../../components/ui/SectionErrorBoundary';

export function ProfileStats({ me, activeRole, clientStats, isLoading, error, onRetry }) {
  if (error) {
    return <WidgetError fallbackTitle="Statistikani yuklashda xatolik" onRetry={onRetry} />;
  }

  if (activeRole === 'CLIENT') {
    if (isLoading) {
      return (
        <div className="grid grid-cols-3 gap-2.5 animate-pulse">
          <div className="bg-edu-surface border border-edu-border/30 rounded-xl min-h-[82px] shadow-sm"></div>
          <div className="bg-edu-surface border border-edu-border/30 rounded-xl min-h-[82px] shadow-sm"></div>
          <div className="bg-edu-surface border border-edu-border/30 rounded-xl min-h-[82px] shadow-sm"></div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-edu-surface border border-edu-border/30 rounded-xl p-3 flex flex-col justify-between min-h-[82px] shadow-sm relative overflow-hidden">
          <ClipboardList size={22} className="text-edu-primary" />
          <div className="mt-2">
            <p className="text-lg font-bold font-display text-edu-text leading-none">{clientStats?.createdTasks ?? 0}</p>
            <p className="text-[9px] font-bold text-edu-muted uppercase tracking-wider mt-1 leading-snug">E'lon qilingan</p>
          </div>
        </div>
        <div className="bg-edu-surface border border-edu-border/30 rounded-xl p-3 flex flex-col justify-between min-h-[82px] shadow-sm relative overflow-hidden">
          <Wallet size={22} className="text-indigo-500" />
          <div className="mt-2">
            <p className="text-lg font-bold font-display text-edu-text leading-none truncate">{formatPrice(clientStats?.totalSpent ?? 0)}</p>
            <p className="text-[9px] font-bold text-edu-muted uppercase tracking-wider mt-1 leading-snug">Sarflandi</p>
          </div>
        </div>
        <div className="bg-edu-surface border border-edu-border/30 rounded-xl p-3 flex flex-col justify-between min-h-[82px] shadow-sm relative overflow-hidden">
          <Zap size={22} className="text-orange-500" />
          <div className="mt-2">
            <p className="text-lg font-bold font-display text-edu-text leading-none">
              {(clientStats?.openTasks ?? 0) + (clientStats?.inProgressTasks ?? 0) + (clientStats?.inReviewTasks ?? 0)}
            </p>
            <p className="text-[9px] font-bold text-edu-muted uppercase tracking-wider mt-1 leading-snug">Faol ishlar</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'FREELANCER') {
    const avgRating = me?.ratingCount ? (me.ratingSum / me.ratingCount).toFixed(1) : '—';
    const lvl = calculateLevel(me?.completedTasksCount);
    
    return (
      <div className="space-y-4">
        {/* Gamification: Level & Streak */}
        <div className="bg-edu-surface border border-edu-border/40 shadow-sm rounded-xl p-4 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-xl rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-center mb-3 relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-edu-muted">Sizning darajangiz</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-edu-text">{lvl.name}</span>
                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-md font-bold">LVL {lvl.level}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-edu-muted">Davomiylik</span>
              <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900/50">
                <Flame size={16} className="text-orange-500" />
                <span className="text-orange-600 dark:text-orange-400 font-bold text-xs">{calculateStreak(me)} kun</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative z-10">
            <div className="flex justify-between text-[9px] font-bold text-edu-muted mb-1.5">
              <span>Joriy daraja</span>
              {lvl.nextTarget ? (
                <span>Yangi darajaga: {lvl.nextTarget - (me?.completedTasksCount || 0)} ta ish</span>
              ) : (
                <span className="text-yellow-500">Eng yuqori daraja!</span>
              )}
            </div>
            <div className="h-2 w-full bg-edu-border/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${Math.min(100, Math.max(0, lvl.progress * 100))}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Bajarilgan ishlar', value: me?.completedTasksCount ?? 0, icon: <Trophy size={24} className="text-green-500" />, color: 'from-green-500/5 to-transparent border-green-500/20' },
            { label: 'O\'rtacha reyting', value: avgRating !== '—' ? avgRating : '—', icon: <Star size={24} className="text-amber-500" />, color: 'from-amber-500/5 to-transparent border-amber-500/20' },
            { label: 'Muvaffaqiyat', value: me?.completionRate ? `${Math.round(me.completionRate)}%` : '100%', icon: <TrendingUp size={24} className="text-blue-500" />, color: 'from-blue-500/5 to-transparent border-blue-500/20' },
            { label: 'Javob tezligi', value: me?.avgResponseHrs ? `${me.avgResponseHrs}s` : '1s', icon: <Zap size={24} className="text-orange-500" />, color: 'from-orange-500/5 to-transparent border-orange-500/20' },
          ].map((item, i) => (
            <div key={i} className={`bg-edu-surface bg-gradient-to-br ${item.color} border p-5 rounded-md flex flex-col justify-between h-full min-h-[110px] shadow-sm transition-all hover:border-edu-text/10`}>
              <span>{item.icon}</span>
              <div className="mt-4">
                <p className="text-2xl font-bold font-display text-edu-text leading-none">{item.value}</p>
                <p className="text-[9px] font-bold text-edu-muted uppercase tracking-wider mt-2 leading-snug opacity-70">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
