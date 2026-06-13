// src/screens/freelancer/FreelancerHomeScreen.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { analyticsApi } from '../../services/other.service';
import { tasksApi } from '../../services/tasks.service';
import { formatPrice } from '../../lib/utils';
import { Card, CardContent } from '../../components/ui/Card';
import { ArrowRight, Search, Clock } from 'lucide-react';
import { HomeTopBar } from '../../components/layout/HomeTopBar';
import { SectionErrorBoundary } from '../../components/ui/SectionErrorBoundary';
import { TaskStatusSkeleton } from '../../components/ui/SkeletonCard';
import { cn } from '../../lib/utils';

// --- Extracted Widgets for Error Boundaries ---

function StatisticsWidget({ user }) {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics', 'freelancer'],
    queryFn: () => analyticsApi.getMe({ role: 'FREELANCER' }).then(r => r.data.data),
    staleTime: 15 * 1000,
    throwOnError: true,
  });

  if (isLoading) return <TaskStatusSkeleton />;

  const items = [
    { label: 'Daromad', value: formatPrice(stats?.totalEarned || 0) + " uzs", emoji: '💸', bg: 'bg-emerald-500/10', color: 'text-emerald-500', nav: '/earnings' },
    { label: 'Bajarildi', value: (stats?.completedTasks || 0), emoji: '✅', bg: 'bg-blue-500/10', color: 'text-blue-500', nav: '/tasks' },
    { label: 'Reyting', value: (user?.ratingCount ? (user.ratingSum / user.ratingCount).toFixed(1) : '5.0'), emoji: '⭐', bg: 'bg-amber-500/10', color: 'text-amber-500', nav: '/profile' },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="text-[12px] font-bold text-edu-muted uppercase tracking-[0.05em]">Statistika</h3>
      </div>
      
      {/* Horizontal scroll 80px height cards */}
      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x px-1">
        {items.map((item) => (
          <div 
            key={item.label}
            onClick={() => navigate(item.nav)}
            className="flex-shrink-0 w-[150px] h-[80px] flex items-center gap-3 bg-edu-surface rounded-[16px] p-3 snap-center cursor-pointer border border-edu-border shadow-sm active:scale-95 transition-transform"
          >
            <div className={cn("w-12 h-12 rounded-[12px] flex items-center justify-center text-[20px]", item.bg)}>
              {item.emoji}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={cn("text-[16px] font-bold leading-tight truncate", item.color)}>{item.value}</span>
              <span className="text-[11px] font-semibold text-edu-muted">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveTasksWidget() {
  const navigate = useNavigate();
  const { data: activeTasks, isLoading } = useQuery({
    queryKey: ['tasks', 'my', { role: 'FREELANCER', status: 'IN_PROGRESS' }],
    queryFn: () => tasksApi.getMyTasks({ role: 'FREELANCER', status: 'IN_PROGRESS' }).then(r => r.data.data),
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
    throwOnError: true,
  });

  const [now] = useState(() => Date.now());

  if (isLoading) return <TaskStatusSkeleton />;
  if (!activeTasks || activeTasks.length === 0) return null;

  return (
    <div className="mb-8 px-1">
      <h3 className="text-[12px] font-bold text-edu-muted uppercase tracking-[0.05em] mb-3">Faol ishlar</h3>
      <div className="space-y-3">
        {activeTasks.map(task => {
          const timeDiff = new Date(task.deadline).getTime() - now;
          const isUrgent = timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000;

          return (
            <Card 
              key={task.id}
              isPressable
              onClick={() => { navigate(`/tasks/${task.id}`); }}
              className={cn("border border-edu-border", isUrgent && "border-red-500/50 bg-red-500/5")}
            >
              <CardContent className="p-4 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <h4 className="text-[14px] font-bold text-edu-text truncate">{task.title}</h4>
                  <p className="text-[12px] text-edu-muted mt-0.5">Mijoz: {task.client?.fullname || 'Noma\'lum'}</p>
                </div>
                {isUrgent ? (
                  <span className="text-[10px] bg-red-500 text-white font-bold px-3 py-1.5 rounded-full shrink-0">
                    {Math.max(1, Math.round(timeDiff / (1000 * 60 * 60)))} soat qoldi
                  </span>
                ) : (
                  <span className="text-[10px] bg-edu-primary-l text-edu-primary font-bold px-3 py-1.5 rounded-full shrink-0 border border-edu-primary-xl">
                    Jarayonda
                  </span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function RecommendedTasksWidget() {
  const navigate = useNavigate();
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', 'recommended'],
    queryFn: () => tasksApi.getAll({ status: 'OPEN', limit: 4 }).then(r => r.data.data),
    staleTime: 30 * 1000,
    throwOnError: true,
  });
  
  const recommendedTasks = tasksData?.tasks || [];

  return (
    <div className="mb-8 px-1">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[12px] font-bold text-edu-muted uppercase tracking-[0.05em]">Yangi ishlar</h3>
        <Link to="/tasks" className="text-[12px] font-bold text-edu-primary flex items-center">
          Barchasi <ArrowRight size={14} className="ml-1" />
        </Link>
      </div>

      {isTasksLoading ? (
        <TaskStatusSkeleton />
      ) : recommendedTasks.length > 0 ? (
        <div className="space-y-3">
          {recommendedTasks.map(task => (
            <Card
              key={task.id}
              isPressable
              onClick={() => { navigate(`/tasks/${task.id}`); }}
              className="border border-edu-border"
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-[14px] font-bold text-edu-text line-clamp-1">{task.title}</h4>
                  <span className="text-[12px] font-bold text-edu-primary shrink-0">
                    {formatPrice(task.priceMin)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-edu-muted font-medium pt-2">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-orange-500" />
                    {new Date(task.deadline).toLocaleDateString('uz-UZ')}
                  </span>
                  <span>{task.category}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-edu-surface rounded-[16px] p-6 text-center border border-dashed border-edu-border">
          <p className="text-[13px] font-medium text-edu-muted">Hozircha tavsiya etilgan ishlar yo'q</p>
        </div>
      )}
    </div>
  );
}

// --- Main Screen ---

export default function FreelancerHomeScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex flex-col h-full bg-edu-bg pb-24 px-4 py-4 overflow-y-auto scrollbar-hide">
      
      <HomeTopBar greeting="Salom freelancer 👋" />

      {/* ── Stats Bar (Horizontal scroll) ─────────────── */}
      <SectionErrorBoundary fallbackTitle="Statistikani yuklashda xatolik">
        <StatisticsWidget user={user} />
      </SectionErrorBoundary>

      {/* ── Quick Action Search Card ──────────────────── */}
      <div className="mb-8 px-1">
        <Card 
          isPressable
          haptic="success"
          onClick={() => { navigate('/tasks'); }}
          className="bg-edu-accent border-none shadow-btn min-h-[120px] relative overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-5 flex flex-col justify-between h-full relative z-10 text-white">
            <h2 className="text-[20px] font-bold font-display mb-1">Yangi ish topish</h2>
            <p className="text-[12px] font-medium text-white/80 max-w-[200px] mb-4">Mijozlar kutmoqda, eng yaxshi buyurtmani oling.</p>
            <div className="flex items-center gap-2 text-[13px] font-bold">
              <Search size={16} /> Qidirish
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Active Tasks ──────────────────────────────── */}
      <SectionErrorBoundary fallbackTitle="Faol topshiriqlarni yuklashda xatolik">
        <ActiveTasksWidget />
      </SectionErrorBoundary>

      {/* ── Recommended Tasks ─────────────────────────── */}
      <SectionErrorBoundary fallbackTitle="Tavsiyalarni yuklashda xatolik">
        <RecommendedTasksWidget />
      </SectionErrorBoundary>

    </div>
  );
}
