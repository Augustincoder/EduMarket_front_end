// src/screens/HomeScreen.jsx
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '../components/ui/Card';
import { FilterChip as Chip } from '../components/ui/Chip';
import { ChevronRight, Clock, Star, CheckCircle, Zap } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge, UserBadge } from '../components/ui/Badge';
import { TaskCardSkeleton } from '../components/ui/SkeletonCard';
import TaskCard from '../components/cards/TaskCard';
import { useAuthStore } from '../store/authStore';
import { usersApi, tasksApi } from '../services/api';
import { formatPrice } from '../lib/utils';
import { hapticLight } from '../lib/telegram';

function StatCard({ icon, label, value, color = 'text-edu-text' }) {
  return (
    <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="lg">
      <CardContent className="p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-lg">{icon}</div>
          <span className="text-xs text-edu-muted font-medium">{label}</span>
        </div>
        <p className={`text-xl font-black font-display ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export default function HomeScreen() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ['users', 'me'],
    queryFn:  () => usersApi.getMe().then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

  const { data: taskData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', { status: 'OPEN', limit: 3 }],
    queryFn:  () => tasksApi.getAll({ status: 'OPEN', limit: 3 }).then((r) => r.data.data),
    staleTime: 30 * 1000,
  });

  const { data: activeTask } = useQuery({
    queryKey: ['tasks', { status: 'IN_PROGRESS', myTasks: true }],
    queryFn:  () => tasksApi.getAll({ status: 'IN_PROGRESS', myTasks: true, limit: 1 })
      .then((r) => r.data.data?.tasks?.[0] || null),
    staleTime: 30 * 1000,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['users', 'leaderboard'],
    queryFn:  () => usersApi.leaderboard().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const me = profile || user;
  const avgRating = me?.ratingCount ? (me.ratingSum / me.ratingCount).toFixed(1) : '—';

  return (
    <PageLayout bgClass="bg-mesh-aurora">
      <div className="px-4 pt-6 pb-safe space-y-6">

        {/* ── Greeting ──────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-edu-muted font-medium">Salom 👋</p>
            <h1 className="text-xl font-black font-display text-edu-text leading-tight">
              {me?.fullname?.split(' ')[0] || 'Foydalanuvchi'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <UserBadge badge={me?.badge} isVip={me?.isVip} />
            {!me?.isVip && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-500/30 text-yellow-600 dark:text-yellow-500 text-[11px] font-bold uppercase tracking-wider active-bounce backdrop-blur-md"
                onClick={() => { hapticLight(); navigate('/vip'); }}
              >
                👑 VIP
              </button>
            )}
          </div>
        </div>

        {/* ── Stats Grid ────────────────────────────── */}
        <section>
          <p className="text-xs font-semibold text-edu-muted uppercase tracking-wider mb-3">
            📊 Statistika
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon="✅"
              label="Bajarilgan"
              value={me?.completedTasksCount ?? 0}
              color="text-edu-primary"
            />
            <StatCard
              icon="⭐"
              label="Reyting"
              value={avgRating}
              color="text-yellow-600"
            />
            <StatCard
              icon="📈"
              label="Yakunlash %"
              value={me?.completionRate ? `${Math.round(me.completionRate)}%` : '—'}
              color="text-edu-accent"
            />
            <StatCard
              icon="⚡"
              label="Javob tezligi"
              value={me?.avgResponseHrs ? `${me.avgResponseHrs}s` : '—'}
              color="text-edu-text"
            />
          </div>
        </section>

        {/* ── Active Task ───────────────────────────── */}
        {activeTask && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-bold text-edu-text flex items-center gap-2 uppercase tracking-wide">
                <div className="w-2 h-2 rounded-full bg-edu-primary animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                Faol vazifam
              </h2>
            </div>
            
            <div 
              onClick={() => { hapticLight(); navigate(`/tasks/${activeTask.id}`); }}
              className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-edu-primary to-edu-primary-d p-5 shadow-lg shadow-edu-primary/20 active-bounce cursor-pointer border border-white/10"
            >
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[16px] text-white leading-tight line-clamp-2 mb-2">
                      {activeTask.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="bg-white rounded-md shadow-sm">
                        <StatusBadge status={activeTask.status} size="sm" />
                      </div>
                      {activeTask.deadline && (
                        <div className="flex items-center gap-1 text-xs font-medium text-white/90">
                          <Clock size={12} />
                          <span>{new Date(activeTask.deadline).toLocaleDateString('uz-UZ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticLight();
                      navigate(`/tasks/${activeTask.id}`);
                    }}
                    className="flex-1 h-[38px] rounded-xl bg-white/20 border border-white/10 text-[13px] font-semibold text-white flex items-center justify-center gap-1.5 hover:bg-white/30 transition-colors"
                  >
                    Batafsil
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticLight();
                      navigate(`/tasks/${activeTask.id}/chat`);
                    }}
                    className="flex-1 h-[38px] rounded-xl bg-white text-edu-primary text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"
                  >
                    Chatga o'tish
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── New Tasks ─────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-edu-muted uppercase tracking-wider">
              🆕 Yangi vazifalar
            </p>
            <button
              onClick={() => { hapticLight(); navigate('/tasks'); }}
              className="flex items-center gap-1 text-edu-primary text-xs font-semibold press-scale"
            >
              Barchasi <ChevronRight size={14} />
            </button>
          </div>

          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <TaskCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {taskData?.tasks?.slice(0, 3).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>

        {/* ── Leaderboard Preview ───────────────────── */}
        {leaderboard?.users?.length > 0 && (
          <section className="pb-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-edu-muted uppercase tracking-wider">
                🏆 Top freelancerlar
              </p>
              <button
                onClick={() => { hapticLight(); navigate('/leaderboard'); }}
                className="flex items-center gap-1 text-edu-primary text-xs font-semibold press-scale"
              >
                Ko'rish <ChevronRight size={14} />
              </button>
            </div>

            <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
              <CardContent className="p-0">
                {leaderboard.users.slice(0, 5).map((u, i) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-edu-border/40 last:border-0 press-scale cursor-pointer"
                    onClick={() => { hapticLight(); navigate(`/profile/${u.id}`); }}
                  >
                    <span className="w-6 text-center text-sm font-black text-edu-muted">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <Avatar name={u.fullname} avatarUrl={u.avatarUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-edu-text truncate">{u.fullname}</p>
                      <p className="text-xs text-edu-muted">
                        {u.ratingCount ? `⭐ ${(u.ratingSum / u.ratingCount).toFixed(1)}` : '—'}
                        {' · '}{u.completedTasksCount ?? 0} ish
                      </p>
                    </div>
                    <UserBadge badge={u.badge} isVip={u.isVip} size="xs" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

      </div>
    </PageLayout>
  );
}
