// src/screens/client/ClientHomeScreen.jsx
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../services/users.service';
import { chatApi } from '../../services/chat.service';
import { useMyTasks } from '../../hooks/useTasks';
import { useCategoryStore } from '../../store/categoryStore';
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

  const items = [
    { label: 'Ochiq', count: openCount, emoji: '📋', status: 'OPEN', bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
    { label: 'Jarayonda', count: inProgressCount, emoji: '⚡', status: 'IN_PROGRESS', bg: 'bg-blue-500/10', color: 'text-blue-500' },
    { label: 'Tekshiruv', count: inReviewCount, emoji: '🔍', status: 'IN_REVIEW', bg: 'bg-amber-500/10', color: 'text-amber-500' },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="text-[12px] font-bold text-edu-muted uppercase tracking-[0.05em]">Loyiha holati</h3>
        <button onClick={() => navigate('/my-tasks')} className="text-[12px] font-bold text-edu-primary flex items-center">
          Hammasi <ChevronRight size={14} />
        </button>
      </div>
      
      {/* Horizontal scroll 80px height cards */}
      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x px-1">
        {items.map((item) => (
          <div 
            key={item.label}
            onClick={() => navigate(`/my-tasks?status=${item.status}`)}
            className="flex-shrink-0 w-[140px] h-[80px] flex items-center gap-3 bg-edu-surface rounded-lg p-3 snap-center cursor-pointer border border-edu-border shadow-sm active:scale-95 transition-transform"
          >
            <div className={cn("w-12 h-12 rounded-md flex items-center justify-center text-[20px]", item.bg)}>
              {item.emoji}
            </div>
            <div className="flex flex-col">
              <span className={cn("text-[18px] font-bold leading-tight", item.color)}>{item.count}</span>
              <span className="text-[11px] font-semibold text-edu-muted">{item.label}</span>
            </div>
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
    <div className="mb-8 px-1">
      <h3 className="text-[12px] font-bold text-edu-muted uppercase tracking-[0.05em] mb-3">So'nggi muloqot</h3>
      <Card 
        isPressable
        onClick={() => { navigate(`/tasks/${activeChat.taskId}/chat`); }}
        className="border-edu-border"
      >
        <CardContent className="p-4 flex items-center gap-3">
          <Avatar name={activeChat.otherUser?.fullname} avatarUrl={activeChat.otherUser?.avatarUrl} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
              <p className="text-[14px] font-bold text-edu-text truncate">{activeChat.otherUser?.fullname}</p>
              <span className="text-[11px] text-edu-muted font-medium">
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
    <div className="mb-6 px-1">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[12px] font-bold text-edu-muted uppercase tracking-[0.05em]">Top mutaxassislar</h3>
        <button onClick={() => navigate('/leaderboard')} className="text-[12px] font-bold text-edu-primary flex items-center">
          Hammasi <ChevronRight size={14} />
        </button>
      </div>

      {topFreelancers.length > 0 ? (
        <div className="space-y-3">
          {topFreelancers.map((fl, idx) => (
            <div
              key={fl.id}
              onClick={() => { navigate(`/profile/${fl.id}`); }}
              className="flex items-center gap-3 p-3 bg-edu-surface rounded-[16px] border border-edu-border cursor-pointer active:scale-95 transition-transform"
            >
              <div className="relative">
                <Avatar name={fl.fullname} avatarUrl={fl.avatarUrl} size="md" />
                <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-edu-surface shadow-sm border border-edu-border flex items-center justify-center text-[10px] font-bold">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[14px] font-bold text-edu-text truncate">{fl.fullname}</p>
                  <VerifiedBadge />
                </div>
                <div className="flex items-center gap-3 text-[12px] font-medium text-edu-muted">
                  <span className="text-amber-500">⭐ {fl.ratingCount ? (fl.ratingSum / fl.ratingCount).toFixed(1) : '5.0'}</span>
                  <span>{fl.completedTasksCount || fl._count?.freelancerTasks || 0} ta ish</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-edu-surface rounded-[16px] p-6 text-center border border-dashed border-edu-border">
          <p className="text-[13px] font-medium text-edu-muted">Hozircha mutaxassislar yo'q</p>
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
  const getTrendingCategories = useCategoryStore(s => s.getTrendingCategories);

  return (
    <div className="flex flex-col h-full bg-edu-bg pb-24 px-4 py-4 overflow-y-auto scrollbar-hide">
      
      <HomeTopBar greeting="Xush kelibsiz 👋" />

      {/* ── Stats Bar (Horizontal scroll) ─────────────── */}
      <SectionErrorBoundary fallbackTitle="Loyiha holatini yuklashda xatolik">
        <MyTasksStatusWidget />
      </SectionErrorBoundary>

      {/* ── Quick Actions Grid ────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-8 px-1">
        <Card 
          isPressable
          haptic="success"
          onClick={() => { navigate('/tasks/create'); }}
          className="bg-edu-primary border-none shadow-btn min-h-[100px]"
        >
          <CardContent className="p-4 flex flex-col justify-between h-full relative z-10">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white mb-2">
              <Plus size={20} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-white mb-0.5 leading-tight">+ Topshiriq</h2>
            </div>
          </CardContent>
        </Card>

        <Card 
          isPressable
          haptic="success"
          onClick={() => { navigate('/gigs'); }}
          className="bg-edu-surface-2 border border-edu-border min-h-[100px]"
        >
          <CardContent className="p-4 flex flex-col justify-between h-full relative z-10">
            <div className="w-8 h-8 rounded-full bg-edu-bg flex items-center justify-center text-edu-primary mb-2 border border-edu-border">
              <ClipboardList size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-edu-text mb-0.5 leading-tight">Xizmatlar</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity ───────────────────────────── */}
      <SectionErrorBoundary fallbackTitle="Chatlarni yuklashda xatolik">
        <ActiveChatWidget />
      </SectionErrorBoundary>

      {/* ── Popular Categories (Horizontal Chips) ─────── */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-[12px] font-bold text-edu-muted uppercase tracking-[0.05em]">Kategoriyalar</h3>
        </div>
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide px-1">
          {getTrendingCategories().map(cat => (
            <button 
              key={cat.value} 
              onClick={() => handleCategoryClick(cat.value)}
              className="flex-shrink-0 h-[36px] px-4 rounded-full bg-edu-surface border border-edu-border flex items-center gap-1.5 text-[13px] font-medium text-edu-text active:scale-95 transition-transform"
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Freelancers ───────────────────────────── */}
      <SectionErrorBoundary fallbackTitle="Reytingni yuklashda xatolik">
        <TopFreelancersWidget />
      </SectionErrorBoundary>
      
    </div>
  );
}
