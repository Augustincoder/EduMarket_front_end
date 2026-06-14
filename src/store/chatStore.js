// src/store/chatStore.js
import { create } from 'zustand';
import { io } from 'socket.io-client';
import { chatApi } from '../services/chat.service';
import { useAuthStore } from './authStore';
import { db } from '../lib/db';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

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
      const chatRoomId = msg.chatRoomId;
      set((s) => {
        const roomMsgs = s.messages[chatRoomId] || [];
        
        // 1. If we already have this message (real ID), ignore duplicate
        if (roomMsgs.some(m => m.id === msg.id)) return s;

        // 2. Handle optimistic message replacement
        const user = useAuthStore.getState().user;
        const isMyOwn = msg.senderId === user?.id;
        let updatedRoomMsgs = [...roomMsgs];
        
        if (isMyOwn && msg.clientId) {
          const optIndex = updatedRoomMsgs.findIndex(m => m.isSending && m.clientId === msg.clientId);
          if (optIndex !== -1) {
            updatedRoomMsgs[optIndex] = msg;
          } else {
            updatedRoomMsgs.push(msg);
          }
        } else {
          updatedRoomMsgs.push(msg);
        }

        // 3. Update conversation sidebar locally
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
          // New conversation not in sidebar yet, fetch all to be sure we have metadata
          setTimeout(() => get().loadConversations(), 500);
        }

        // 4. Save and Update State
        db.saveMessages(chatRoomId, updatedRoomMsgs);

        return {
          messages: { ...s.messages, [chatRoomId]: updatedRoomMsgs },
          conversations: newConversations,
          totalUnread
        };
      });
    });

    socket.on('user_typing', ({ chatRoomId, userId }) => {
      set((s) => {
        const cur = s.typingUsers[chatRoomId] || [];
        if (cur.includes(userId)) return s;
        const updated = { ...s.typingUsers, [chatRoomId]: [...cur, userId] };
        
        const timerKey = `${chatRoomId}_${userId}`;
        if (typingTimers.has(timerKey)) {
          clearTimeout(typingTimers.get(timerKey));
        }

        const timerId = setTimeout(() => {
          set((s2) => ({
            typingUsers: {
              ...s2.typingUsers,
              [chatRoomId]: (s2.typingUsers[chatRoomId] || []).filter((u) => u !== userId),
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
      const chatRoomId = updatedMsg.chatRoomId;
      set((s) => {
        const roomMsgs = s.messages[chatRoomId];
        if (!roomMsgs) return s;
        const updatedRoomMsgs = roomMsgs.map(m => m.id === updatedMsg.id ? updatedMsg : m);
        db.saveMessages(chatRoomId, updatedRoomMsgs);
        return {
          messages: {
            ...s.messages,
            [chatRoomId]: updatedRoomMsgs
          }
        };
      });
    });

    socket.on('message_deleted', ({ messageId, chatRoomId }) => {
      set((s) => {
        const roomMsgs = s.messages[chatRoomId];
        if (!roomMsgs) return s;
        const updatedRoomMsgs = roomMsgs.map(m => m.id === messageId ? { ...m, isDeleted: true, content: null } : m);
        db.saveMessages(chatRoomId, updatedRoomMsgs);
        return {
          messages: {
            ...s.messages,
            [chatRoomId]: updatedRoomMsgs
          }
        };
      });
    });

    socket.on('messages_read', ({ chatRoomId, readerId, messageIds }) => {
      set((s) => {
        const roomMessages = s.messages[chatRoomId];
        if (!roomMessages) return s;

        // Update messages that were read
        const updatedMessages = roomMessages.map(msg => 
          (messageIds && messageIds.includes(msg.id)) || (!messageIds && !msg.isRead && msg.senderId !== readerId)
            ? { ...msg, isRead: true } 
            : msg
        );

        db.saveMessages(chatRoomId, updatedMessages);
        return {
          messages: {
            ...s.messages,
            [chatRoomId]: updatedMessages
          }
        };
      });
    });

    socket.on('message_reaction_updated', ({ messageId, chatRoomId, reactions }) => {
      set((s) => {
        const roomMsgs = s.messages[chatRoomId];
        if (!roomMsgs) return s;
        const updatedRoomMsgs = roomMsgs.map(m => m.id === messageId ? { ...m, reactions } : m);
        db.saveMessages(chatRoomId, updatedRoomMsgs);
        return {
          messages: {
            ...s.messages,
            [chatRoomId]: updatedRoomMsgs
          }
        };
      });
    });

    socket.on('participant_added', ({ chatRoomId, _participant }) => {
      // Invalidate react-query cache via custom event or global queryClient if we had access
      // For now, we can just trigger a reload if we are in this room
      window.dispatchEvent(new CustomEvent('chat_info_update', { detail: { chatRoomId } }));
    });

    socket.on('participant_removed', ({ chatRoomId, _userId }) => {
      window.dispatchEvent(new CustomEvent('chat_info_update', { detail: { chatRoomId } }));
    });

    socket.on('participant_updated', ({ chatRoomId, _participant }) => {
      window.dispatchEvent(new CustomEvent('chat_info_update', { detail: { chatRoomId } }));
    });
    
    socket.on('message_pinned', () => {
      // Just emit a system event instead of full reload, or locally update room if we stored pinnedMsg
      // get().loadConversations(); // Avoiding this heavy call
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
    // 1. Optimistically load from IndexedDB first
    const cached = await db.getConversations();
    if (cached) {
      const totalUnread = cached.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      set(() => ({
        conversations: cached,
        totalUnread,
      }));
    }

    set({ isConversationsLoading: true });

    try {
      const res = await chatApi.getConversations();
      const allConversations = res.data.data || [];
      const conversations = allConversations;
      
      // Save fresh data to IndexedDB
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

      if (presenceIds.length > 0) {
        get().socket?.emit('subscribe_presence', presenceIds);
      }

      // Join all chat rooms for real-time updates across the app
      conversations.forEach(c => {
        get().socket?.emit('join_chat_room', c.chatRoomId);
      });

      set((s) => ({
        conversations,
        totalUnread,
        isConversationsLoading: false,
        userPresence: {
          ...s.userPresence,
          ...presence
        }
      }));
    } catch (err) {
      console.error('Failed to load conversations:', err);
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
    get().socket?.emit('join_chat_room', chatRoomId);
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
      clientId: tempId, // Pass it to be returned
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
        
        // If the socket event already added this message (real ID is present), 
        // just remove the temp one to clean up.
        if (roomMsgs.some(m => m.id === realMsg.id)) {
           return {
             messages: {
               ...s.messages,
               [chatRoomId]: roomMsgs.filter(m => m.id !== tempId)
             }
           };
        }

        // Otherwise replace the temp one
        return {
          messages: {
            ...s.messages,
            [chatRoomId]: roomMsgs.map(m => m.id === tempId ? realMsg : m),
          }
        };
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      set((s) => {
        const roomMsgs = s.messages[chatRoomId] || [];
        return {
          messages: {
            ...s.messages,
            [chatRoomId]: roomMsgs.map(m => m.id === tempId ? { ...m, isError: true, isSending: false } : m),
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
        const chatRoomId = updatedMsg.chatRoomId;
        const roomMsgs = s.messages[chatRoomId];
        if (!roomMsgs) return s;
        return {
          messages: {
            ...s.messages,
            [chatRoomId]: roomMsgs.map(m => m.id === messageId ? updatedMsg : m)
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

  toggleReaction: async (messageId, chatRoomId, icon) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Save previous state for rollback
    const prevMsgs = get().messages[chatRoomId];
    if (!prevMsgs) return;

    // Optimistically update
    set((s) => {
      const roomMsgs = s.messages[chatRoomId];
      return {
        messages: {
          ...s.messages,
          [chatRoomId]: roomMsgs.map(m => {
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
      const result = res.data.data;
      set((s) => {
        const roomMsgs = s.messages[chatRoomId];
        if (!roomMsgs) return s;
        const updatedRoomMsgs = roomMsgs.map(m => 
          m.id === messageId ? { ...m, reactions: result.reactions } : m
        );
        db.saveMessages(chatRoomId, updatedRoomMsgs);
        return {
          messages: {
            ...s.messages,
            [chatRoomId]: updatedRoomMsgs
          }
        };
      });
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
      // Revert optimistic update
      set((s) => ({
        messages: {
          ...s.messages,
          [chatRoomId]: prevMsgs
        }
      }));
    }
  },

  emitTyping: (chatRoomId) => {
    // Basic throttle using a store variable
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

      // We have existing messages (like ones received via socket during fetch)
      // We want to combine them, removing duplicates, and sort by createdAt
      const msgMap = new Map();
      fetchedMsgs.forEach(m => msgMap.set(m.id, m));
      currentMsgs.forEach(m => msgMap.set(m.id, m)); // socket messages overwrite fetched ones if duplicate ID

      const merged = Array.from(msgMap.values()).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      db.saveMessages(chatRoomId, merged);
      return { messages: { ...s.messages, [chatRoomId]: merged } };
    });
  },

  prependMessages: (chatRoomId, msgs) => {
    set((s) => {
      const newRoomMsgs = [...msgs, ...(s.messages[chatRoomId] || [])];
      db.saveMessages(chatRoomId, newRoomMsgs);
      return {
        messages: {
          ...s.messages,
          [chatRoomId]: newRoomMsgs,
        },
      };
    });
  },

  addMessage: (msg) => {
    set((s) => {
      const chatRoomId = msg.chatRoomId;
      const newRoomMsgs = [...(s.messages[chatRoomId] || []), msg];
      db.saveMessages(chatRoomId, newRoomMsgs);
      return {
        messages: {
          ...s.messages,
          [chatRoomId]: newRoomMsgs,
        },
      };
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
