// src/hooks/useChatHistory.js
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../services/chat.service';
import { useChatStore } from '../store/chatStore';
import { db } from '../lib/db';

export function useChatHistory(chatRoomId) {
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const setMessages = useChatStore((s) => s.setMessages);
  const mergeMessages = useChatStore((s) => s.mergeMessages);
  const prependMessages = useChatStore((s) => s.prependMessages);

  // Load from local storage initially
  useEffect(() => {
    async function loadLocal() {
      const cachedMsgs = await db.getMessages(chatRoomId);
      if (cachedMsgs && cachedMsgs.length > 0) {
        // If we don't have them in store yet
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
    queryFn:  async () => {
      const r = await chatApi.getMessages(chatRoomId);
      const data = r.data.data;
      const msgs = Array.isArray(data) ? data : (data?.messages || []);
      
      return {
        messages: msgs.slice().reverse(),
        nextCursor: data?.nextCursor || null
      };
    },
    enabled: !!chatRoomId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes
  });

  useEffect(() => {
    if (historyData) {
      mergeMessages(chatRoomId, historyData.messages);
      // eslint-disable-next-line
      setCursor(historyData.nextCursor);
      setHasMore(!!historyData.nextCursor);
    }
  }, [historyData, chatRoomId, mergeMessages]);

  const loadMore = async () => {
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
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    isLoading,
    hasMore,
    isLoadingMore,
    loadMore,
  };
}
