import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { cn } from '../../lib/utils';
import { showConfirm } from '../../lib/telegram';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TextArea } from '../../components/forms/TextArea';
import { ChatBubbleSkeleton } from '../../components/ui/SkeletonCard';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useTask, useTaskTransition } from '../../hooks/useTasks';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../../services/chat.service';
import { useChatSocket } from '../../hooks/useChatSocket';
import { useChatHistory } from '../../hooks/useChatHistory';
import { WorkspaceOverlay } from './Chat/WorkspaceOverlay';
import EduViewer from '../../components/ui/EduViewer';
import { LayoutDashboard, Flag, Zap, CheckCircle, RefreshCw, Hand, ShieldAlert, Settings2, ChevronDown } from 'lucide-react';
import { AcceptDeliveryModal } from './TaskDetail/components/AcceptDeliveryModal';
import { Virtuoso } from 'react-virtuoso';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';
import { ChatInfoDrawer } from './Chat/ChatInfoDrawer';

export default function ChatScreen() {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  
  const conversations = useChatStore((s) => s.conversations);
  const messages = useChatStore((s) => s.messages);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const editMessage = useChatStore((s) => s.editMessage);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const emitTyping = useChatStore((s) => s.emitTyping);
  
  const storeConversation = conversations.find(c => c.chatRoomId === chatRoomId);
  
  const { data: roomInfoData } = useQuery({
    queryKey: ['chatRoomInfo', chatRoomId],
    queryFn: () => chatApi.getChatRoomInfo(chatRoomId).then(r => r.data.data),
    enabled: !!chatRoomId,
    retry: 1,
  });

  const conversation = storeConversation || {
    chatRoomId,
    type: roomInfoData?.room?.type || roomInfoData?.type || 'DIRECT',
    taskId: roomInfoData?.room?.taskId || roomInfoData?.taskId,
    title: roomInfoData?.room?.name || roomInfoData?.name || '',
    avatarUrl: roomInfoData?.room?.avatarUrl || roomInfoData?.avatarUrl,
    otherUser: (roomInfoData?.room?.type === 'DIRECT' || roomInfoData?.type === 'DIRECT' || roomInfoData?.room?.type === 'TASK_ROOM' || roomInfoData?.type === 'TASK_ROOM') 
      ? roomInfoData?.participants?.find(p => p.user?.id !== user?.id)?.user 
      : null
  };

  const taskId = conversation.taskId;
  const isGroup = conversation.type === 'CUSTOM_GROUP' || conversation.type === 'TASK_ROOM';

  const { data: task } = useTask(taskId, { enabled: !!taskId });
  const transitions = useTaskTransition(taskId);

  useChatSocket(chatRoomId);
  const { isLoading, hasMore, isLoadingMore, loadMore } = useChatHistory(chatRoomId);

  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [revisionErrors, setRevisionErrors] = useState({});
  const [acceptDeliveryOpen, setAcceptDeliveryOpen] = useState(false);

  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  // 🪄 track last message id to animate new arrivals

  const lastReadCall = useRef(0);
  const virtuosoRef = useRef(null);

  const handleViewFile = (fileId, fileName, isSecureFile, mimeType) => {
    setViewerFile({ id: fileId, name: fileName || fileId.split('/').pop(), isSecureFile, mimeType });
  };

  const handleRevisionSubmit = async () => {
    if (!taskId) return;
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

  const roomMessages = useMemo(() => messages[chatRoomId] || [], [messages, chatRoomId]);

  // 🪄 Detect new incoming message for entrance animation
  const lastMsgId = roomMessages[roomMessages.length - 1]?.id ?? null;

  const handleJumpToMessage = useCallback((messageId) => {
    const index = roomMessages.findIndex(m => m.id === messageId);
    if (index !== -1 && virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({ index, align: 'center', behavior: 'smooth' });
    }
  }, [roomMessages]);

  // Read receipt
  useEffect(() => {
    const now = Date.now();
    if (now - lastReadCall.current < 2000) return;
    const recentMessages = roomMessages.slice(-20);
    const hasUnread = recentMessages.some(m => !m.isRead && m.senderId !== user?.id);
    if (hasUnread) {
      lastReadCall.current = now;
      chatApi.markAsRead(chatRoomId).catch(() => {});
      useChatStore.getState().markConversationRead(chatRoomId);
    }
  }, [roomMessages, chatRoomId, user?.id]);

  const handleSend = useCallback((content, fileId, fileType, fileName, isSecureFile) => {
    if (editingMessage) {
      editMessage(editingMessage.id, content);
      setEditingMessage(null);
    } else {
      sendMessage(chatRoomId, content, fileId, replyingTo?.id, fileType, fileName, isSecureFile);
      setReplyingTo(null);
    }
  }, [chatRoomId, sendMessage, editMessage, replyingTo, editingMessage]);

  const handleCancelAction = () => {
    setReplyingTo(null);
    setEditingMessage(null);
  };

  const isInReview = task?.status === 'IN_REVIEW';
  const isClient   = user?.id === task?.clientId;

  const userPresence = useChatStore((s) => s.userPresence);
  const isCounterpartOnline = conversation?.otherUser && userPresence[conversation.otherUser.id];
  
  let title, subtitle;
  if (isGroup) {
    title = conversation?.title || 'Guruh suhbati';
    subtitle = `${roomInfoData?.participants?.length || 0} a'zo`;
  } else if (conversation?.type === 'TASK_ROOM') {
    title = task?.title || conversation?.title || 'Topshiriq suhbati';
    subtitle = conversation?.otherUser?.fullname || 'Foydalanuvchi bilan';
  } else {
    title = conversation?.otherUser?.fullname || 'Foydalanuvchi';
    subtitle = conversation?.otherUser?.username ? `@${conversation.otherUser.username}` : 'Shaxsiy suhbat';
  }

  // 🪄 Scroll-to-bottom button handler
  const scrollToBottom = () => {
    virtuosoRef.current?.scrollToIndex({ index: roomMessages.length - 1, behavior: 'smooth' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 bg-edu-bg max-w-[768px] mx-auto w-full flex flex-col h-[100dvh] z-50 overflow-hidden"
    >
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex flex-col z-30 bg-edu-bg/90 backdrop-blur-xl border-b border-edu-border/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <Header
          title={title}
          subtitle={subtitle}
          onTitleClick={() => {
            if (isGroup || conversation?.type === 'DIRECT') setIsGroupSettingsOpen(true);
          }}
          showBack
          className="!border-b-0 bg-transparent"
          right={
            <div className="flex items-center gap-2">
              {!isGroup && (
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-colors duration-500",
                    isCounterpartOnline
                      ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                      : "bg-slate-400/50 dark:bg-slate-600/50"
                  )} />
                  {isCounterpartOnline && (
                    <span className="text-[11px] font-bold text-green-600 dark:text-green-400">Online</span>
                  )}
                </div>
              )}

              {isGroup ? (
                <button 
                  onClick={() => setIsGroupSettingsOpen(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 active:scale-95 transition-all"
                >
                  <Settings2 size={18} />
                </button>
              ) : (
                taskId && (
                  <button 
                    onClick={() => setIsWorkspaceOpen(true)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-edu-primary/10 text-edu-primary hover:bg-edu-primary/20 active:scale-95 transition-all"
                  >
                    <LayoutDashboard size={16} />
                  </button>
                )
              )}
              
              {task && !task.isCoWorking && !isGroup && (
                <button 
                  onClick={() => navigate(`/report?targetId=${isClient ? task.freelancerId : task.clientId}&targetType=USER`)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-edu-urgent/10 text-edu-urgent hover:bg-edu-urgent/20 active:scale-95 transition-all"
                >
                  <Flag size={16} />
                </button>
              )}
            </div>
          }
        />

        {/* IN_REVIEW banner */}
        <AnimatePresence>
          {isInReview && isClient && !isGroup && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full px-3 pb-2 z-20 overflow-hidden"
            >
              <Card tilt glare radius="xl" className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 shadow-sm relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-l-xl" />
                <CardContent className="p-3">
                  <p className="text-[13px] font-bold text-edu-text mb-2.5 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-600 text-[12px]">
                      <Zap size={14} className="animate-pulse" />
                    </span>
                    Ish topshirildi, tekshiring!
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" fullWidth onClick={() => setAcceptDeliveryOpen(true)} className="shadow-sm h-8 text-[12px]">
                      <CheckCircle size={14} className="mr-1" /> Qabul
                    </Button>
                    <Button size="sm" variant="secondary" fullWidth onClick={() => { setRevisionNote(''); setRevisionErrors({}); setRevisionOpen(true); }} className="h-8 text-[12px] bg-white/50 dark:bg-black/20">
                      <RefreshCw size={14} className="mr-1" /> Qaytarish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Message List ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 bg-mesh-aurora relative w-full">
        <Virtuoso
          ref={virtuosoRef}
          data={roomMessages}
          firstItemIndex={Math.max(0, 100000 - roomMessages.length)}
          initialTopMostItemIndex={roomMessages.length - 1}
          followOutput="smooth"
          alignToBottom
          atBottomStateChange={setIsAtBottom}
          className="h-full scrollbar-hide"
          components={{
            Header: () => (
              <div className="flex flex-col gap-4 mb-4 pt-6 px-3">
                {task && (conversation.type === 'TASK_ROOM' || conversation.type === 'DIRECT') && (task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'IN_REVIEW') && (
                  <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="mx-auto w-full max-w-[90%] md:max-w-md">
                    <Card tilt glare radius="xl" className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-blue-200/60 dark:border-blue-800/60 p-4 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <CheckCircle size={18} strokeWidth={2.5} />
                          </div>
                          <h3 className="font-bold text-[14px] text-edu-text tracking-tight">Kelishuv Tasdiqlandi</h3>
                        </div>
                        <button 
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-full transition-colors active:scale-95"
                        >
                          Batafsil
                        </button>
                      </div>
                      
                      <div className="bg-edu-bg rounded-xl p-3 mb-3 border border-edu-border/50 grid grid-cols-2 gap-3">
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-edu-muted mb-0.5">Kelishilgan narx</span>
                          <strong className="text-[14px] text-edu-primary font-bold">
                            {task.agreedPrice ? `${new Intl.NumberFormat('uz-UZ').format(task.agreedPrice)} UZS` : 'Kelishilmagan'}
                          </strong>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-edu-muted mb-0.5">Muddat</span>
                          <strong className="text-[14px] text-edu-primary font-bold">
                            {new Date(task.deadline).toLocaleDateString('uz-UZ')}
                          </strong>
                        </div>
                      </div>

                      <p className="text-[11px] leading-relaxed text-edu-muted font-medium bg-edu-surface p-2.5 rounded-xl border border-edu-border/50 flex gap-2">
                        <ShieldAlert size={14} className="shrink-0 text-yellow-500 mt-0.5" />
                        <span>Diqqat: Barcha yozishmalar va fayl almashinuvlarini platformada olib boring.</span>
                      </p>
                    </Card>
                  </motion.div>
                )}
                
                {task && task.status === 'ASSIGNED' && !isClient && conversation.type === 'DIRECT' && (
                  <div className="px-4">
                    <Button size="md" variant="primary" fullWidth className="shadow-lg rounded-xl" onClick={() => navigate(`/tasks/${task.id}`)}>
                      Vazifani boshlash
                    </Button>
                  </div>
                )}

                {isLoading ? <ChatBubbleSkeleton /> : null}
                
                {hasMore && !isLoading && (
                  <div className="flex justify-center my-2">
                    <button onClick={loadMore} disabled={isLoadingMore} className="px-4 py-1.5 rounded-full bg-edu-surface border border-edu-border text-[12px] font-bold text-edu-muted hover:text-edu-text transition-colors">
                      {isLoadingMore ? 'Yuklanmoqda...' : 'Eski xabarlarni yuklash'}
                    </button>
                  </div>
                )}
                
                {!isLoading && roomMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <div className="w-16 h-16 rounded-full bg-edu-primary/10 flex items-center justify-center mb-4">
                      <Hand size={32} className="text-edu-primary" />
                    </div>
                    <p className="text-[15px] font-bold text-edu-text tracking-tight">Suhbatni boshlang</p>
                    <p className="text-[12px] text-edu-muted mt-1">Birinchi xabarni yozing</p>
                  </div>
                )}
              </div>
            ),
            Footer: () => (
              <div className="flex flex-col gap-1 mt-1 px-2 pb-2">
                <AnimatePresence>
                  {typingUsers?.[chatRoomId]?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.92 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center gap-2 px-3 py-2 max-w-fit bg-edu-surface/90 backdrop-blur-sm rounded-2xl rounded-bl-sm border border-edu-border/40 ml-1"
                    >
                      <div className="flex gap-[3px] items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut', delay: i * 0.14 }}
                            className="w-1.5 h-1.5 bg-edu-primary rounded-full block"
                          />
                        ))}
                      </div>
                      <span className="text-edu-primary text-[11px] font-bold ml-0.5">Yozmoqda...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Space so last message isn't hidden behind input */}
                <div className="h-2" />
              </div>
            )
          }}
          itemContent={(index, msg) => {
            const isNewest = msg.id === lastMsgId && msg.senderId !== user?.id;
            return (
              // 🪄 Design Spell: new message floats up with spring
              <motion.div
                key={msg.id}
                className="mb-1.5 px-2"
                initial={isNewest ? { opacity: 0, y: 20, scale: 0.94 } : false}
                animate={isNewest ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              >
                <MessageBubble 
                  message={msg} 
                  isMe={msg.senderId === user?.id} 
                  onReply={(m) => { setReplyingTo(m); setEditingMessage(null); }}
                  onEdit={(m) => { setEditingMessage(m); setReplyingTo(null); }}
                  onDelete={(id) => { 
                    showConfirm("Rostdan ham o'chirmoqchimisiz?", (ok) => {
                      if (ok) deleteMessage(id);
                    });
                  }}
                  onViewFile={handleViewFile}
                  onJumpToMessage={handleJumpToMessage}
                />
              </motion.div>
            );
          }}
        />

        {/* 🪄 Scroll-to-bottom FAB */}
        <AnimatePresence>
          {!isAtBottom && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              onClick={scrollToBottom}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-edu-surface/90 backdrop-blur-md border border-edu-border shadow-[0_4px_16px_rgba(0,0,0,0.12)] flex items-center justify-center text-edu-text active:scale-90 transition-transform z-10"
            >
              <ChevronDown size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Input Bar — iOS glass island ─────────────────────────────────────── */}
      {/* 🪄 Design Spell: morphs between docked & floating island based on scroll position */}
      <div className="pointer-events-none relative z-30 flex w-full shrink-0 justify-center px-2 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className={cn(
            'pointer-events-auto relative w-full overflow-visible rounded-[28px]',
            'border border-white/45 bg-edu-surface/72 shadow-lg backdrop-blur-[28px]',
            'dark:border-white/10 dark:bg-edu-surface/70'
          )}
          style={{
            marginBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* glass shimmer top line */}
          <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20" />

          <ChatInput 
            onSend={handleSend} 
            onTyping={() => emitTyping(chatRoomId)} 
            replyingTo={replyingTo}
            editingMessage={editingMessage}
            onCancelAction={handleCancelAction}
          />
        </motion.div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={revisionOpen}
        onClose={() => setRevisionOpen(false)}
        title="Qayta ishlashga yuborish"
        footer={
          <Button fullWidth variant="primary" onClick={handleRevisionSubmit} isLoading={transitions?.requestRevision?.isPending}>
            Yuborish
          </Button>
        }
      >
        <div className="py-2">
          <TextArea
            label="Izoh (qayta ishlash sababi) *"
            value={revisionNote}
            onValueChange={(v) => { setRevisionNote(v); setRevisionErrors(e => ({ ...e, note: null })); }}
            maxLength={1000}
            minRows={4}
            error={revisionErrors.note?.[0]}
          />
        </div>
      </Modal>

      <ChatInfoDrawer 
        isOpen={isGroupSettingsOpen} 
        onClose={() => setIsGroupSettingsOpen(false)} 
        chatRoomId={chatRoomId} 
        conversation={{ ...conversation, displayTitle: title }}
        currentUser={user}
        onViewFile={handleViewFile}
        onJumpToMessage={handleJumpToMessage}
      />

      {taskId && isWorkspaceOpen && (
        <WorkspaceOverlay 
          taskId={taskId}
          isClient={isClient}
          isOpen={isWorkspaceOpen}
          onClose={() => setIsWorkspaceOpen(false)}
        />
      )}

      <AcceptDeliveryModal
        isOpen={acceptDeliveryOpen}
        onClose={() => setAcceptDeliveryOpen(false)}
        isLoading={transitions?.accept?.isPending}
        onConfirm={async () => {
          try {
            await transitions.accept.mutateAsync();
            setAcceptDeliveryOpen(false);
          } catch {
            // Handled
          }
        }}
      />

      <EduViewer
        isOpen={!!viewerFile}
        onClose={() => setViewerFile(null)}
        file={viewerFile}
        isSecure={viewerFile?.isSecureFile}
      />
    </motion.div>
  );
}
