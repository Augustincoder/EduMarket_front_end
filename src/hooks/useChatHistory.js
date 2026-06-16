// src/hooks/useChatHistory.js
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../services/chat.service';
import { useChatStore } from '../store/chatStore';
import { db } from '../lib/db';

/**
 * FIX: staleTime was 2 minutes — during that time new socket messages arriving
 * via the store were correct, but useQuery would NOT re-fetch fresh history,
 * causing a mismatch if user stays in chat and then scrolls up.
 * 
 * Key fixes:
 * 1. staleTime set to 0 so query always re-validates when component mounts
 * 2. Added refetchOnWindowFocus: false to prevent excessive refetching
 * 3. Added refetchOnReconnect: true so re-joining socket re-fetches baseline
 * 4. mergeMessages is now stable via useCallback in store (no-op, already stable)
 * 5. loadMore is wrapped in useCallback to prevent recreation
 */
export function useChatHistory(chatRoomId) {
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const setMessages = useChatStore((s) => s.setMessages);
  const mergeMessages = useChatStore((s) => s.mergeMessages);
  const prependMessages = useChatStore((s) => s.prependMessages);
  const queryClient = useQueryClient();

  // Load from IndexedDB initially for instant offline display
  useEffect(() => {
    if (!chatRoomId) return;
    async function loadLocal() {
      const cachedMsgs = await db.getMessages(chatRoomId);
      if (cachedMsgs && cachedMsgs.length > 0) {
        const currentStoreMsgs = useChatStore.getState().messages[chatRoomId];
        if (!currentStoreMsgs || currentStoreMsgs.length === 0) {
          setMessages(chatRoomId, cachedMsgs);
        }
      }
    }
    loadLocal();
  }, [chatRoomId, setMessages]);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['messages', chatRoomId],
    queryFn: async () => {
      const r = await chatApi.getMessages(chatRoomId);
      const data = r.data.data;
      const msgs = Array.isArray(data) ? data : (data?.messages || []);
      
      return {
        messages: msgs.slice().reverse(),
        nextCursor: data?.nextCursor || null
      };
    },
    enabled: !!chatRoomId,
    staleTime: 0,              // FIX: was 2 minutes — always validate on mount
    gcTime: 1000 * 60 * 10,   // Keep in cache 10 minutes
    refetchOnWindowFocus: false, // Don't refetch just on tab focus
    refetchOnReconnect: true,    // Re-fetch when network/socket reconnects
    retry: 2,
  });

  useEffect(() => {
    if (historyData) {
      mergeMessages(chatRoomId, historyData.messages);
      /* eslint-disable react-hooks/set-state-in-effect */
      setCursor(historyData.nextCursor);
      setHasMore(!!historyData.nextCursor);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [historyData, chatRoomId, mergeMessages]);

  const loadMore = useCallback(async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await chatApi.getMessages(chatRoomId, { cursor });
      const data = res.data.data;
      const msgs = Array.isArray(data) ? data : (data?.messages || []);
      const nextCursor = data?.nextCursor;
      setHasMore(!!nextCursor);
      setCursor(nextCursor);
      
      const reversedMsgs = msgs.slice().reverse();
      prependMessages(chatRoomId, reversedMsgs);
    } catch (e) {
      console.error('loadMore failed:', e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, isLoadingMore, chatRoomId, prependMessages]);

  // Expose invalidation helper so ChatScreen can force-refresh
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['messages', chatRoomId] });
  }, [queryClient, chatRoomId]);

  return {
    isLoading,
    hasMore,
    isLoadingMore,
    loadMore,
    invalidate,
  };
}
