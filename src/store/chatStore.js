// src/store/chatStore.js
import { create } from 'zustand';
import { io } from 'socket.io-client';
import { chatApi } from '../services/chat.service';
import { useAuthStore } from './authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const typingTimers = new Map();

export const useChatStore = create((set, get) => ({
  socket:      null,
  connected:   false,
  messages:    {},       // Record<taskId, Message[]>
  typingUsers: {},       // Record<taskId, userId[]>
  conversations: [],     // Array of Conversation
  userPresence: {},      // Record<userId, boolean>
  totalUnread:  0,
  retryCount:  0,
  loadConversationsTimeout: null,

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
      set((s) => {
        const roomMsgs = s.messages[taskId] || [];
        
        // 1. If we already have this message (real ID), ignore duplicate
        if (roomMsgs.some(m => m.id === msg.id)) return s;

        // 2. Optimization: Check if this message from socket is actually our own optimistic message
        // returning from the server. If so, replace the 'isSending' one to avoid jumpy UI.
        const user = useAuthStore.getState().user;
        const isMyOwn = msg.senderId === user?.id;
        
        if (isMyOwn) {
          const optIndex = roomMsgs.findLastIndex(m => m.isSending && m.content === msg.content);
          if (optIndex !== -1) {
            const newMsgs = [...roomMsgs];
            newMsgs[optIndex] = msg;
            return {
              messages: { ...s.messages, [taskId]: newMsgs }
            };
          }
        }
        
        return {
          messages: {
            ...s.messages,
            [taskId]: [...roomMsgs, msg],
          },
        };
      });
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

    socket.on('message_reaction_updated', ({ messageId, taskId, reactions }) => {
      set((s) => {
        const roomMsgs = s.messages[taskId];
        if (!roomMsgs) return s;
        return {
          messages: {
            ...s.messages,
            [taskId]: roomMsgs.map(m => m.id === messageId ? { ...m, reactions } : m)
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
    const prev = get().loadConversationsTimeout;
    if (prev) clearTimeout(prev);
    
    const timeout = setTimeout(async () => {
      try {
        const res = await chatApi.getConversations();
        const allConversations = res.data.data || [];
        
        const user = useAuthStore.getState().user;
        const activeRole = useAuthStore.getState().activeRole;

        // Filter conversations based on role
        const conversations = allConversations.filter(c => {
          if (activeRole === 'CLIENT') return c.clientId === user?.id;
          if (activeRole === 'FREELANCER') return c.freelancerId === user?.id;
          return true;
        });

        const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        
        const presence = {};
        const presenceIds = [];
        allConversations.forEach((c) => {
          if (c.otherUser) {
            presence[c.otherUser.id] = c.otherUser.isOnline;
            presenceIds.push(c.otherUser.id);
          }
        });

        if (presenceIds.length > 0) {
          get().socket?.emit('subscribe_presence', presenceIds);
        }

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
    set({ loadConversationsTimeout: timeout });
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

  sendMessage: async (taskId, content, fileId = null, replyToId = null, fileType = null, fileName = null, isSecureFile = false) => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const user = useAuthStore.getState().user;

    // Create optimistic message
    const tempMsg = {
      id: tempId,
      taskId,
      senderId: user?.id,
      sender: user,
      content,
      fileId,
      fileType,
      fileName,
      isSecureFile,
      replyToId,
      replyTo: replyToId ? get().messages[taskId]?.find(m => m.id === replyToId) : null,
      createdAt: new Date().toISOString(),
      isRead: false,
      isSending: true,
    };

    set((s) => {
      const roomMsgs = s.messages[taskId] || [];
      return { messages: { ...s.messages, [taskId]: [...roomMsgs, tempMsg] } };
    });

    try {
      const res = await chatApi.sendMessage(taskId, { content, fileId, fileType, fileName, replyToId, isSecureFile });
      const realMsg = res.data.data;
      
      set((s) => {
        const roomMsgs = s.messages[taskId] || [];
        
        // If the socket event already added this message (real ID is present), 
        // just remove the temp one to clean up.
        if (roomMsgs.some(m => m.id === realMsg.id)) {
           return {
             messages: {
               ...s.messages,
               [taskId]: roomMsgs.filter(m => m.id !== tempId)
             }
           };
        }

        // Otherwise replace the temp one
        return {
          messages: {
            ...s.messages,
            [taskId]: roomMsgs.map(m => m.id === tempId ? realMsg : m),
          }
        };
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      set((s) => {
        const roomMsgs = s.messages[taskId] || [];
        return {
          messages: {
            ...s.messages,
            [taskId]: roomMsgs.map(m => m.id === tempId ? { ...m, isError: true, isSending: false } : m),
          }
        };
      });
    }
  },

  editMessage: async (messageId, content) => {
    try {
      const res = await chatApi.editMessage(messageId, { content });
      const updatedMsg = res.data.data;
      set((s) => {
        const taskId = updatedMsg.taskId;
        const roomMsgs = s.messages[taskId];
        if (!roomMsgs) return s;
        return {
          messages: {
            ...s.messages,
            [taskId]: roomMsgs.map(m => m.id === messageId ? updatedMsg : m)
          }
        };
      });
    } catch (err) {
      console.error('Failed to edit message', err);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await chatApi.deleteMessage(messageId);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  },

  toggleReaction: async (messageId, taskId, icon) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Save previous state for rollback
    const prevMsgs = get().messages[taskId];
    if (!prevMsgs) return;

    // Optimistically update
    set((s) => {
      const roomMsgs = s.messages[taskId];
      return {
        messages: {
          ...s.messages,
          [taskId]: roomMsgs.map(m => {
            if (m.id !== messageId) return m;
            
            let reactions = Array.isArray(m.reactions) ? [...m.reactions] : [];
            const existingIndex = reactions.findIndex(r => r.userId === user.id);
            
            if (existingIndex !== -1) {
              if (reactions[existingIndex].icon === icon) {
                reactions.splice(existingIndex, 1);
              } else {
                reactions[existingIndex].icon = icon;
              }
            } else {
              reactions.push({ icon, userId: user.id });
            }
            
            return { ...m, reactions };
          })
        }
      };
    });

    try {
      const res = await chatApi.toggleReaction(messageId, icon);
      // Socket will broadcast the true state, so we don't strictly need to set it here, 
      // but we can update it just in case to be safe.
      const updatedMsg = res.data.data;
      set((s) => {
        const roomMsgs = s.messages[taskId];
        if (!roomMsgs) return s;
        return {
          messages: {
            ...s.messages,
            [taskId]: roomMsgs.map(m => m.id === messageId ? updatedMsg : m)
          }
        };
      });
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
      // Revert optimistic update
      set((s) => ({
        messages: {
          ...s.messages,
          [taskId]: prevMsgs
        }
      }));
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
