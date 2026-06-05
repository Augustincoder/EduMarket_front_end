// src/hooks/useSocket.js
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { STATUS_CONFIG } from '../lib/constants';
import toast from 'react-hot-toast';

export function useSocket() {
  const token = useAuthStore((s) => s.token);
  const connect = useChatStore((s) => s.connect);
  const disconnect = useChatStore((s) => s.disconnect);
  const socket = useChatStore((s) => s.socket);
  const connected = useChatStore((s) => s.connected);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (token) {
      connect(token);
    } else {
      disconnect();
    }
  }, [token, connect, disconnect]);

  useEffect(() => {
    if (!socket) return;

    const handleTaskStatusChanged = ({ taskId, newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
      toast.success(`Vazifa holati o'zgardi: ${statusLabel}`);
    };

    const handleNewBid = ({ taskId, bidCount }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'bids'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.info(`Yangi taklif yuborildi! Jami takliflar: ${bidCount}`);
    };

    const handleBidAccepted = ({ taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Taklifingiz qabul qilindi! 🎉');
    };

    socket.on('task_status_changed', handleTaskStatusChanged);
    socket.on('new_bid', handleNewBid);
    socket.on('bid_accepted', handleBidAccepted);

    return () => {
      socket.off('task_status_changed', handleTaskStatusChanged);
      socket.off('new_bid', handleNewBid);
      socket.off('bid_accepted', handleBidAccepted);
    };
  }, [socket, queryClient]);

  return { socket, connected };
}
