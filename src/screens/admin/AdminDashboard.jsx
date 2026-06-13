import { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/admin.service';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Crown, 
  AlertOctagon, 
  Gavel, 
  GraduationCap,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';

const ActivityChart = lazy(() => import('./components/ActivityChart'));

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats().then(r => r.data.data),
    refetchInterval: 15000 // auto refresh every 15s
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-edu-primary/20 border-t-edu-primary rounded-full animate-spin" />
        <span className="text-xs font-bold text-edu-muted uppercase tracking-widest">Loading Dashboard Stats...</span>
      </div>
    );
  }

  const statCards = [
    { label: 'Jami Users', value: statsData?.users || 0, icon: Users, textClass: 'text-edu-primary', bgClass: 'bg-edu-primary/10', borderClass: 'border-edu-primary/20', path: '/admin/users' },
    { label: 'Topshiriqlar', value: statsData?.tasks?.total || 0, icon: Briefcase, textClass: 'text-blue-400', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/20', path: '/admin/moderator' },
    { label: 'VIP Arizalar', value: statsData?.pendingVipRequests || 0, icon: Crown, textClass: 'text-amber-400', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/20', path: '/admin/vip', alert: statsData?.pendingVipRequests > 0 },
    { label: 'Shikoyatlar', value: statsData?.pendingReports || 0, icon: AlertOctagon, textClass: 'text-rose-400', bgClass: 'bg-rose-500/10', borderClass: 'border-rose-500/20', path: '/admin/complaints', alert: statsData?.pendingReports > 0 },
    { label: 'Ochiq Nizolar', value: statsData?.openDisputes || 0, icon: Gavel, textClass: 'text-purple-400', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500/20', path: '/admin/disputes', alert: statsData?.openDisputes > 0 },
    { label: 'Talaba So\'rovlari', value: statsData?.pendingStudentVerifications || 0, icon: GraduationCap, textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/20', path: '/admin/users', alert: statsData?.pendingStudentVerifications > 0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* ── Stat Cards Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              onClick={() => navigate(card.path)}
              className={`p-6 bg-edu-surface border border-edu-border rounded-3xl flex flex-col justify-between h-36 cursor-pointer hover:border-edu-primary/30 transition-all active:scale-[0.98] relative overflow-hidden group`}
            >
              {card.alert && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
              
              <div className="flex justify-between items-start">
                <span className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${card.textClass} ${card.bgClass} ${card.borderClass}`}>
                  <Icon size={20} />
                </span>
                <span className="text-edu-muted group-hover:text-edu-text transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-edu-muted uppercase tracking-widest leading-none">{card.label}</p>
                <p className="text-2xl font-bold text-edu-text mt-1.5">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Section (Graph & Active Alerts) ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Neon SVG Chart Widget */}
        <div className="lg:col-span-2 bg-edu-surface-2 border border-edu-border rounded-3xl p-6 flex flex-col justify-between min-h-[350px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-edu-text flex items-center gap-2">
                <Activity size={16} className="text-edu-primary" />
                Tizim Oqimi & Faollik
              </h3>
              <p className="text-xs text-edu-muted mt-0.5">Bajarilgan topshiriqlar ulushi: {statsData?.tasks?.total ? Math.round((statsData?.tasks?.completed / statsData?.tasks?.total) * 100) : 0}%</p>
            </div>
            <div className="flex items-center gap-1 bg-edu-primary/10 text-edu-primary border border-edu-primary/20 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
              <TrendingUp size={12} />
              Realtime
            </div>
          </div>

          <div className="flex-1 px-2 h-48 py-4 relative w-full">
            {statsData?.chartData ? (
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-[10px] text-edu-muted font-bold uppercase tracking-widest animate-pulse">Grafik yuklanmoqda...</div>}>
                <ActivityChart data={statsData.chartData} />
              </Suspense>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[10px] text-edu-muted font-bold uppercase tracking-widest">
                Grafik ma'lumotlari yuklanmoqda...
              </div>
            )}
          </div>
        </div>

        {/* Alerts / Tasks requiring quick action */}
        <div className="bg-edu-surface border border-edu-border rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-edu-text mb-4">Tezkor Moderator Harakatlari</h3>
            <div className="space-y-3.5">
              
              {/* VIP Request Alert */}
              <div 
                onClick={() => navigate('/admin/vip')}
                className="p-3.5 bg-edu-bg border border-edu-border hover:border-edu-primary/30 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Crown size={16} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-edu-text">Kutilayotgan VIP To'lovlar</h4>
                    <p className="text-[10px] text-edu-muted mt-0.5">{statsData?.pendingVipRequests || 0} ta ariza tasdiqlash kutilmoqda</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-edu-muted" />
              </div>

              {/* Reports Alert */}
              <div 
                onClick={() => navigate('/admin/complaints')}
                className="p-3.5 bg-edu-bg border border-edu-border hover:border-edu-primary/30 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <AlertOctagon size={16} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-edu-text">Yopilmagan Shikoyatlar</h4>
                    <p className="text-[10px] text-edu-muted mt-0.5">{statsData?.pendingReports || 0} ta foydalanuvchi shikoyati bor</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-edu-muted" />
              </div>

              {/* Disputes Alert */}
              <div 
                onClick={() => navigate('/admin/disputes')}
                className="p-3.5 bg-edu-bg border border-edu-border hover:border-edu-primary/30 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Gavel size={16} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-edu-text">Ochiq Nizolar (Disputes)</h4>
                    <p className="text-[10px] text-edu-muted mt-0.5">{statsData?.openDisputes || 0} ta shartnoma nizo holatida</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-edu-muted" />
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-edu-border text-center text-[10px] text-edu-muted font-semibold uppercase tracking-wider">
            🚨 Har bir amal auditga yoziladi
          </div>
        </div>

      </div>

    </div>
  );
}
