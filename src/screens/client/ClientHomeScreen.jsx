import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../services/users.service';
import { chatApi } from '../../services/chat.service';
import { useMyTasks } from '../../hooks/useTasks';
import { CATEGORIES } from '../../lib/constants';
import { Avatar } from '../../components/ui/Avatar';
import { VerifiedBadge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Plus, ClipboardList, ChevronRight } from 'lucide-react';
import { TaskStatusSkeleton, LeaderboardSkeleton, ChatSkeleton } from '../../components/ui/SkeletonCard';
import { HomeTopBar } from '../../components/layout/HomeTopBar';
import { SectionErrorBoundary } from '../../components/ui/SectionErrorBoundary';
import { cn } from '../../lib/utils';

// --- Extracted Widgets for Error Boundaries ---

function MyTasksStatusWidget() {
  const navigate = useNavigate();
  const { data: myTasks } = useMyTasks('CLIENT');
  
  if (!myTasks) return <TaskStatusSkeleton />;
  
  const openCount = myTasks.filter(t => t.status === 'OPEN').length || 0;
  const inProgressCount = myTasks.filter(t => t.status === 'IN_PROGRESS').length || 0;
  const inReviewCount = myTasks.filter(t => t.status === 'IN_REVIEW').length || 0;

  return (
    <div className="mb-10 bg-edu-surface rounded-[24px] p-6 shadow-premium-md border border-edu-border">
      <div className="flex justify-between items-center mb-6 px-1">
        <h3 className="text-[12px] font-bold text-edu-muted uppercase tracking-[0.15em]">Loyiha holati</h3>
        <button onClick={() => navigate('/my-tasks')} className="text-[12px] font-bold text-edu-primary flex items-center gap-1">
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
            className="flex flex-col items-center text-center group active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-edu-bg flex items-center justify-center text-2xl mb-3 relative group-active:bg-edu-border/50 transition-colors shadow-sm border border-edu-border">
              {item.emoji}
              {item.count > 0 && (
                <span className={cn("absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-edu-surface flex items-center justify-center text-[10px] font-bold text-white", item.color)}>
                  {item.count}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-edu-muted uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveChatWidget() {
  const navigate = useNavigate();
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations().then(r => r.data.data),
    staleTime: 30 * 1000,
    useErrorBoundary: true,
  });

  if (!conversations) return <ChatSkeleton />;
  if (conversations.length === 0) return null;

  const activeChat = conversations[0];

  return (
    <div className="mb-10">
      <h3 className="text-[12px] font-bold text-edu-muted uppercase tracking-[0.15em] mb-4 px-1">So'nggi muloqot</h3>
      <Card 
        isPressable
        onClick={() => { navigate(`/tasks/${activeChat.taskId}/chat`); }}
        className="bg-edu-surface/80 backdrop-blur-xl border-none shadow-premium-md rounded-[28px]"
      >
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar name={activeChat.otherUser?.fullname} avatarUrl={activeChat.otherUser?.avatarUrl} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
              <p className="text-[15px] font-bold text-edu-text truncate">{activeChat.otherUser?.fullname}</p>
              <span className="text-[11px] text-edu-muted font-bold uppercase">
                {activeChat.lastMessage ? new Date(activeChat.lastMessage.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
            <p className="text-[13px] text-edu-muted truncate font-medium">
              {activeChat.lastMessage?.content || 'Fayl yuborildi'}
            </p>
          </div>
          {activeChat.unreadCount > 0 && (
            <div className="w-5 h-5 bg-edu-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {activeChat.unreadCount}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TopFreelancersWidget() {
  const navigate = useNavigate();
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['users', 'leaderboard'],
    queryFn: () => usersApi.leaderboard().then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
    useErrorBoundary: true,
  });

  if (isLoading) return <LeaderboardSkeleton />;

  const topFreelancers = Array.isArray(leaderboardData) ? leaderboardData.slice(0, 3) : (leaderboardData?.users?.slice(0, 3) || []);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="text-[12px] font-bold text-edu-muted uppercase tracking-[0.15em]">Top mutaxassislar</h3>
        <button onClick={() => navigate('/leaderboard')} className="text-[12px] font-bold text-edu-primary flex items-center gap-1">
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
              className="bg-edu-surface border-none shadow-premium-sm rounded-[24px]"
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative">
                  <Avatar name={fl.fullname} avatarUrl={fl.avatarUrl} size="md" />
                  <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-edu-surface shadow-sm flex items-center justify-center text-[10px] font-bold">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[15px] font-bold text-edu-text truncate tracking-tight">{fl.fullname}</p>
                    <VerifiedBadge />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-amber-500 flex items-center gap-0.5">
                      ⭐ {fl.ratingCount ? (fl.ratingSum / fl.ratingCount).toFixed(1) : '5.0'}
                    </span>
                    <span className="text-[11px] text-edu-muted font-bold uppercase tracking-wider">
                      {fl.completedTasksCount || fl._count?.freelancerTasks || 0} bajarilgan
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-edu-surface/50 rounded-[24px] p-8 text-center border border-dashed border-edu-border">
          <p className="text-[13px] font-bold text-edu-muted uppercase tracking-widest">Hozircha mutaxassislar yo'q</p>
        </div>
      )}
    </div>
  );
}

// --- Main Screen ---

export default function ClientHomeScreen() {
  const navigate = useNavigate();

  const handleCategoryClick = (catValue) => {
    navigate('/tasks/create', { state: { category: catValue } });
  };

  return (
    <div className="flex flex-col h-full bg-mesh-aurora pb-24 p-6 overflow-y-auto scrollbar-hide">
      
      {/* ── Header / Greeting ─────────────────────────── */}
      <HomeTopBar greeting="Xush kelibsiz 👋" />

      {/* ── Quick Actions Grid ────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <Card 
          isPressable
          haptic="success"
          onClick={() => { navigate('/tasks/create'); }}
          className="bg-edu-surface border-none shadow-premium-lg relative overflow-hidden flex flex-col justify-between min-h-[160px]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-edu-primary/5 blur-2xl rounded-full pointer-events-none" />
          <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
            <div className="w-12 h-12 rounded-[18px] bg-edu-primary/10 flex items-center justify-center text-edu-primary shadow-sm">
              <Plus size={24} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-edu-text mb-1 tracking-tight">Topshiriq berish</h2>
              <p className="text-edu-muted text-[11px] font-bold uppercase tracking-widest">E'lon qiling</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          isPressable
          haptic="success"
          onClick={() => { navigate('/gigs'); }}
          className="bg-edu-surface border-none shadow-premium-lg relative overflow-hidden flex flex-col justify-between min-h-[160px]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-edu-accent/5 blur-2xl rounded-full pointer-events-none" />
          <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
            <div className="w-12 h-12 rounded-[18px] bg-edu-accent/10 flex items-center justify-center text-edu-accent shadow-sm">
              <ClipboardList size={24} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-edu-text mb-1 tracking-tight">Xizmat buyurtma</h2>
              <p className="text-edu-muted text-[11px] font-bold uppercase tracking-widest">Tayyor yechim</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── My Tasks Status Widget ─────────────────────── */}
      <SectionErrorBoundary fallbackTitle="Loyiha holatini yuklashda xatolik">
        <MyTasksStatusWidget />
      </SectionErrorBoundary>

      {/* ── Active Chat Card (iOS Style) ────────────────── */}
      <SectionErrorBoundary fallbackTitle="Chatlarni yuklashda xatolik">
        <ActiveChatWidget />
      </SectionErrorBoundary>

      {/* ── Popular Categories (Floating Grid) ──────────── */}
      <div className="mb-10">
        <h3 className="text-[12px] font-bold text-edu-muted uppercase tracking-[0.15em] mb-4 px-1">Kategoriyalar</h3>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.slice(0, 4).map(cat => (
            <div 
              key={cat.value} 
              onClick={() => handleCategoryClick(cat.value)}
              className="bg-edu-surface rounded-2xl p-4 flex items-center gap-3 cursor-pointer active-spring shadow-premium-sm border border-edu-border"
            >
              <div className="w-10 h-10 rounded-xl bg-edu-bg flex items-center justify-center text-xl shadow-inner border border-edu-border">
                {cat.emoji}
              </div>
              <span className="text-[13px] font-bold text-edu-text tracking-tight">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top Freelancers (Premium List) ────────────────── */}
      <SectionErrorBoundary fallbackTitle="Reytingni yuklashda xatolik">
        <TopFreelancersWidget />
      </SectionErrorBoundary>
      
    </div>
  );
}
