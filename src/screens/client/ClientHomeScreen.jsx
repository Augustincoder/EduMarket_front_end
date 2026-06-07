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
import { Plus, ArrowRight, ClipboardList, ChevronRight } from 'lucide-react';
import { ClientHomeSkeleton } from '../../components/ui/SkeletonCard';
import { HomeTopBar } from '../../components/layout/HomeTopBar';

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

  const handleCategoryClick = (catValue) => {
    navigate('/tasks/create', { state: { category: catValue } });
  };

  const isLoading = isLeaderboardLoading || !myTasks || !conversations;

  if (isLoading) {
    return <ClientHomeSkeleton />;
  }

  return (
    <div className="flex flex-col h-full bg-mesh-aurora pb-24 p-6 overflow-y-auto scrollbar-hide">
      
      {/* ── Header / Greeting ─────────────────────────── */}
      <HomeTopBar greeting="Xush kelibsiz 👋" />

      {/* ── Quick Actions Grid ────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {/* Card 1: Topshiriq berish */}
        <Card 
          isPressable
          haptic="success"
          onClick={() => { navigate('/tasks/create'); }}
          className="bg-white dark:bg-[#1C1C1E] border-none shadow-premium-lg relative overflow-hidden flex flex-col justify-between min-h-[160px]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#007AFF]/5 blur-2xl rounded-full pointer-events-none" />
          <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
            <div className="w-12 h-12 rounded-[18px] bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] shadow-sm">
              <Plus size={24} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-[17px] font-black text-gray-900 dark:text-white mb-1 tracking-tight">Topshiriq berish</h2>
              <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-widest">E'lon qiling</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Xizmat buyurtma */}
        <Card 
          isPressable
          haptic="success"
          onClick={() => { navigate('/gigs'); }}
          className="bg-white dark:bg-[#1C1C1E] border-none shadow-premium-lg relative overflow-hidden flex flex-col justify-between min-h-[160px]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#5856D6]/5 blur-2xl rounded-full pointer-events-none" />
          <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
            <div className="w-12 h-12 rounded-[18px] bg-[#5856D6]/10 flex items-center justify-center text-[#5856D6] shadow-sm">
              <ClipboardList size={24} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-[17px] font-black text-gray-900 dark:text-white mb-1 tracking-tight">Xizmat buyurtma</h2>
              <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-widest">Tayyor yechim</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── My Tasks Status Widget ─────────────────────── */}
      <div className="mb-10 bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-premium-md border border-black/[0.02] dark:border-white/[0.03]">
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Loyiha holati</h3>
          <button onClick={() => navigate('/my-tasks')} className="text-[12px] font-black text-[#007AFF] flex items-center gap-1">
            Hammasi <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Ochiq', count: openCount, emoji: '📋', color: 'bg-emerald-500' },
            { label: 'Jarayon', count: inProgressCount, emoji: '⚡', color: 'bg-blue-500' },
            { label: 'Tekshiruv', count: inReviewCount, emoji: '🔍', color: 'bg-orange-500' },
          ].map((item) => (
            <div 
              key={item.label}
              onClick={() => navigate(`/my-tasks?status=${item.label === 'Ochiq' ? 'OPEN' : item.label === 'Jarayon' ? 'IN_PROGRESS' : 'IN_REVIEW'}`)}
              className="flex flex-col items-center text-center group active:scale-95 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-2xl mb-3 relative group-active:bg-gray-100 transition-colors shadow-sm border border-black/[0.03] dark:border-white/5">
                {item.emoji}
                {item.count > 0 && (
                  <span className={cn("absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-[#1C1C1E] flex items-center justify-center text-[10px] font-black text-white", item.color)}>
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Chat Card (iOS Style) ────────────────── */}
      {activeChats.length > 0 && (
        <div className="mb-10">
          <h3 className="text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4 px-1">So'nggi muloqot</h3>
          <Card 
            isPressable
            onClick={() => { navigate(`/tasks/${activeChats[0].taskId}/chat`); }}
            className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-none shadow-premium-md rounded-[28px]"
          >
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar name={activeChats[0].otherUser?.fullname} avatarUrl={activeChats[0].otherUser?.avatarUrl} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="text-[15px] font-black text-gray-900 dark:text-white truncate">{activeChats[0].otherUser?.fullname}</p>
                  <span className="text-[11px] text-gray-400 font-bold uppercase">
                    {activeChats[0].lastMessage ? new Date(activeChats[0].lastMessage.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate font-medium">
                  {activeChats[0].lastMessage?.content || 'Fayl yuborildi'}
                </p>
              </div>
              {activeChats[0].unreadCount > 0 && (
                <div className="w-5 h-5 bg-[#007AFF] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {activeChats[0].unreadCount}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Popular Categories (Floating Grid) ──────────── */}
      <div className="mb-10">
        <h3 className="text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4 px-1">Kategoriyalar</h3>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.slice(0, 4).map(cat => (
            <div 
              key={cat.value} 
              onClick={() => handleCategoryClick(cat.value)}
              className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 flex items-center gap-3 cursor-pointer active-spring shadow-premium-sm border border-black/[0.01] dark:border-white/[0.02]"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-xl shadow-inner border border-black/[0.03] dark:border-white/5">
                {cat.emoji}
              </div>
              <span className="text-[13px] font-black text-gray-800 dark:text-gray-200 tracking-tight">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top Freelancers (Premium List) ────────────────── */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Top mutaxassislar</h3>
          <button onClick={() => navigate('/leaderboard')} className="text-[12px] font-black text-[#007AFF] flex items-center gap-1">
            Reyting <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>

        {topFreelancers.length > 0 ? (
          <div className="space-y-3">
            {topFreelancers.map((fl, idx) => (
              <Card
                key={fl.id}
                isPressable
                onClick={() => { navigate(`/profile/${fl.id}`); }}
                className="bg-white dark:bg-[#1C1C1E] border-none shadow-premium-sm rounded-[24px]"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative">
                    <Avatar name={fl.fullname} avatarUrl={fl.avatarUrl} size="md" />
                    <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm flex items-center justify-center text-[10px] font-black">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[15px] font-black text-gray-900 dark:text-white truncate tracking-tight">{fl.fullname}</p>
                      <VerifiedBadge />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-black text-amber-500 flex items-center gap-0.5">
                        ⭐ {fl.ratingCount ? (fl.ratingSum / fl.ratingCount).toFixed(1) : '5.0'}
                      </span>
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                        {fl.completedTasksCount || fl._count?.freelancerTasks || 0} bajarilgan
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 dark:bg-white/5 rounded-[32px] p-8 text-center border border-dashed border-gray-200 dark:border-white/10">
            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Hozircha mutaxassislar yo'q</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
