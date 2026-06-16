// src/hooks/useChatSocket.js
import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';

export function useChatSocket(chatRoomId) {
  const connected = useChatStore((s) => s.connected);
  const joinRoom = useChatStore((s) => s.joinRoom);
  const leaveRoom = useChatStore((s) => s.leaveRoom);

  useEffect(() => {
    if (!chatRoomId) return;
    joinRoom(chatRoomId);
    return () => {
      leaveRoom(chatRoomId);
    };
  }, [chatRoomId, joinRoom, leaveRoom]);

  // Rejoin room automatically if socket reconnects
  useEffect(() => {
    if (connected && chatRoomId) {
      joinRoom(chatRoomId);
    }
  }, [connected]);

  return { connected };
}
