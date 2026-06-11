import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

function NotificationItem({ notif, onMarkRead }) {
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
      className="relative rounded-2xl overflow-hidden"
    >
      {/* Background showing when swiped */}
      <div className="absolute inset-0 bg-green-500/20 flex items-center px-6 rounded-2xl">
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
            window.location.href = notif.actionUrl;
          }
        }}
        className={cn(
          "p-4 rounded-2xl border transition-colors active-spring relative z-10 w-full",
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
            notifications: p.notifications.map(n => n.id === id ? { ...n, isRead: true, status: 'READ' } : n)
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

  return (
    <PageLayout>
      <Header 
        title="Bildirishnomalar" 
        showBack 
        right={
          allNotifications.some(n => !n.isRead && n.status !== 'READ') ? (
            <button 
              onClick={() => markAllAsRead.mutate()}
              className="w-9 h-9 rounded-full bg-edu-primary/10 flex items-center justify-center press-scale"
            >
              <Check size={18} className="text-edu-primary" />
            </button>
          ) : null
        }
      />
      
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-10 overflow-x-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-2 border-edu-primary border-t-transparent animate-spin"/></div>
        ) : allNotifications.length === 0 ? (
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
            className="w-full py-3 text-xs font-semibold text-edu-primary uppercase tracking-wider active-spring"
          >
            Yana yuklash
          </button>
        )}
      </div>
    </PageLayout>
  );
}
