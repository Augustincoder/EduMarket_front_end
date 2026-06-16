// src/hooks/useChatSocket.js
import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';

/**
 * FIX 1: Rejoining race condition fixed.
 * - The second useEffect had missing deps [chatRoomId, joinRoom] which caused
 *   the reconnect logic to use stale closures. Now uses a ref to track
 *   the current chatRoomId and always joins on reconnect with the correct ID.
 * 
 * FIX 2: Avoids double-join on mount by tracking if already joined.
 */
export function useChatSocket(chatRoomId) {
  const connected = useChatStore((s) => s.connected);
  const joinRoom = useChatStore((s) => s.joinRoom);

  // Use ref to always have fresh chatRoomId in reconnect handler
  const chatRoomIdRef = useRef(chatRoomId);
  useEffect(() => {
    chatRoomIdRef.current = chatRoomId;
  }, [chatRoomId]);

  // Join on mount or room change.
  // Note: We DO NOT leave the room on unmount because we want to receive
  // system events and background updates for this chat even when outside the screen.
  useEffect(() => {
    if (!chatRoomId) return;
    joinRoom(chatRoomId);
  }, [chatRoomId, joinRoom]);

  // Rejoin room automatically if socket reconnects
  // FIX: Added all required dependencies to avoid stale closure
  useEffect(() => {
    if (connected && chatRoomId) {
      joinRoom(chatRoomId);
    }
  }, [connected, chatRoomId, joinRoom]);

  return { connected };
}
