// src/hooks/useSocket.jsx
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useNotificationStore } from '../store/notificationStore';
import { STATUS_CONFIG } from '../lib/constants';
import { navigateTo } from '../app/navigation';
import i18n from '../lib/i18n';
import toast from 'react-hot-toast';

// Only allow same-app relative paths to prevent open redirects.
const toSafeInternalPath = (url) =>
  typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') ? url : null;

export function useSocket() {
  const token = useAuthStore((s) => s.token);
  const connect = useChatStore((s) => s.connect);
  const disconnect = useChatStore((s) => s.disconnect);
  const socket = useChatStore((s) => s.socket);
  const connected = useChatStore((s) => s.connected);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (token) {
      connect(token);
      useNotificationStore.getState().fetchNotifications();
    } else {
      disconnect();
    }
  }, [token, connect, disconnect]);

  useEffect(() => {
    if (!socket) return;

    const handleTaskStatusChanged = ({ taskId, newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
      toast.success(i18n.t('system.socket.taskStatusChanged', { status: statusLabel }));
    };

    const handleNewBid = ({ taskId, bidCount }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'bids'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast(i18n.t('system.socket.newBid', { total: bidCount }));
    };

    const handleBidAccepted = ({ taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(i18n.t('system.socket.bidAccepted'));
    };

    const handleNewNotification = (notif) => {
      useNotificationStore.getState().addNotification(notif);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Dynamic Island style capsule toast
      toast.custom((t) => (
        <div
          onClick={() => {
            toast.dismiss(t.id);
            const target = toSafeInternalPath(notif.actionUrl);
            if (target) navigateTo(target);
          }}
          className={`${
            t.visible ? 'animate-in slide-in-from-top-4 fade-in duration-300' : 'animate-out slide-out-to-top-4 fade-out duration-300'
          } max-w-[90%] sm:max-w-sm mx-auto mt-2 bg-black/90 backdrop-blur-xl shadow-lg rounded-full pointer-events-auto flex items-center cursor-pointer active:scale-95 transition-transform overflow-hidden px-4 py-3`}
        >
          <div className="flex-shrink-0 mr-3">
            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
              ✨
            </div>
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-sm font-bold text-white truncate">
              {notif.title}
            </p>
            <p className="text-[11px] text-slate-300 truncate">
              {notif.message}
            </p>
          </div>
          {notif.type === 'new_bid' && (
            <div className="flex-shrink-0 ml-2">
              <span className="bg-indigo-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {i18n.t('system.socket.view')}
              </span>
            </div>
          )}
        </div>
      ), { duration: 5000, position: 'top-center' });
    };

    socket.on('task_status_changed', handleTaskStatusChanged);
    socket.on('new_bid', handleNewBid);
    socket.on('bid_accepted', handleBidAccepted);
    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('task_status_changed', handleTaskStatusChanged);
      socket.off('new_bid', handleNewBid);
      socket.off('bid_accepted', handleBidAccepted);
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, queryClient]);

  return { socket, connected };
}
