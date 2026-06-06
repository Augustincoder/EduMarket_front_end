import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { usersApi } from '../../services/users.service';
import { chatApi } from '../../services/chat.service';
import { useMyTasks } from '../../hooks/useTasks';
import { CATEGORIES } from '../../lib/constants';
import { Avatar } from '../../components/ui/Avatar';
import { UserBadge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { hapticLight, hapticSuccess } from '../../lib/telegram';
import { MessageSquare, Plus, ArrowRight, ClipboardList, Clock, Eye } from 'lucide-react';
import { ClientHomeSkeleton } from '../../components/ui/SkeletonCard';

export default function ClientHomeScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // 1. Fetch my tasks to compute counts
  const { data: myTasks } = useMyTasks('CLIENT');
  const openCount = myTasks?.filter(t => t.status === 'OPEN').length || 0;
  const inProgressCount = myTasks?.filter(t => t.status === 'IN_PROGRESS').length || 0;
  const inReviewCount = myTasks?.filter(t => t.status === 'IN_REVIEW').length || 0;

  // 2. Fetch top freelancers
  const { data: leaderboardData, isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['users', 'leaderboard'],
    queryFn: () => usersApi.leaderboard().then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
  const topFreelancers = Array.isArray(leaderboardData) ? leaderboardData.slice(0, 3) : (leaderboardData?.users?.slice(0, 3) || []);

  // 3. Fetch active conversations
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations().then(r => r.data.data),
    staleTime: 30 * 1000,
  });
  const activeChats = conversations || [];
  const totalUnreadChats = activeChats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const handleCategoryClick = (catValue) => {
    navigate('/tasks/create', { state: { category: catValue } });
  };

  const isLoading = isLeaderboardLoading || !myTasks || !conversations;

  if (isLoading) {
    return <ClientHomeSkeleton />;
  }

  return (
    <div className="flex flex-col h-full bg-edu-bg pb-24 p-4 overflow-y-auto scrollbar-hide">
      
      {/* ── Header / Greeting ─────────────────────────── */}
      <div className="flex justify-between items-center mb-8 pt-4">
        <div className="space-y-1">
          <p className="text-[11px] font-black text-edu-muted uppercase tracking-[0.1em] opacity-80">Xush kelibsiz 👋</p>
          <h1 className="text-3xl font-black font-display text-edu-text tracking-ios-display">{user?.fullname}</h1>
        </div>
        <div className="relative active-spring" onClick={() => navigate('/profile')}>
          <Avatar name={user?.fullname} avatarUrl={user?.avatarUrl} size="lg" className="ring-4 ring-edu-surface shadow-ios" />
          {user?.isVip && (
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-edu-vip to-amber-600 rounded-full p-1 border-2 border-edu-surface text-[10px] shadow-sm">👑</span>
          )}
        </div>
      </div>

      {/* ── Quick Actions Grid ────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Card 1: Topshiriq berish */}
        <Card 
          isPressable
          haptic="success"
          onClick={() => { navigate('/tasks/create'); }}
          className="bg-gradient-to-br from-edu-primary to-edu-primary-d squircle text-white shadow-btn relative overflow-hidden flex flex-col justify-between min-h-[150px] border border-white/20"
        >
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Plus size={24} className="text-white" />
            </div>
            <div className="mt-4">
              <h2 className="text-[16px] font-black font-display mb-1 tracking-ios-display">Topshiriq berish</h2>
              <p className="text-white/80 text-[11px] font-bold leading-snug tracking-ios-text">Vazifa e'lon qiling</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Xizmat buyurtma */}
        <Card 
          isPressable
          haptic="success"
          onClick={() => { navigate('/gigs'); }}
          className="bg-gradient-to-br from-edu-accent to-[#7064E2] squircle text-white shadow-lg shadow-edu-accent/20 relative overflow-hidden flex flex-col justify-between min-h-[150px] border border-white/20"
        >
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <ClipboardList size={24} className="text-white" />
            </div>
            <div className="mt-4">
              <h2 className="text-[16px] font-black font-display mb-1 tracking-ios-display">Xizmat buyurtma</h2>
              <p className="text-white/80 text-[11px] font-bold leading-snug tracking-ios-text">Tayyor xizmatlar</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── My Tasks Status Grid ─────────────────────── */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-xs font-black text-edu-muted uppercase tracking-[0.1em]">Mening vazifalarim</h3>
          <Link to="/my-tasks" className="text-xs font-bold text-edu-primary flex items-center gap-0.5 hover:opacity-70 transition-opacity">
            Barchasi <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Ochiq', count: openCount, emoji: '📋', status: 'OPEN' },
            { label: 'Jarayonda', count: inProgressCount, emoji: '⚡', status: 'IN_PROGRESS' },
            { label: 'Tekshiruvda', count: inReviewCount, emoji: '🔍', status: 'IN_REVIEW' },
          ].map((item) => (
            <div 
              key={item.status}
              onClick={() => navigate(`/my-tasks?status=${item.status}`)}
              className="bg-edu-surface shadow-ios border border-edu-border/30 rounded-[22px] p-4 flex flex-col items-center text-center cursor-pointer active-spring"
            >
              <span className="text-2xl mb-2.5">{item.emoji}</span>
              <span className="text-xl font-black text-edu-text tracking-ios-display">{item.count}</span>
              <span className="text-[10px] font-bold text-edu-muted uppercase tracking-wider mt-1">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Chat Card (if any) ────────────────── */}
      {activeChats.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-edu-text uppercase tracking-wider mb-3">So'nggi chat</h3>
          <Card 
            isPressable
            onClick={() => { navigate(`/tasks/${activeChats[0].taskId}/chat`); }}
            className="bg-edu-surface border border-edu-border/40 hover:border-edu-border transition-colors active-bounce"
            radius="2xl"
          >
            <CardContent className="p-3.5 flex items-center gap-3">
              <Avatar name={activeChats[0].otherUser?.fullname} avatarUrl={activeChats[0].otherUser?.avatarUrl} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-edu-text truncate">{activeChats[0].otherUser?.fullname}</p>
                <p className="text-[11px] text-edu-muted truncate mt-0.5">
                  {activeChats[0].lastMessage?.content || 'Fayl yuborildi'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-[9px] text-edu-muted font-medium">
                  {activeChats[0].lastMessage ? new Date(activeChats[0].lastMessage.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
                {activeChats[0].unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
                    {activeChats[0].unreadCount}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Top Categories ───────────────────────────── */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-edu-text uppercase tracking-wider mb-3">Mashhur kategoriyalar</h3>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.slice(0, 6).map(cat => (
            <div 
              key={cat.value} 
              onClick={() => handleCategoryClick(cat.value)}
              className="bg-edu-surface border border-edu-border/40 hover:border-edu-primary/20 rounded-2xl p-3 flex items-center gap-2 cursor-pointer active-bounce transition-all hover:shadow-sm"
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="text-xs font-bold text-edu-text">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top Freelancers ──────────────────────────── */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-edu-text uppercase tracking-wider">Top mutaxassislar</h3>
          <Link to="/leaderboard" className="text-xs font-bold text-edu-primary flex items-center gap-0.5 hover:underline">
            Reyting <ArrowRight size={12} />
          </Link>
        </div>

        {topFreelancers.length > 0 ? (
          <div className="space-y-2.5">
            {topFreelancers.map((fl, idx) => (
              <Card
                key={fl.id}
                isPressable
                onClick={() => { navigate(`/profile/${fl.id}`); }}
                className="bg-edu-surface border border-edu-border/40 active-bounce hover:border-edu-border"
                radius="2xl"
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <span className="text-xs font-black text-edu-muted w-4 text-center">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </span>
                  <Avatar name={fl.fullname} avatarUrl={fl.avatarUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-edu-text truncate">{fl.fullname}</p>
                      <UserBadge badge={fl.badge} isVip={fl.isVip} size="xs" />
                    </div>
                    <p className="text-[10px] text-edu-muted mt-0.5">
                      {fl.skills?.slice(0, 2).join(', ') || 'Mutaxassis'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className="text-xs font-black text-amber-500">
                      ⭐ {fl.ratingCount ? (fl.ratingSum / fl.ratingCount).toFixed(1) : '5.0'}
                    </span>
                    <span className="text-[10px] text-edu-muted font-medium">
                      {fl.completedTasksCount || fl._count?.freelancerTasks || 0} topshiriq
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-edu-surface rounded-2xl p-6 text-center border border-edu-border/40">
            <p className="text-xs font-bold text-edu-muted">Hozircha mutaxassislar topilmadi</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
