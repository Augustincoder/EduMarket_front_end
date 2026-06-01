// src/store/chatStore.js
import { create } from 'zustand';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const BACKOFF_DELAYS = [1000, 2000, 4000, 8000, 16000];

export const useChatStore = create((set, get) => ({
  socket:      null,
  connected:   false,
  messages:    {},       // Record<taskId, Message[]>
  typingUsers: {},       // Record<taskId, userId[]>
  retryCount:  0,

  connect: (token) => {
    const existing = get().socket;
    if (existing) return; // Allow Socket.io to handle reconnections internally

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
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, connected: false });
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
