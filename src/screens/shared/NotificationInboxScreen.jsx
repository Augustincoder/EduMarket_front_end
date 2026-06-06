import { useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import { EmptyState } from '../../components/ui/EmptyState';
import { notificationApi } from '../../services/notification.service';
import { useNotificationStore } from '../../store/notificationStore';
import { Bell, Check, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

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
  });

  const markAsRead = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadCount(0);
      toast.success("Barcha bildirishnomalar o'qildi!");
    }
  });

  const allNotifications = data?.pages.flatMap(p => p.notifications) || [];

  return (
    <PageLayout>
      <Header 
        title="Bildirishnomalar" 
        showBack 
        right={
          allNotifications.some(n => !n.isRead) ? (
            <button 
              onClick={() => markAllAsRead.mutate()}
              className="w-9 h-9 rounded-full bg-edu-primary/10 flex items-center justify-center press-scale"
            >
              <Check size={18} className="text-edu-primary" />
            </button>
          ) : null
        }
      />
      
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-2 border-edu-primary border-t-transparent animate-spin"/></div>
        ) : allNotifications.length === 0 ? (
          <EmptyState
            emoji="📭"
            title="Hozircha bo'sh"
            subtitle="Sizda hech qanday yangi bildirishnoma yo'q."
          />
        ) : (
          allNotifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => {
                if (!notif.isRead) markAsRead.mutate(notif.id);
                if (notif.actionUrl) {
                  // handle navigation if needed, for TMA we might use WebApp.openTelegramLink
                }
              }}
              className={cn(
                "p-4 rounded-2xl border transition-all active-spring",
                notif.isRead ? "bg-edu-surface border-edu-border" : "bg-edu-primary/5 border-edu-primary/30 shadow-sm"
              )}
            >
              <div className="flex gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {notif.isRead ? <CheckCircle2 size={20} className="text-edu-muted" /> : <Circle size={20} fill="currentColor" className="text-edu-primary" />}
                </div>
                <div>
                  <h3 className={cn("text-sm font-semibold", notif.isRead ? "text-edu-text" : "text-edu-primary")}>{notif.title}</h3>
                  <p className="text-xs text-edu-muted mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] font-bold text-edu-muted/60 mt-2 block uppercase tracking-wider">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
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
