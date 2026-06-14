// src/hooks/useChatSocket.js
import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';

export function useChatSocket(chatRoomId) {
  const connected = useChatStore((s) => s.connected);
  const joinRoom = useChatStore((s) => s.joinRoom);
  const leaveRoom = useChatStore((s) => s.leaveRoom);

  useEffect(() => {
    return () => {
      if (chatRoomId) leaveRoom(chatRoomId);
    };
  }, [chatRoomId, leaveRoom]);

  // Rejoin room automatically if socket reconnects
  useEffect(() => {
    if (connected && chatRoomId) {
      joinRoom(chatRoomId);
    }
  }, [connected, chatRoomId, joinRoom]);

  return { connected };
}
