// src/store/chatStore.js
import { create } from 'zustand';
import { io } from 'socket.io-client';
import { chatApi } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const BACKOFF_DELAYS = [1000, 2000, 4000, 8000, 16000];

const typingTimers = new Map();
let loadConversationsTimeout = null;

export const useChatStore = create((set, get) => ({
  socket:      null,
  connected:   false,
  messages:    {},       // Record<taskId, Message[]>
  typingUsers: {},       // Record<taskId, userId[]>
  conversations: [],     // Array of Conversation
  userPresence: {},      // Record<userId, boolean>
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
        
        const timerKey = `${taskId}_${userId}`;
        if (typingTimers.has(timerKey)) {
          clearTimeout(typingTimers.get(timerKey));
        }

        const timerId = setTimeout(() => {
          set((s2) => ({
            typingUsers: {
              ...s2.typingUsers,
              [taskId]: (s2.typingUsers[taskId] || []).filter((u) => u !== userId),
            },
          }));
          typingTimers.delete(timerKey);
        }, 3000);
        
        typingTimers.set(timerKey, timerId);

        return { typingUsers: updated };
      });
    });

    socket.on('user_status_changed', ({ userId, isOnline }) => {
      set((s) => ({
        userPresence: {
          ...s.userPresence,
          [userId]: isOnline
        }
      }));
    });

    socket.on('message_edited', (updatedMsg) => {
      const taskId = updatedMsg.taskId;
      set((s) => {
        const roomMsgs = s.messages[taskId];
        if (!roomMsgs) return s;
        return {
          messages: {
            ...s.messages,
            [taskId]: roomMsgs.map(m => m.id === updatedMsg.id ? updatedMsg : m)
          }
        };
      });
    });

    socket.on('message_deleted', ({ messageId, taskId }) => {
      set((s) => {
        const roomMsgs = s.messages[taskId];
        if (!roomMsgs) return s;
        return {
          messages: {
            ...s.messages,
            [taskId]: roomMsgs.map(m => m.id === messageId ? { ...m, isDeleted: true, content: null } : m)
          }
        };
      });
    });

    socket.on('messages_read', ({ taskId, readerId, messageIds }) => {
      set((s) => {
        const roomMessages = s.messages[taskId];
        if (!roomMessages) return s;

        // Update messages that were read
        const updatedMessages = roomMessages.map(msg => 
          (messageIds && messageIds.includes(msg.id)) || (!messageIds && !msg.isRead && msg.senderId !== readerId)
            ? { ...msg, isRead: true } 
            : msg
        );

        return {
          messages: {
            ...s.messages,
            [taskId]: updatedMessages
          }
        };
      });
    });

    set({ socket });
    // Also load initial conversations upon connecting
    get().loadConversations();
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({
      socket: null,
      connected: false,
      messages: {},
      typingUsers: {},
      conversations: [],
      userPresence: {},
      totalUnread: 0,
      retryCount: 0,
    });
  },

  loadConversations: async () => {
    if (loadConversationsTimeout) clearTimeout(loadConversationsTimeout);
    
    loadConversationsTimeout = setTimeout(async () => {
      try {
        const res = await chatApi.getConversations();
        const conversations = res.data.data || [];
        const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        
        const presence = {};
        conversations.forEach((c) => {
          if (c.otherUser) {
            presence[c.otherUser.id] = c.otherUser.isOnline;
          }
        });

        set((s) => ({
          conversations,
          totalUnread,
          userPresence: {
            ...s.userPresence,
            ...presence
          }
        }));
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    }, 500);
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

  sendMessage: async (taskId, content, fileId = null, replyToId = null) => {
    try {
      await chatApi.sendMessage(taskId, { content, fileId, replyToId });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  },

  editMessage: async (messageId, content) => {
    try {
      await chatApi.editMessage(messageId, { content });
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await chatApi.deleteMessage(messageId);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  },

  emitTyping: (taskId) => {
    // Basic throttle using a store variable
    const now = Date.now();
    const last = get().lastTypingTime || 0;
    if (now - last > 1500) {
      get().socket?.emit('typing', { taskId });
      set({ lastTypingTime: now });
    }
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
