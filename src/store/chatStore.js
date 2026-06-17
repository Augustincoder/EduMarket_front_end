// src/store/chatStore.js
import { create } from 'zustand';
import { io } from 'socket.io-client';
import { chatApi } from '../services/chat.service';
import { useAuthStore } from './authStore';
import { db } from '../lib/db';

// SOCKET_URL: must be the backend Render URL.
// Set VITE_SOCKET_URL in Vercel environment variables.
// e.g.: VITE_SOCKET_URL=https://your-backend.onrender.com
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || import.meta.env.VITE_API_URL?.replace('/api/v1', '')
  || '';

if (!SOCKET_URL && import.meta.env.DEV) {
  console.warn('[Chat] VITE_SOCKET_URL belgilanmagan! Socket ulanishi ishlamasligi mumkin.');
}

const typingTimers = new Map();

export const useChatStore = create((set, get) => ({
  socket:      null,
  connected:   false,
  messages:    {},       // Record<chatRoomId, Message[]>
  typingUsers: {},       // Record<chatRoomId, userId[]>
  conversations: [],     // Array of Conversation
  userPresence: {},      // Record<userId, boolean>
  totalUnread:  0,
  retryCount:  0,
  isConversationsLoading: true,
  loadConversationsTimeout: null,

  connect: (token) => {
    const existing = get().socket;
    if (existing) {
      // FIX: Compare token properly — auth.token may be undefined on first connect
      if (existing.auth?.token === token && existing.connected) return;
      existing.removeAllListeners(); // FIX: Remove all listeners before reconnecting
      existing.disconnect();
    }

    const socket = io(SOCKET_URL, {
      auth:              { token },
      // FIX: Prefer WebSocket directly to avoid long-polling delays
      // Render supports WebSocket natively, polling adds latency
      transports:        ['websocket', 'polling'],
      upgrade:           true,
      reconnection:      true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout:           20000,
    });

    socket.on('connect', () => {
      set({ connected: true, retryCount: 0 });

      // Re-subscribe to presence and re-join all rooms on (re)connect.
      // Use a small delay to handle the case where conversations haven't loaded yet
      // on the very first connect — loadConversations will also call subscribe_presence
      // after fetching, so this handles the reconnect case.
      const resubscribe = () => {
        const state = get();
        const presenceIds = [];
        state.conversations.forEach((c) => {
          socket.emit('join_chat_room', c.chatRoomId);
          if (c.otherUser) presenceIds.push(c.otherUser.id);
        });
        if (presenceIds.length > 0) {
          socket.emit('subscribe_presence', presenceIds);
        }
      };

      // Immediate attempt (for reconnects where conversations are already loaded)
      resubscribe();

      // Delayed attempt in case this is the first connect and loadConversations is still in flight
      setTimeout(resubscribe, 1500);
    });

    socket.on('disconnect', (reason) => {
      set({ connected: false });
      // If server disconnected us (e.g., server restart), socket.io will auto-reconnect
      // Only log unexpected disconnections
      if (reason === 'io server disconnect') {
        console.warn('[Chat] Server disconnected socket, reconnecting...');
        socket.connect();
      }
    });

    socket.on('connect_error', (err) => {
      console.error('[Chat] Connection error:', err.message);
      set((s) => ({ retryCount: s.retryCount + 1 }));
    });

    // ─── new_message ─────────────────────────────────────────────────
    socket.on('new_message', (msg) => {
      const chatRoomId = msg.chatRoomId;
      set((s) => {
        const roomMsgs = s.messages[chatRoomId] || [];
        
        // 1. Deduplicate: If we already have this message by real ID, ignore
        if (roomMsgs.some(m => m.id === msg.id)) return s;

        // 2. Handle optimistic message replacement by clientId
        const user = useAuthStore.getState().user;
        const isMyOwn = msg.senderId === user?.id;
        let updatedRoomMsgs = [...roomMsgs];
        
        if (isMyOwn && msg.clientId) {
          // FIX: Also check by clientId (not just isSending) in case optimistic
          // message was updated before socket event arrives
          const optIndex = updatedRoomMsgs.findIndex(
            m => (m.isSending || m.clientId === msg.clientId) && m.clientId === msg.clientId
          );
          if (optIndex !== -1) {
            updatedRoomMsgs[optIndex] = { ...msg, isSending: false };
          } else {
            updatedRoomMsgs.push(msg);
          }
        } else {
          updatedRoomMsgs.push(msg);
        }

        // 3. Update conversation sidebar
        const conversations = [...s.conversations];
        const convIndex = conversations.findIndex(c => c.chatRoomId === chatRoomId);
        let newConversations = conversations;
        let totalUnread = s.totalUnread;

        if (convIndex !== -1) {
          const conv = { ...conversations[convIndex] };
          conv.lastMessage = msg;
          
          if (!isMyOwn) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          }
          
          // Move to top
          conversations.splice(convIndex, 1);
          conversations.unshift(conv);
          newConversations = [...conversations];
          totalUnread = newConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
          db.saveConversations(newConversations);
        } else {
          // New conversation not in sidebar yet — fetch all
          setTimeout(() => get().loadConversations(), 500);
        }

        // 4. Persist and update state
        db.saveMessages(chatRoomId, updatedRoomMsgs);

        return {
          messages: { ...s.messages, [chatRoomId]: updatedRoomMsgs },
          conversations: newConversations,
          totalUnread
        };
      });
    });

    // ─── typing ──────────────────────────────────────────────────────
    socket.on('user_typing', ({ chatRoomId, userId }) => {
      set((s) => {
        const cur = s.typingUsers[chatRoomId] || [];
        if (cur.includes(userId)) {
          // FIX: Reset the timer even if user is already in typing list
          const timerKey = `${chatRoomId}_${userId}`;
          if (typingTimers.has(timerKey)) clearTimeout(typingTimers.get(timerKey));
          const timerId = setTimeout(() => {
            set((s2) => ({
              typingUsers: {
                ...s2.typingUsers,
                [chatRoomId]: (s2.typingUsers[chatRoomId] || []).filter(u => u !== userId),
              },
            }));
            typingTimers.delete(timerKey);
          }, 3000);
          typingTimers.set(timerKey, timerId);
          return s; // No state change needed, just reset timer
        }

        const timerKey = `${chatRoomId}_${userId}`;
        if (typingTimers.has(timerKey)) clearTimeout(typingTimers.get(timerKey));

        const timerId = setTimeout(() => {
          set((s2) => ({
            typingUsers: {
              ...s2.typingUsers,
              [chatRoomId]: (s2.typingUsers[chatRoomId] || []).filter(u => u !== userId),
            },
          }));
          typingTimers.delete(timerKey);
        }, 3000);
        
        typingTimers.set(timerKey, timerId);

        return { typingUsers: { ...s.typingUsers, [chatRoomId]: [...cur, userId] } };
      });
    });

    // ─── user_status_changed ─────────────────────────────────────────
    socket.on('user_status_changed', ({ userId, isOnline }) => {
      set((s) => ({
        userPresence: { ...s.userPresence, [userId]: isOnline }
      }));
    });

    // ─── message_edited ──────────────────────────────────────────────
    socket.on('message_edited', (updatedMsg) => {
      const chatRoomId = updatedMsg.chatRoomId;
      set((s) => {
        const roomMsgs = s.messages[chatRoomId];
        if (!roomMsgs) return s;
        const updatedRoomMsgs = roomMsgs.map(m => m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m);
        db.saveMessages(chatRoomId, updatedRoomMsgs);
        return { messages: { ...s.messages, [chatRoomId]: updatedRoomMsgs } };
      });
    });

    // ─── message_deleted ─────────────────────────────────────────────
    socket.on('message_deleted', ({ messageId, chatRoomId }) => {
      set((s) => {
        const roomMsgs = s.messages[chatRoomId];
        if (!roomMsgs) return s;
        const updatedRoomMsgs = roomMsgs.map(m =>
          m.id === messageId ? { ...m, isDeleted: true, content: null, fileId: null } : m
        );
        db.saveMessages(chatRoomId, updatedRoomMsgs);
        return { messages: { ...s.messages, [chatRoomId]: updatedRoomMsgs } };
      });
    });

    // ─── read_receipt ────────────────────────────────────────────────
    socket.on('read_receipt', ({ chatRoomId, userId }) => {
      set((s) => {
        const roomMessages = s.messages[chatRoomId];
        if (!roomMessages) return s;

        // userId is the person who marked the room as read.
        // Therefore, any message NOT sent by userId should be marked as read.
        const updatedMessages = roomMessages.map(msg =>
          (!msg.isRead && msg.senderId !== userId)
            ? { ...msg, isRead: true }
            : msg
        );

        db.saveMessages(chatRoomId, updatedMessages);
        return { messages: { ...s.messages, [chatRoomId]: updatedMessages } };
      });
    });

    // ─── message_reaction_updated ────────────────────────────────────
    socket.on('message_reaction_updated', ({ messageId, chatRoomId, reactions }) => {
      set((s) => {
        const roomMsgs = s.messages[chatRoomId];
        // FIX: Don't bail if roomMsgs is undefined — room might not be loaded yet
        // In that case just skip (reaction will be correct when room loads)
        if (!roomMsgs) return s;
        const updatedRoomMsgs = roomMsgs.map(m =>
          m.id === messageId ? { ...m, reactions } : m
        );
        db.saveMessages(chatRoomId, updatedRoomMsgs);
        return { messages: { ...s.messages, [chatRoomId]: updatedRoomMsgs } };
      });
    });

    // ─── participant events ──────────────────────────────────────────
    socket.on('participant_added', ({ chatRoomId }) => {
      window.dispatchEvent(new CustomEvent('chat_info_update', { detail: { chatRoomId } }));
    });

    socket.on('participant_removed', ({ chatRoomId }) => {
      window.dispatchEvent(new CustomEvent('chat_info_update', { detail: { chatRoomId } }));
    });

    socket.on('participant_updated', ({ chatRoomId }) => {
      window.dispatchEvent(new CustomEvent('chat_info_update', { detail: { chatRoomId } }));
    });
    
    socket.on('message_pinned', ({ chatRoomId, message }) => {
      window.dispatchEvent(new CustomEvent('chat_pin_updated', { detail: { chatRoomId, pinnedMsg: message } }));
    });

    set({ socket });
  },

  disconnect: () => {
    const sock = get().socket;
    if (sock) {
      sock.removeAllListeners(); // FIX: Clean up all listeners before disconnect
      sock.disconnect();
    }
    // Clear typing timers on disconnect
    typingTimers.forEach(t => clearTimeout(t));
    typingTimers.clear();

    if (db && typeof db.clearAll === 'function') db.clearAll().catch(() => {});
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
    // 1. Optimistically load from IndexedDB first for instant display
    const cached = await db.getConversations();
    if (cached && cached.length > 0) {
      const totalUnread = cached.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      set(() => ({ conversations: cached, totalUnread }));
    }

    set({ isConversationsLoading: true });

    try {
      const res = await chatApi.getConversations();
      const allConversations = res.data.data || [];
      const conversations = allConversations;
      
      // Persist fresh data
      db.saveConversations(conversations);

      const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      
      const presence = {};
      const presenceIds = [];
      allConversations.forEach((c) => {
        if (c.otherUser) {
          presence[c.otherUser.id] = c.otherUser.isOnline;
          presenceIds.push(c.otherUser.id);
        }
      });

      // Subscribe to presence updates
      if (presenceIds.length > 0) {
        get().socket?.emit('subscribe_presence', presenceIds);
      }

      // Join all chat rooms for real-time updates
      conversations.forEach(c => {
        get().socket?.emit('join_chat_room', c.chatRoomId);
      });

      set((s) => ({
        conversations,
        totalUnread,
        isConversationsLoading: false,
        userPresence: { ...s.userPresence, ...presence }
      }));
    } catch (err) {
      console.error('[Chat] Failed to load conversations:', err);
      set({ isConversationsLoading: false });
    }
  },

  markConversationRead: (chatRoomId) => {
    set((s) => {
      const conversations = s.conversations.map((c) =>
        c.chatRoomId === chatRoomId ? { ...c, unreadCount: 0 } : c
      );
      const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      db.saveConversations(conversations);
      return { conversations, totalUnread };
    });
  },

  joinRoom: (chatRoomId) => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.emit('join_chat_room', chatRoomId);
    }
    // FIX: If not connected yet, will be handled in connect() on reconnect
  },

  leaveRoom: (chatRoomId) => {
    get().socket?.emit('leave_chat_room', chatRoomId);
  },

  sendMessage: async (chatRoomId, content, fileId = null, replyToId = null, fileType = null, fileName = null, isSecureFile = false) => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const user = useAuthStore.getState().user;

    // Create optimistic message
    const tempMsg = {
      id: tempId,
      clientId: tempId,
      chatRoomId,
      senderId: user?.id,
      sender: user,
      content,
      fileId,
      fileType,
      fileName,
      isSecureFile,
      replyToId,
      replyTo: replyToId ? get().messages[chatRoomId]?.find(m => m.id === replyToId) : null,
      createdAt: new Date().toISOString(),
      isRead: false,
      isSending: true,
    };

    set((s) => {
      const roomMsgs = s.messages[chatRoomId] || [];
      return { messages: { ...s.messages, [chatRoomId]: [...roomMsgs, tempMsg] } };
    });

    try {
      const res = await chatApi.sendMessage(chatRoomId, { content, fileId, fileType, fileName, replyToId, isSecureFile, clientId: tempId });
      const realMsg = res.data.data;
      
      set((s) => {
        const roomMsgs = s.messages[chatRoomId] || [];
        
        // If the socket event already replaced this message (real ID present), just remove temp
        if (roomMsgs.some(m => m.id === realMsg.id)) {
          return {
            messages: {
              ...s.messages,
              [chatRoomId]: roomMsgs.filter(m => m.id !== tempId)
            }
          };
        }

        // Otherwise replace temp with real message
        return {
          messages: {
            ...s.messages,
            [chatRoomId]: roomMsgs.map(m => m.id === tempId ? { ...realMsg, isSending: false } : m),
          }
        };
      });
    } catch (err) {
      console.error('[Chat] Failed to send message:', err);
      set((s) => {
        const roomMsgs = s.messages[chatRoomId] || [];
        return {
          messages: {
            ...s.messages,
            [chatRoomId]: roomMsgs.map(m =>
              m.id === tempId ? { ...m, isError: true, isSending: false } : m
            ),
          }
        };
      });
    }
  },

  editMessage: async (messageId, content) => {
    // Optimistic update
    set((s) => {
      for (const [chatRoomId, roomMsgs] of Object.entries(s.messages)) {
        const idx = roomMsgs.findIndex(m => m.id === messageId);
        if (idx !== -1) {
          const updatedMsgs = roomMsgs.map(m =>
            m.id === messageId ? { ...m, content, isEdited: true } : m
          );
          db.saveMessages(chatRoomId, updatedMsgs);
          return { messages: { ...s.messages, [chatRoomId]: updatedMsgs } };
        }
      }
      return s;
    });

    try {
      const res = await chatApi.editMessage(messageId, { content });
      const updatedMsg = res.data.data;
      // Socket will broadcast message_edited, which will update state again
      // But apply API response immediately for accuracy
      set((s) => {
        const chatRoomId = updatedMsg.chatRoomId;
        const roomMsgs = s.messages[chatRoomId];
        if (!roomMsgs) return s;
        const updatedRoomMsgs = roomMsgs.map(m => m.id === messageId ? { ...m, ...updatedMsg } : m);
        db.saveMessages(chatRoomId, updatedRoomMsgs);
        return { messages: { ...s.messages, [chatRoomId]: updatedRoomMsgs } };
      });
    } catch (err) {
      console.error('[Chat] Failed to edit message:', err);
    }
  },

  deleteMessage: async (messageId) => {
    // Optimistic soft-delete
    set((s) => {
      for (const [chatRoomId, roomMsgs] of Object.entries(s.messages)) {
        const idx = roomMsgs.findIndex(m => m.id === messageId);
        if (idx !== -1) {
          const updatedMsgs = roomMsgs.map(m =>
            m.id === messageId ? { ...m, isDeleted: true, content: null, fileId: null } : m
          );
          db.saveMessages(chatRoomId, updatedMsgs);
          return { messages: { ...s.messages, [chatRoomId]: updatedMsgs } };
        }
      }
      return s;
    });

    try {
      await chatApi.deleteMessage(messageId);
      // Socket will broadcast message_deleted to confirm
    } catch (err) {
      console.error('[Chat] Failed to delete message:', err);
      // TODO: Revert optimistic delete on failure
    }
  },

  toggleReaction: async (messageId, chatRoomId, icon) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Save previous state for rollback
    const prevMsgs = get().messages[chatRoomId];
    if (!prevMsgs) return;

    // Optimistic update
    set((s) => {
      const roomMsgs = s.messages[chatRoomId];
      if (!roomMsgs) return s;
      return {
        messages: {
          ...s.messages,
          [chatRoomId]: roomMsgs.map(m => {
            if (m.id !== messageId) return m;
            
            let reactions = Array.isArray(m.reactions) ? [...m.reactions] : [];
            const existingIndex = reactions.findIndex(r => r.userId === user.id);
            
            if (existingIndex !== -1) {
              if (reactions[existingIndex].icon === icon) {
                // Toggle off same reaction
                reactions.splice(existingIndex, 1);
              } else {
                // Change reaction
                reactions[existingIndex] = { ...reactions[existingIndex], icon };
              }
            } else {
              reactions.push({ icon, userId: user.id, user: { id: user.id, fullname: user.fullname } });
            }
            
            return { ...m, reactions };
          })
        }
      };
    });

    try {
      const res = await chatApi.toggleReaction(messageId, icon);
      const result = res.data.data;
      // FIX: Apply API response directly — socket may also send reaction_updated
      // but applying API result here ensures instant accuracy even if socket is slow
      set((s) => {
        const roomMsgs = s.messages[chatRoomId];
        if (!roomMsgs) return s;
        const updatedRoomMsgs = roomMsgs.map(m =>
          m.id === messageId ? { ...m, reactions: result.reactions } : m
        );
        db.saveMessages(chatRoomId, updatedRoomMsgs);
        return { messages: { ...s.messages, [chatRoomId]: updatedRoomMsgs } };
      });
    } catch (err) {
      console.error('[Chat] Failed to toggle reaction:', err);
      // Revert optimistic update
      set((s) => ({
        messages: { ...s.messages, [chatRoomId]: prevMsgs }
      }));
    }
  },

  emitTyping: (chatRoomId) => {
    const now = Date.now();
    const last = get().lastTypingTime || 0;
    if (now - last > 1500) {
      get().socket?.emit('typing', { chatRoomId });
      set({ lastTypingTime: now });
    }
  },

  setMessages: (chatRoomId, msgs) => {
    db.saveMessages(chatRoomId, msgs);
    set((s) => ({ messages: { ...s.messages, [chatRoomId]: msgs } }));
  },

  mergeMessages: (chatRoomId, fetchedMsgs) => {
    set((s) => {
      const currentMsgs = s.messages[chatRoomId] || [];
      
      if (currentMsgs.length === 0) {
        db.saveMessages(chatRoomId, fetchedMsgs);
        return { messages: { ...s.messages, [chatRoomId]: fetchedMsgs } };
      }

      // Merge fetched + current (socket) messages, removing duplicates
      // FIX: Current (socket) messages take priority over fetched for same ID
      const msgMap = new Map();
      fetchedMsgs.forEach(m => msgMap.set(m.id, m));
      
      // Socket messages override fetched — they have latest reactions/edits
      currentMsgs.forEach(m => {
        if (!m.isSending) { // Don't let optimistic messages override real fetched data
          msgMap.set(m.id, m);
        } else {
          // Keep sending messages that aren't in fetched
          if (!msgMap.has(m.id)) msgMap.set(m.id, m);
        }
      });

      const merged = Array.from(msgMap.values()).sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      db.saveMessages(chatRoomId, merged);
      return { messages: { ...s.messages, [chatRoomId]: merged } };
    });
  },

  prependMessages: (chatRoomId, msgs) => {
    set((s) => {
      const current = s.messages[chatRoomId] || [];
      // Deduplicate prepended messages
      const currentIds = new Set(current.map(m => m.id));
      const uniqueNew = msgs.filter(m => !currentIds.has(m.id));
      const newRoomMsgs = [...uniqueNew, ...current];
      db.saveMessages(chatRoomId, newRoomMsgs);
      return { messages: { ...s.messages, [chatRoomId]: newRoomMsgs } };
    });
  },

  addMessage: (msg) => {
    set((s) => {
      const chatRoomId = msg.chatRoomId;
      const current = s.messages[chatRoomId] || [];
      // Deduplicate
      if (current.some(m => m.id === msg.id)) return s;
      const newRoomMsgs = [...current, msg];
      db.saveMessages(chatRoomId, newRoomMsgs);
      return { messages: { ...s.messages, [chatRoomId]: newRoomMsgs } };
    });
  },

  clearRoom: (chatRoomId) => {
    db.saveMessages(chatRoomId, []);
    set((s) => {
      const msgs = { ...s.messages };
      delete msgs[chatRoomId];
      return { messages: msgs };
    });
  },
}));
