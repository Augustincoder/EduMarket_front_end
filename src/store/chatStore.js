// src/store/chatStore.js
import { create } from 'zustand';
import { io } from 'socket.io-client';
import { chatApi } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const BACKOFF_DELAYS = [1000, 2000, 4000, 8000, 16000];

export const useChatStore = create((set, get) => ({
  socket:      null,
  connected:   false,
  messages:    {},       // Record<taskId, Message[]>
  typingUsers: {},       // Record<taskId, userId[]>
  conversations: [],     // Array of Conversation
  totalUnread:  0,
  retryCount:  0,

  connect: (token) => {
    const existing = get().socket;
    if (existing) {
      if (existing.auth?.token === token) return;
      existing.disconnect();
    }

    const socket = io(SOCKET_URL, {
      auth:              { token },
      transports:        ['websocket', 'polling'],
      reconnection:      true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 16000,
    });

    socket.on('connect',    () => { set({ connected: true, retryCount: 0 }); });
    socket.on('disconnect', () => { set({ connected: false }); });

    socket.on('new_message', (msg) => {
      const taskId = msg.taskId;
      set((s) => ({
        messages: {
          ...s.messages,
          [taskId]: [...(s.messages[taskId] || []), msg],
        },
      }));
      // Auto-reload conversations to sync lists and unread counts
      get().loadConversations();
    });

    socket.on('user_typing', ({ taskId, userId }) => {
      set((s) => {
        const cur = s.typingUsers[taskId] || [];
        if (cur.includes(userId)) return s;
        const updated = { ...s.typingUsers, [taskId]: [...cur, userId] };
        // Remove after 3 seconds
        setTimeout(() => {
          set((s2) => ({
            typingUsers: {
              ...s2.typingUsers,
              [taskId]: (s2.typingUsers[taskId] || []).filter((u) => u !== userId),
            },
          }));
        }, 3000);
        return { typingUsers: updated };
      });
    });

    set({ socket });
    // Also load initial conversations upon connecting
    get().loadConversations();
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, connected: false });
  },

  loadConversations: async () => {
    try {
      const res = await chatApi.getConversations();
      const conversations = res.data.data || [];
      const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      set({ conversations, totalUnread });
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  },

  markConversationRead: (taskId) => {
    set((s) => {
      const conversations = s.conversations.map((c) =>
        c.taskId === taskId ? { ...c, unreadCount: 0 } : c
      );
      const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      return { conversations, totalUnread };
    });
  },

  joinRoom: (taskId) => {
    get().socket?.emit('join_task_room', taskId);
  },

  leaveRoom: (taskId) => {
    get().socket?.emit('leave_task_room', taskId);
  },

  sendMessage: (taskId, content, fileId = null) => {
    get().socket?.emit('send_message', { taskId, content, fileId });
  },

  emitTyping: (taskId) => {
    get().socket?.emit('typing', { taskId });
  },

  setMessages: (taskId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [taskId]: msgs } })),

  addMessage: (msg) =>
    set((s) => {
      const taskId = msg.taskId;
      return {
        messages: {
          ...s.messages,
          [taskId]: [...(s.messages[taskId] || []), msg],
        },
      };
    }),

  clearRoom: (taskId) =>
    set((s) => {
      const msgs = { ...s.messages };
      delete msgs[taskId];
      return { messages: msgs };
    }),
}));
