// src/hooks/useChatSocket.js
import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';

export function useChatSocket(taskId, token) {
  const connected = useChatStore((s) => s.connected);
  const connect = useChatStore((s) => s.connect);
  const joinRoom = useChatStore((s) => s.joinRoom);
  const leaveRoom = useChatStore((s) => s.leaveRoom);

  useEffect(() => {
    if (token) connect(token);
    return () => leaveRoom(taskId);
  }, [token, taskId, connect, leaveRoom]);

  // Rejoin room automatically if socket reconnects
  useEffect(() => {
    if (connected && taskId) {
      joinRoom(taskId);
    }
  }, [connected, taskId, joinRoom]);

  return { connected };
}
