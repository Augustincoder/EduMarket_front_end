import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { usersApi, chatApi } from '../services/api';
import { useMyTasks } from '../hooks/useTasks';
import { CATEGORIES } from '../lib/constants';
import { Avatar } from '../components/ui/Avatar';
import { UserBadge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { hapticLight, hapticSuccess } from '../lib/telegram';
import { MessageSquare, Plus, ArrowRight, ClipboardList, Clock, Eye } from 'lucide-react';

export default function ClientHomeScreen() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
    hapticLight();
    navigate('/tasks/create', { state: { category: catValue } });
  };

  return (
    <div className="flex flex-col h-full bg-edu-bg pb-24 p-4 overflow-y-auto scrollbar-hide">
      
      {/* ── Header / Greeting ─────────────────────────── */}
      <div className="flex justify-between items-center mb-6 pt-2">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-edu-muted uppercase tracking-wider">Xush kelibsiz 👋</p>
          <h1 className="text-2xl font-black font-display text-edu-text">{user?.fullname}</h1>
        </div>
        <div className="relative press-scale" onClick={() => navigate('/profile')}>
          <Avatar name={user?.fullname} avatarUrl={user?.avatarUrl} size="md" />
          {user?.isVip && (
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-0.5 border border-white text-[8px]">👑</span>
          )}
        </div>
      </div>

      {/* ── Quick Actions Grid ────────────────────────── */}
      <div className="grid grid-cols-2 gap-3.5 mb-6">
        {/* Card 1: Topshiriq berish */}
        <div 
          onClick={() => { hapticSuccess(); navigate('/tasks/create'); }}
          className="bg-gradient-to-br from-edu-primary to-edu-primary-d rounded-3xl p-4 text-white shadow-md shadow-edu-primary/10 relative overflow-hidden cursor-pointer press-scale flex flex-col justify-between min-h-[135px] border border-white/5"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
            <Plus size={18} className="text-white" />
          </div>
          <div className="mt-4">
            <h2 className="text-sm font-black font-display mb-0.5">Topshiriq berish</h2>
            <p className="text-white/80 text-[10px] font-medium leading-relaxed">Talabalarga tezkor vazifa e'lon qiling</p>
          </div>
        </div>

        {/* Card 2: Xizmat buyurtma */}
        <div 
          onClick={() => { hapticSuccess(); navigate('/gigs'); }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-4 text-white shadow-md shadow-blue-600/10 relative overflow-hidden cursor-pointer press-scale flex flex-col justify-between min-h-[135px] border border-white/5"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
            <ClipboardList size={18} className="text-white" />
          </div>
          <div className="mt-4">
            <h2 className="text-sm font-black font-display mb-0.5">Xizmat buyurtma</h2>
            <p className="text-white/80 text-[10px] font-medium leading-relaxed">Tayyor giglar/xizmatlarni sotib oling</p>
          </div>
        </div>
      </div>

      {/* ── My Tasks Status Grid ─────────────────────── */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-edu-text uppercase tracking-wider">Mening vazifalarim</h3>
          <Link to="/my-tasks" className="text-xs font-bold text-edu-primary flex items-center gap-0.5 hover:underline">
            Barchasi <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div 
            onClick={() => navigate('/my-tasks?status=OPEN')}
            className="bg-edu-surface border border-edu-border/40 rounded-2xl p-3 flex flex-col items-center text-center cursor-pointer active-bounce"
          >
            <span className="text-xs text-edu-primary bg-edu-primary/10 w-8 h-8 rounded-full flex items-center justify-center mb-2">📋</span>
            <span className="text-lg font-black text-edu-text">{openCount}</span>
            <span className="text-[10px] font-bold text-edu-muted mt-0.5">Kutmoqda</span>
          </div>
          <div 
            onClick={() => navigate('/my-tasks?status=IN_PROGRESS')}
            className="bg-edu-surface border border-edu-border/40 rounded-2xl p-3 flex flex-col items-center text-center cursor-pointer active-bounce"
          >
            <span className="text-xs text-blue-600 bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center mb-2">⚡</span>
            <span className="text-lg font-black text-edu-text">{inProgressCount}</span>
            <span className="text-[10px] font-bold text-edu-muted mt-0.5">Jarayonda</span>
          </div>
          <div 
            onClick={() => navigate('/my-tasks?status=IN_REVIEW')}
            className="bg-edu-surface border border-edu-border/40 rounded-2xl p-3 flex flex-col items-center text-center cursor-pointer active-bounce"
          >
            <span className="text-xs text-amber-600 bg-amber-50 w-8 h-8 rounded-full flex items-center justify-center mb-2">🔍</span>
            <span className="text-lg font-black text-edu-text">{inReviewCount}</span>
            <span className="text-[10px] font-bold text-edu-muted mt-0.5">Tekshiruvda</span>
          </div>
        </div>
      </div>

      {/* ── Active Chat Card (if any) ────────────────── */}
      {activeChats.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-edu-text uppercase tracking-wider mb-3">So'nggi chat</h3>
          <Card 
            isPressable
            onPress={() => { hapticLight(); navigate(`/tasks/${activeChats[0].taskId}/chat`); }}
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

        {isLeaderboardLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-edu-surface rounded-2xl border border-edu-border/20" />
            ))}
          </div>
        ) : topFreelancers.length > 0 ? (
          <div className="space-y-2.5">
            {topFreelancers.map((fl, idx) => (
              <Card
                key={fl.id}
                isPressable
                onPress={() => { hapticLight(); navigate(`/profile/${fl.id}`); }}
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
