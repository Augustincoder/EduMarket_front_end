import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FilterChip as Chip } from '../components/ui/Chip';
import { Circle } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { PageLayout } from '../components/layout/PageLayout';
import { cn } from '../lib/utils';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TextArea } from '../components/forms/TextArea';
import { ChatBubbleSkeleton } from '../components/ui/SkeletonCard';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useTask, useTaskTransition } from '../hooks/useTasks';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../services/api';

export default function ChatScreen() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user, token }  = useAuthStore();
  const bottomRef = useRef(null);

  const { socket, connected, messages, typingUsers, connect, joinRoom, leaveRoom, sendMessage, emitTyping, setMessages } = useChatStore();
  const { data: task } = useTask(id);
  const transitions = useTaskTransition(id);
  const taskId = id;

  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [revisionErrors, setRevisionErrors] = useState({});

  const handleRevisionSubmit = async () => {
    setRevisionErrors({});
    if (!revisionNote.trim()) return setRevisionErrors({ note: ['Izoh kiritish majburiy'] });
    try {
      await transitions.requestRevision.mutateAsync({ note: revisionNote });
      setRevisionOpen(false);
      setRevisionNote('');
    } catch (err) {
      if (err.serverErrors) setRevisionErrors(err.serverErrors);
    }
  };

  const { data: history, isLoading } = useQuery({
    queryKey: ['messages', taskId],
    queryFn:  () => chatApi.getByTask(taskId).then((r) => {
      const data = r.data.data;
      const msgs = Array.isArray(data) ? data : (data?.messages || []);
      return msgs.slice().reverse();
    }),
    enabled: !!taskId,
  });

  useEffect(() => {
    if (history) setMessages(taskId, history);
  }, [history, taskId, setMessages]);

  useEffect(() => {
    if (token) connect(token);
    return () => leaveRoom(taskId);
  }, [token, taskId]);

  // Rejoin room automatically if socket reconnects
  useEffect(() => {
    if (connected && taskId) {
      joinRoom(taskId);
    }
  }, [connected, taskId, joinRoom]);

  const roomMessages = messages[taskId] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length]);

  const handleSend = useCallback((content, fileId) => {
    sendMessage(taskId, content, fileId);
  }, [taskId, sendMessage]);

  const isInReview = task?.status === 'IN_REVIEW';
  const isClient   = user?.id === task?.clientId;

  const counterpart = isClient ? task?.freelancer : task?.client;
  const isCounterpartOnline = useChatStore((s) => s.userPresence[counterpart?.id]) ?? counterpart?.isOnline ?? false;

  return (
    <div className="flex flex-col h-dvh bg-edu-bg max-w-[430px] mx-auto">
      {/* Header */}
      <Header
        title={task?.freelancer?.fullname || task?.client?.fullname || 'Chat'}
        subtitle={task?.title}
        showBack
        className="!border-b-0"
        right={
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-colors",
              isCounterpartOnline ? "bg-edu-primary/10 text-edu-primary" : "bg-edu-muted/10 text-edu-muted"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                isCounterpartOnline ? "bg-edu-primary shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-edu-muted"
              )} />
              {isCounterpartOnline ? 'ONLAYN' : 'OFLAYN'}
            </div>
            {task && (
              <button 
                onClick={() => navigate(`/report?targetId=${isClient ? task.freelancerId : task.clientId}&targetType=USER`)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                title="Shikoyat qilish"
              >
                <span className="text-sm">🚩</span>
              </button>
            )}
          </div>
        }
      />
      
      {/* Divider */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-edu-border/50 to-transparent" />

      {/* IN_REVIEW sticky banner */}
      {isInReview && isClient && (
        <div className="bg-edu-surface/90 backdrop-blur-xl border-b border-edu-border/50 px-4 py-3 shadow-sm z-10 relative">
          <p className="text-sm font-bold text-edu-text mb-3 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-600 text-[10px]">
              ⚡
            </span>
            Ish topshirildi, tekshiring
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" fullWidth isLoading={transitions.accept.isPending}
              onClick={() => transitions.accept.mutate()}>✅ Qabul</Button>
            <Button size="sm" variant="secondary" fullWidth
              onClick={() => { setRevisionNote(''); setRevisionErrors({}); setRevisionOpen(true); }}>↺ Qaytarish</Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 space-y-3">
        {isLoading ? <ChatBubbleSkeleton /> : null}
        {Array.isArray(roomMessages) ? roomMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isMe={msg.senderId === user?.id} />
        )) : null}
        
        {typingUsers?.[taskId]?.length > 0 && (
          <div className="flex items-center gap-1 text-edu-muted text-xs animate-pulse px-2 py-1">
            <span className="w-1.5 h-1.5 bg-edu-muted rounded-full"></span>
            <span className="w-1.5 h-1.5 bg-edu-muted rounded-full"></span>
            <span className="w-1.5 h-1.5 bg-edu-muted rounded-full"></span>
            <span className="ml-2">Suhbatdosh yozmoqda...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} onTyping={() => emitTyping(taskId)} />

      {/* ── Revision Modal ─────────────────────────── */}
      <Modal
        isOpen={revisionOpen}
        onClose={() => setRevisionOpen(false)}
        title="Qayta ishlashga yuborish"
        footer={
          <Button fullWidth variant="primary" onClick={handleRevisionSubmit} isLoading={transitions.requestRevision.isPending}>
            Yuborish
          </Button>
        }
      >
        <div className="py-2">
          <TextArea
            label="Izoh (qayta ishlash sababi) *"
            placeholder="Nimalarni to'g'irlash kerakligini batafsil yozing..."
            value={revisionNote}
            onValueChange={(v) => { setRevisionNote(v); setRevisionErrors(e => ({ ...e, note: null })); }}
            maxLength={1000}
            minRows={4}
            error={revisionErrors.note?.[0]}
          />
        </div>
      </Modal>
    </div>
  );
}
