import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { analyticsApi } from '../../services/other.service';
import { tasksApi } from '../../services/tasks.service';
import { gigsApi } from '../../services/gigs.service';
import { useMyTasks } from '../../hooks/useTasks';
import { formatPrice } from '../../lib/utils';
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
  const now = Date.now();
  const nearDeadlineTasks = activeTasks?.filter(task => {
    const deadlineTime = new Date(task.deadline).getTime();
    const timeDiff = deadlineTime - now;
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
      <div className="flex justify-between items-center mb-8 pt-4">
        <div className="space-y-1">
          <p className="text-[11px] font-black text-edu-muted uppercase tracking-[0.1em] opacity-80">Freelancer kabineti 💼</p>
          <h1 className="text-3xl font-black font-display text-edu-text tracking-ios-display">{user?.fullname}</h1>
        </div>
        <div className="relative active-spring" onClick={() => navigate('/profile')}>
          <Avatar name={user?.fullname} avatarUrl={user?.avatarUrl} size="lg" className="ring-4 ring-edu-surface shadow-ios" />
          {user?.isVip && (
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-edu-vip to-amber-600 rounded-full p-1 border-2 border-edu-surface text-[10px] shadow-sm">👑</span>
          )}
        </div>
      </div>

      {/* ── Statistics Grid (4 items) ────────────────── */}
      <div className="grid grid-cols-2 gap-3.5 mb-8">
        <Card 
          isPressable 
          onClick={() => navigate('/earnings')}
          className="bg-edu-surface border border-edu-border/20 active-spring relative overflow-hidden shadow-ios"
          radius="2xl"
        >
          <CardContent className="p-4 flex flex-col justify-between h-28">
            <span className="w-9 h-9 rounded-2xl bg-edu-primary/10 text-edu-primary flex items-center justify-center">
              <Wallet size={20} />
            </span>
            <div>
              <p className="text-[10px] font-black text-edu-muted uppercase tracking-wider">Mening daromadim</p>
              <p className="text-[15px] font-black text-edu-text mt-1 truncate">
                {formatPrice(stats?.totalEarned || 0)} <span className="text-[9px] font-bold text-edu-muted">UZS</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-edu-surface border border-edu-border/20 relative overflow-hidden shadow-ios" radius="2xl">
          <CardContent className="p-4 flex flex-col justify-between h-28">
            <span className="w-9 h-9 rounded-2xl bg-edu-primary/10 text-edu-primary flex items-center justify-center">
              <CheckCircle size={20} />
            </span>
            <div>
              <p className="text-[10px] font-black text-edu-muted uppercase tracking-wider">Bajarilgan ishlar</p>
              <p className="text-[17px] font-black text-edu-text mt-1">{stats?.completedTasks || 0} ta</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-edu-surface border border-edu-border/20 relative overflow-hidden shadow-ios" radius="2xl">
          <CardContent className="p-4 flex flex-col justify-between h-28">
            <span className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center">
              <Star size={20} fill="currentColor" />
            </span>
            <div>
              <p className="text-[10px] font-black text-edu-muted uppercase tracking-wider">Mening reytingim</p>
              <p className="text-[17px] font-black text-edu-text mt-1">
                ⭐ {user?.ratingCount ? (user.ratingSum / user.ratingCount).toFixed(1) : '5.0'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-edu-surface border border-edu-border/20 relative overflow-hidden shadow-ios" radius="2xl">
          <CardContent className="p-4 flex flex-col justify-between h-28">
            <span className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Clock size={20} />
            </span>
            <div>
              <p className="text-[10px] font-black text-edu-muted uppercase tracking-wider">Javob berish vaqti</p>
              <p className="text-[17px] font-black text-edu-text mt-1">
                {user?.avgResponseHrs ? `${user.avgResponseHrs.toFixed(1)}s` : 'Tezda ⚡'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Action Search Card ──────────────────── */}
      <div className="bg-gradient-to-br from-edu-accent to-[#7064E2] squircle p-6 text-white shadow-lg shadow-edu-accent/20 mb-8 relative overflow-hidden border border-white/20">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-2xl font-black font-display mb-1 tracking-ios-display">Vazifalar qidirish</h2>
        <p className="text-white/80 mb-5 text-[13px] font-medium max-w-[240px] leading-relaxed tracking-ios-text">Bilimingizga mos topshiriqlarni toping va real daromad oling.</p>
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center justify-center gap-2 bg-white text-edu-accent px-6 py-3 rounded-[18px] font-black text-[14px] shadow-md hover:bg-slate-50 transition-all active:scale-95 w-full md:w-auto"
        >
          <Search size={18} />
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
                  {Math.round((new Date(task.deadline).getTime() - now) / (1000 * 60 * 60))} soat qoldi
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
                onClick={() => { navigate(`/tasks/${task.id}`); }}
                className="bg-gradient-to-tr from-edu-primary/5 to-edu-accent/5 border border-edu-primary/20 hover:border-edu-primary/30 active-bounce"
                radius="2xl"
              >
                <CardContent className="p-3.5 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-edu-text truncate">{task.title}</h4>
                    <p className="text-[10px] text-edu-muted mt-0.5">Mijoz: {task.client?.fullname || 'Mijoz'}</p>
                  </div>
                  <span className="text-[10px] bg-edu-primary/10 text-edu-primary font-bold px-3 py-1.5 rounded-xl shrink-0 border border-edu-primary/20">
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
                onClick={() => { navigate(`/tasks/${task.id}`); }}
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
                onClick={() => { navigate('/gigs'); }}
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
