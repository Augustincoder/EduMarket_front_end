import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import { EmptyState } from '../../components/ui/EmptyState';
import { notificationApi } from '../../services/notification.service';
import { useNotificationStore } from '../../store/notificationStore';
import { Check, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { hapticLight, hapticImpact } from '../../lib/telegram';
import { chatApi } from '../../services/chat.service';
import { useQuery } from '@tanstack/react-query';
import { Users, UserPlus } from 'lucide-react';

function ChatInviteItem({ invite, onAction }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="p-4 rounded-xl border bg-indigo-500/10 border-indigo-500/30 mb-3 flex items-start gap-3"
    >
      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0">
        <Users size={20} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-edu-text">Guruhga taklif</h3>
        <p className="text-xs text-edu-muted mt-1 leading-relaxed">
          Sizni <strong>{invite.chatRoom?.name || 'Guruh'}</strong> guruhiga taklif qilishdi.
        </p>
        <div className="flex gap-2 mt-3">
          <button 
            onClick={() => onAction(invite.id, 'accept')}
            className="flex-1 py-1.5 bg-indigo-500 text-white text-xs font-bold rounded-lg active:scale-95 transition-transform flex items-center justify-center gap-1"
          >
            <UserPlus size={14} /> Qabul qilish
          </button>
          <button 
            onClick={() => onAction(invite.id, 'reject')}
            className="px-3 py-1.5 bg-edu-surface text-edu-muted text-xs font-bold rounded-lg border border-edu-border active:scale-95 transition-transform"
          >
            Rad etish
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function NotificationItem({ notif, onMarkRead }) {
  const navigate = useNavigate();
  const isRead = notif.isRead || notif.status === 'READ';

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 80 && !isRead) {
      hapticImpact('heavy');
      onMarkRead(notif.id);
    } else {
      hapticLight();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, rotateX: 90 }}
      transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
      className="relative rounded-xl overflow-hidden"
    >
      {/* Background showing when swiped */}
      <div className="absolute inset-0 bg-green-500/20 flex items-center px-6 rounded-xl">
        <CheckCircle2 size={24} className="text-green-500" />
      </div>

      <motion.div
        drag={isRead ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 0.98 }}
        onClick={() => {
          if (!isRead) onMarkRead(notif.id);
          if (notif.actionUrl) {
            navigate(notif.actionUrl);
          }
        }}
        className={cn(
          "p-4 rounded-xl border transition-colors active:scale-[0.97] transition-transform duration-[120ms] relative z-10 w-full",
          isRead ? "bg-edu-surface border-edu-border" : "bg-edu-bg border-edu-primary/30 shadow-ios"
        )}
      >
        <div className="flex gap-3">
          <div className="mt-0.5 flex-shrink-0">
            {isRead ? <CheckCircle2 size={20} className="text-edu-muted" /> : <Circle size={20} fill="currentColor" className="text-edu-primary" />}
          </div>
          <div>
            <h3 className={cn("text-sm font-semibold", isRead ? "text-edu-text" : "text-edu-primary")}>{notif.title}</h3>
            <p className="text-xs text-edu-muted mt-1 leading-relaxed">{notif.message}</p>
            <span className="text-[10px] font-bold text-edu-muted/60 mt-2 block uppercase tracking-wider">
              {new Date(notif.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function NotificationInboxScreen() {
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationStore(s => s.setUnreadCount);

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => notificationApi.getNotifications({ cursor: pageParam }).then(r => {
      setUnreadCount(r.data.data.unreadCount);
      return r.data.data;
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null,
  });

  const markAsRead = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onMutate: async (id) => {
      hapticLight();
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const prevData = queryClient.getQueryData(['notifications']);
      queryClient.setQueryData(['notifications'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(p => ({
            ...p,
            notifications: (p.notifications || []).map(n => n.id === id ? { ...n, isRead: true, status: 'READ' } : n)
          }))
        };
      });
      return { prevData };
    },
    onError: (err, id, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(['notifications'], context.prevData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadCount(0);
      toast.success("Barcha bildirishnomalar o'qildi!");
      hapticImpact('heavy');
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.3 },
        colors: ['#4F46E5', '#10B981', '#F59E0B']
      });
    }
  });

  const allNotifications = data?.pages ? data.pages.reduce((acc, p) => acc.concat(p.notifications || []), []) : [];

  // Fetch Chat Invites
  const { data: invitesData, refetch: refetchInvites } = useQuery({
    queryKey: ['chatInvites'],
    queryFn: () => chatApi.getMyInvites().then(r => r.data.data),
  });
  
  const pendingInvites = invitesData || [];

  const handleInviteAction = async (inviteId, action) => {
    try {
      if (action === 'accept') {
        await chatApi.acceptInvite(inviteId);
        toast.success("Guruhga qo'shildingiz!");
      } else {
        await chatApi.rejectInvite(inviteId);
        toast.success("Taklif rad etildi.");
      }
      refetchInvites();
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <PageLayout>
      <Header 
        title="Bildirishnomalar" 
        showBack 
        right={
          allNotifications.some(n => !n.isRead && n.status !== 'READ') ? (
            <button 
              onClick={() => markAllAsRead.mutate()}
              className="w-9 h-9 rounded-full bg-edu-primary/10 flex items-center justify-center active:scale-95 duration-[120ms]"
            >
              <Check size={18} className="text-edu-primary" />
            </button>
          ) : null
        }
      />
      
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-10 overflow-x-hidden">
        
        {/* Chat Invites Section */}
        <AnimatePresence>
          {pendingInvites.map(invite => (
            <ChatInviteItem key={`inv-${invite.id}`} invite={invite} onAction={handleInviteAction} />
          ))}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-2 border-edu-primary border-t-transparent animate-spin"/></div>
        ) : allNotifications.length === 0 && pendingInvites.length === 0 ? (
          <EmptyState
            emoji="📭"
            title="Hozircha bo'sh"
            subtitle="Sizda hech qanday yangi bildirishnoma yo'q."
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {allNotifications.map((notif) => (
              <NotificationItem key={notif.id} notif={notif} onMarkRead={(id) => markAsRead.mutate(id)} />
            ))}
          </AnimatePresence>
        )}

        {hasNextPage && (
          <button 
            onClick={() => fetchNextPage()}
            className="w-full py-3 text-xs font-semibold text-edu-primary uppercase tracking-wider active:scale-[0.97] transition-transform duration-[120ms]"
          >
            Yana yuklash
          </button>
        )}
      </div>
    </PageLayout>
  );
}
