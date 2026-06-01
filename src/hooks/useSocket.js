// src/hooks/useSocket.js
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';

export function useSocket() {
  const token = useAuthStore((s) => s.token);
  const { connect, disconnect, socket, connected } = useChatStore();

  useEffect(() => {
    if (token) {
      connect(token);
    } else {
      disconnect();
    }

    return () => {
      // Clean up connection if hook unmounts completely in a non-authenticated view
      // But typically we want to keep it alive inside authenticated pages
    };
  }, [token, connect, disconnect]);

  return { socket, connected };
}
