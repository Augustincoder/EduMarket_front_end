import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { analyticsApi } from '../../services/other.service';
import { tasksApi } from '../../services/tasks.service';
import { gigsApi } from '../../services/gigs.service';
import { useMyTasks } from '../../hooks/useTasks';
import { formatPrice } from '../../lib/constants';
import { Avatar } from '../../components/ui/Avatar';
import { UserBadge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { hapticLight, hapticSuccess } from '../../lib/telegram';
import { ArrowRight, Wallet, CheckCircle, Search, Clock, Star } from 'lucide-react';

export default function FreelancerHomeScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // 1. Fetch personal stats from analytics API
  const { data: stats } = useQuery({
    queryKey: ['analytics', 'freelancer'],
    queryFn: () => analyticsApi.getMe({ role: 'FREELANCER' }).then(r => r.data.data),
    staleTime: 15 * 1000,
  });

  // 2. Fetch active tasks in progress
  const { data: activeTasks } = useMyTasks('FREELANCER', 'IN_PROGRESS');

  // 3. Filter near-deadline tasks (< 24 hours remaining)
  const now = new Date();
  const nearDeadlineTasks = activeTasks?.filter(task => {
    const deadlineTime = new Date(task.deadline).getTime();
    const timeDiff = deadlineTime - now.getTime();
    return timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000;
  }) || [];

  // 4. Fetch personal gigs (services)
  const { data: gigsData } = useQuery({
    queryKey: ['gigs', 'my', user?.id],
    queryFn: () => gigsApi.getAll({ freelancerId: user?.id }).then(r => r.data.data),
    staleTime: 30 * 1000,
    enabled: !!user?.id,
  });
  const myGigs = gigsData?.gigs || [];

  // 5. Fetch recommendations (latest open tasks)
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', 'recommended'],
    queryFn: () => tasksApi.getAll({ status: 'OPEN', limit: 4 }).then(r => r.data.data),
    staleTime: 30 * 1000,
  });
  const recommendedTasks = tasksData?.tasks || [];

  return (
    <div className="flex flex-col h-full bg-edu-bg pb-24 p-4 overflow-y-auto scrollbar-hide">
      
      {/* ── Header / Greeting ─────────────────────────── */}
      <div className="flex justify-between items-center mb-6 pt-2">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-edu-muted uppercase tracking-wider">Freelancer kabineti 💼</p>
          <h1 className="text-2xl font-black font-display text-edu-text">{user?.fullname}</h1>
        </div>
        <div className="relative press-scale" onClick={() => navigate('/profile')}>
          <Avatar name={user?.fullname} avatarUrl={user?.avatarUrl} size="md" />
          {user?.isVip && (
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-0.5 border border-white text-[8px]">👑</span>
          )}
        </div>
      </div>

      {/* ── Statistics Grid (4 items) ────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card 
          isPressable 
          onPress={() => navigate('/earnings')}
          className="bg-edu-surface border border-edu-border/40 active-bounce relative overflow-hidden"
          radius="2xl"
        >
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wallet size={16} />
            </span>
            <div>
              <p className="text-[10px] font-bold text-edu-muted uppercase tracking-wider">Mening daromadim</p>
              <p className="text-sm font-black text-edu-text mt-0.5 truncate">
                {formatPrice(stats?.totalEarned || 0)} <span className="text-[9px] font-bold text-edu-muted">UZS</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-edu-surface border border-edu-border/40 relative overflow-hidden" radius="2xl">
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="w-7 h-7 rounded-lg bg-edu-primary/10 text-edu-primary flex items-center justify-center">
              <CheckCircle size={16} />
            </span>
            <div>
              <p className="text-[10px] font-bold text-edu-muted uppercase tracking-wider">Bajarilgan ishlar</p>
              <p className="text-sm font-black text-edu-text mt-0.5">{stats?.completedTasks || 0} ta</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-edu-surface border border-edu-border/40 relative overflow-hidden" radius="2xl">
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center">
              <Star size={16} fill="currentColor" />
            </span>
            <div>
              <p className="text-[10px] font-bold text-edu-muted uppercase tracking-wider">Mening reytingim</p>
              <p className="text-sm font-black text-edu-text mt-0.5">
                ⭐ {user?.ratingCount ? (user.ratingSum / user.ratingCount).toFixed(1) : '5.0'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-edu-surface border border-edu-border/40 relative overflow-hidden" radius="2xl">
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Clock size={16} />
            </span>
            <div>
              <p className="text-[10px] font-bold text-edu-muted uppercase tracking-wider">Javob berish vaqti</p>
              <p className="text-sm font-black text-edu-text mt-0.5">
                {user?.avgResponseHrs ? `${user.avgResponseHrs.toFixed(1)} soat` : 'Tezda ⚡'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Action Search Card ──────────────────── */}
      <div className="bg-gradient-to-br from-edu-accent to-[#7064E2] rounded-3xl p-5 text-white shadow-lg shadow-edu-accent/20 mb-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <h2 className="text-xl font-black font-display mb-1">Vazifalar qidirish</h2>
        <p className="text-white/80 mb-4 text-xs font-medium max-w-[240px]">Bilimingizga mos topshiriqlarni toping va real daromad oling.</p>
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-1.5 bg-white text-edu-accent px-5 py-2.5 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all active:scale-95"
        >
          <Search size={16} />
          Ishlarni ko'rish
        </button>
      </div>

      {/* ── Urgent Deadlines Alert ─────────────────────── */}
      {nearDeadlineTasks.length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            ⚠️ Muddat yaqinlashgan vazifalar!
          </h3>
          <div className="space-y-2">
            {nearDeadlineTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3.5 rounded-2xl flex justify-between items-center cursor-pointer active-bounce"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-black text-red-900 dark:text-red-300 truncate">{task.title}</h4>
                  <p className="text-[10px] text-red-700 dark:text-red-400/80 mt-0.5">Topshirish muddati kam qoldi!</p>
                </div>
                <span className="text-[10px] bg-red-600 text-white font-black px-2.5 py-1 rounded-xl shrink-0">
                  {Math.round((new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60))} soat qoldi
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Active Tasks ──────────────────────────────── */}
      {activeTasks && activeTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-edu-text uppercase tracking-wider mb-3">Faol topshiriqlarim</h3>
          <div className="space-y-2.5">
            {activeTasks.map(task => (
              <Card 
                key={task.id}
                isPressable
                onPress={() => { navigate(`/tasks/${task.id}`); }}
                className="bg-gradient-to-tr from-indigo-50/40 to-edu-primary/5 border border-edu-primary/20 hover:border-edu-primary/30 active-bounce"
                radius="2xl"
              >
                <CardContent className="p-3.5 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-edu-text truncate">{task.title}</h4>
                    <p className="text-[10px] text-edu-muted mt-0.5">Mijoz: {task.client?.fullname || 'Mijoz'}</p>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl shrink-0">
                    Bajarilmoqda
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommended Tasks ─────────────────────────── */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-edu-text uppercase tracking-wider">Tavsiya etilgan ishlar</h3>
          <Link to="/tasks" className="text-xs font-bold text-edu-primary flex items-center gap-0.5 hover:underline">
            Barchasi <ArrowRight size={12} />
          </Link>
        </div>

        {isTasksLoading ? (
          <div className="space-y-2.5 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-edu-surface rounded-2xl border border-edu-border/20" />
            ))}
          </div>
        ) : recommendedTasks.length > 0 ? (
          <div className="space-y-2.5">
            {recommendedTasks.map(task => (
              <Card
                key={task.id}
                isPressable
                onPress={() => { navigate(`/tasks/${task.id}`); }}
                className="bg-edu-surface border border-edu-border/40 hover:border-edu-border active-bounce"
                radius="2xl"
              >
                <CardContent className="p-3.5 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-edu-text line-clamp-1">{task.title}</h4>
                    <span className="text-[10px] font-black text-edu-primary shrink-0">
                      {formatPrice(task.priceMin)} - {formatPrice(task.priceMax)} so'm
                    </span>
                  </div>
                  <p className="text-[11px] text-edu-muted line-clamp-2">{task.description}</p>
                  <div className="flex items-center justify-between text-[9px] text-edu-muted font-bold pt-1 border-t border-edu-border/20">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-orange-500" />
                      {new Date(task.deadline).toLocaleDateString('uz-UZ')} gacha
                    </span>
                    <span>📂 {task.category}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-edu-surface rounded-2xl p-6 text-center border border-edu-border/40">
            <p className="text-xs font-bold text-edu-muted">Hozircha tavsiya etilgan ishlar yo'q</p>
          </div>
        )}
      </div>

      {/* ── My Gigs ───────────────────────────────────── */}
      <div className="mt-2 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-edu-text uppercase tracking-wider">Mening giglarim (Xizmatlar)</h3>
          <Link to="/gigs/create" className="text-xs font-bold text-edu-primary flex items-center gap-0.5 hover:underline">
            Yangi qo'shish +
          </Link>
        </div>
        {myGigs.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {myGigs.map(gig => (
              <Card 
                key={gig.id}
                isPressable
                onPress={() => { navigate('/gigs'); }}
                className="bg-edu-surface border border-edu-border/40 hover:border-edu-border active-bounce"
                radius="2xl"
              >
                <CardContent className="p-3 flex flex-col justify-between h-28">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-edu-text line-clamp-2">{gig.title}</h4>
                    <p className="text-[10px] text-edu-muted font-medium">{gig.deliveryDays} kun yetkazib berish</p>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-edu-border/20">
                    <span className="text-[9px] font-bold text-edu-muted">{gig.isActive ? 'Faol ✅' : 'Faol emas ❌'}</span>
                    <span className="text-xs font-black text-edu-primary">{formatPrice(gig.price)} so'm</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-edu-surface rounded-2xl p-6 text-center border border-edu-border/40">
            <p className="text-xs font-bold text-edu-muted mb-2">Hozircha xizmatlar katalogingiz bo'sh</p>
            <button 
              onClick={() => navigate('/gigs/create')}
              className="text-[11px] font-bold text-white bg-edu-primary px-4 py-2 rounded-xl active:scale-95 transition-transform"
            >
              Birinchi gigingizni qo'shing
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
