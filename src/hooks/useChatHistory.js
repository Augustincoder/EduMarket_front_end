// src/hooks/useChatHistory.js
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../services/chat.service';
import { useChatStore } from '../store/chatStore';

export function useChatHistory(chatRoomId) {
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const messages = useChatStore((s) => s.messages);
  const setMessages = useChatStore((s) => s.setMessages);

  const { data: history, isLoading } = useQuery({
    queryKey: ['messages', chatRoomId],
    queryFn:  () => chatApi.getMessages(chatRoomId).then((r) => {
      const data = r.data.data;
      const msgs = Array.isArray(data) ? data : (data?.messages || []);
      
      if (data?.nextCursor) {
        setCursor(data.nextCursor);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
      
      return msgs.slice().reverse();
    }),
    enabled: !!chatRoomId,
  });

  useEffect(() => {
    if (history) setMessages(chatRoomId, history);
  }, [history, chatRoomId, setMessages]);

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
      setMessages(chatRoomId, [...reversedMsgs, ...(messages[chatRoomId] || [])]);
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
