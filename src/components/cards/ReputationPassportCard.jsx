import { ShieldCheck, Award, TrendingUp, CalendarDays, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/Card';

export function ReputationPassportCard({ profile }) {
  if (!profile) return null;

  const avgRating = profile.ratingCount ? (profile.ratingSum / profile.ratingCount) : 0;
  const isVip = profile.isVip;
  const completionRate = profile.completionRate || 0;
  
  // Compute Trust Level (0 to 100)
  let trustLevel = 50; // Base score
  if (isVip) trustLevel += 20;
  if (avgRating >= 4.5) trustLevel += 15;
  if (profile.completedTasksCount > 10) trustLevel += 10;
  if (profile.completedTasksCount > 50) trustLevel += 5;
  if (completionRate > 90) trustLevel += 10;
  if (trustLevel > 100) trustLevel = 100;

  // Determine Trust Rank
  let trustRank = 'Yangi boshlovchi';
  let trustColor = 'text-gray-500';
  let bgGradient = 'from-gray-500/10 to-transparent border-gray-500/20';

  if (trustLevel >= 90) {
    trustRank = 'Elita (Top 1%)';
    trustColor = 'text-amber-500';
    bgGradient = 'from-amber-500/10 to-orange-500/5 border-amber-500/30';
  } else if (trustLevel >= 75) {
    trustRank = 'Ishonchli Kasb Egas';
    trustColor = 'text-emerald-500';
    bgGradient = 'from-emerald-500/10 to-emerald-400/5 border-emerald-500/30';
  } else if (trustLevel >= 60) {
    trustRank = 'Istiqbolli';
    trustColor = 'text-blue-500';
    bgGradient = 'from-blue-500/10 to-blue-400/5 border-blue-500/30';
  }

  const joinDate = new Date(profile.createdAt);
  const joinYear = joinDate.getFullYear();
  const joinMonth = joinDate.toLocaleDateString('uz-UZ', { month: 'long' });

  return (
    <Card 
      tilt
      glare
      className={cn("relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl border-2 transition-all", bgGradient)} 
      radius="xl"
    >
      {/* Background Watermark */}
      <div className="absolute -right-6 -top-6 opacity-5 rotate-12 pointer-events-none">
        <ShieldCheck size={120} strokeWidth={1} />
      </div>

      <CardContent className="p-5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className={cn("w-5 h-5", trustColor)} />
            <h3 className="font-bold text-edu-text uppercase tracking-widest text-[11px]">Raqamli Pasport</h3>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-edu-surface/80 border border-edu-border/50 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
             <span className={cn("w-2 h-2 rounded-full animate-pulse-subtle", trustLevel >= 75 ? "bg-emerald-500" : "bg-blue-500")} />
             <span className="text-[10px] font-bold text-edu-text uppercase tracking-wider">Tasdiqlangan</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 mb-6">
          <span className="text-[10px] font-bold text-edu-muted uppercase tracking-widest">Ishonch Darajasi</span>
          <div className="flex items-end gap-2">
            <span className={cn("text-3xl font-extrabold tracking-tighter leading-none", trustColor)}>
              {trustLevel}
              <span className="text-lg opacity-50 ml-0.5">%</span>
            </span>
            <span className={cn("text-xs font-bold mb-1 px-2 py-0.5 rounded-md border", trustColor, bgGradient.split(' ')[0], bgGradient.split(' ')[2])}>
              {trustRank}
            </span>
          </div>
          
          {/* Trust Progress Bar */}
          <div className="h-1.5 w-full bg-edu-border/30 rounded-full mt-3 overflow-hidden">
             <div className={cn("h-full rounded-full transition-all duration-1000", trustLevel >= 90 ? "bg-gradient-to-r from-amber-400 to-orange-500" : trustLevel >= 75 ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-blue-400 to-indigo-500")} style={{ width: `${trustLevel}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-edu-border/40">
          <div className="flex items-start gap-2">
            <Award className="w-4 h-4 text-edu-muted mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-edu-muted uppercase tracking-widest leading-none mb-1">Muvaffaqiyat</p>
              <p className="text-sm font-bold text-edu-text">{completionRate}%</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="w-4 h-4 text-edu-muted mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-edu-muted uppercase tracking-widest leading-none mb-1">A'zo bo'lgan</p>
              <p className="text-sm font-bold text-edu-text">{joinMonth}, {joinYear}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-edu-muted mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-edu-muted uppercase tracking-widest leading-none mb-1">Topshiriqlar</p>
              <p className="text-sm font-bold text-edu-text">{profile.completedTasksCount || 0} ta</p>
            </div>
          </div>
          {isVip && (
             <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-edu-muted uppercase tracking-widest leading-none mb-1">VIP Status</p>
                <p className="text-sm font-bold text-amber-500">Faol</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
