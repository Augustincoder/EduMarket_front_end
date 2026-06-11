import { create } from 'zustand';
import { notificationApi } from '../services/notification.service';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  nextCursor: null,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await notificationApi.getNotifications({ limit: 20 });
      set({ 
        notifications: res.data.data.notifications, 
        unreadCount: res.data.data.unreadCount,
        nextCursor: res.data.data.nextCursor,
        isLoading: false 
      });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  loadMore: async () => {
    const { nextCursor, notifications } = get();
    if (!nextCursor) return;
    try {
      const res = await notificationApi.getNotifications({ limit: 20, cursor: nextCursor });
      set({
        notifications: [...notifications, ...res.data.data.notifications],
        nextCursor: res.data.data.nextCursor
      });
    } catch (err) {
      console.error(err);
    }
  },

  addNotification: (notif) => {
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === id ? { ...n, isRead: true, status: 'READ' } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (err) {
      console.error(err);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true, status: 'READ' })),
        unreadCount: 0
      }));
    } catch (err) {
      console.error(err);
    }
  },

  clearUnread: () => set({ unreadCount: 0 })
}));
