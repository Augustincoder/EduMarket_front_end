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
import { LayoutDashboard, Flag, Zap, CheckCircle, RefreshCw, Hand, ShieldAlert, Settings2 } from 'lucide-react';
import { AcceptDeliveryModal } from './TaskDetail/components/AcceptDeliveryModal';
import { Virtuoso } from 'react-virtuoso';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';

import { ChatInfoDrawer } from './Chat/ChatInfoDrawer';

// GroupSettingsModal removed, we now use ChatInfoDrawer.

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
    otherUser: (roomInfoData?.room?.type === 'DIRECT' || roomInfoData?.type === 'DIRECT') 
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

  const lastReadCall = useRef(0);

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
  
  const virtuosoRef = useRef(null);

  const handleJumpToMessage = useCallback((messageId) => {
    const index = roomMessages.findIndex(m => m.id === messageId);
    if (index !== -1 && virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index,
        align: 'center',
        behavior: 'smooth'
      });
    }
  }, [roomMessages]);

  // Read receipt with throttle
  useEffect(() => {
    const now = Date.now();
    // Throttle: max 1 call per 2 seconds
    if (now - lastReadCall.current < 2000) return;

    // Optimization: only scan the last 20 messages instead of potentially 10,000
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
  
  let title;
  let subtitle;

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

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="fixed inset-0 bg-edu-bg max-w-[768px] mx-auto w-full grid grid-rows-[auto_1fr_auto] h-[100dvh] z-50"
    >
      {/* Row 1: Header Area */}
      <div className="flex flex-col z-30">
        <Header
          title={title}
          subtitle={subtitle}
          onTitleClick={() => {
            if (isGroup || conversation?.type === 'DIRECT') setIsGroupSettingsOpen(true);
          }}
          showBack
          className="!border-b-0"
          right={
            <div className="flex items-center gap-2">
              {!isGroup && (
                <div className={cn("flex items-center justify-center w-5 h-5 rounded-full", isCounterpartOnline ? "bg-edu-primary/20" : "bg-edu-muted/20")}>
                  <div className={cn("w-2.5 h-2.5 rounded-full", isCounterpartOnline ? "bg-edu-primary shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-edu-muted")} />
                </div>
              )}

              {isGroup ? (
                <button 
                  onClick={() => setIsGroupSettingsOpen(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors"
                  title="Guruh sozlamalari"
                >
                  <Settings2 size={16} />
                </button>
              ) : (
                taskId && (
                  <button 
                    onClick={() => setIsWorkspaceOpen(true)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-edu-primary/10 text-edu-primary hover:bg-edu-primary/20 transition-colors"
                    title="Ish maydoni (Milestones)"
                  >
                    <LayoutDashboard size={14} />
                  </button>
                )
              )}
              
              {task && !task.isCoWorking && !isGroup && (
                <button 
                  onClick={() => navigate(`/report?targetId=${isClient ? task.freelancerId : task.clientId}&targetType=USER`)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-edu-urgent/10 text-edu-urgent hover:bg-edu-urgent/20 transition-colors"
                  title="Shikoyat qilish"
                >
                  <Flag size={14} />
                </button>
              )}
            </div>
          }
        />
        
        {/* Divider */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-edu-border/50 to-transparent" />

        {/* IN_REVIEW sticky banner */}
        <AnimatePresence>
          {isInReview && isClient && !isGroup && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute top-full left-0 w-full px-4 pt-2 pb-1 z-20"
            >
              <Card tilt glare radius="xl" className="bg-edu-surface/90 backdrop-blur-xl border border-yellow-500/30 shadow-[0_8px_32px_rgba(234,179,8,0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
                <CardContent className="p-3">
                  <p className="text-[13px] font-bold text-edu-text mb-2.5 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-600 text-[12px] shadow-sm">
                      <Zap size={12} className="animate-pulse" />
                    </span>
                    Ish topshirildi, tekshiring!
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" fullWidth onClick={() => setAcceptDeliveryOpen(true)} className="shadow-sm">
                      <CheckCircle size={14} className="mr-1" /> Qabul
                    </Button>
                    <Button size="sm" variant="secondary" fullWidth onClick={() => { setRevisionNote(''); setRevisionErrors({}); setRevisionOpen(true); }} className="bg-white/50 dark:bg-black/20 hover:bg-white/80 transition-colors">
                      <RefreshCw size={14} className="mr-1" /> Qaytarish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Row 2: Main Chat Area */}
      <div className="flex-1 min-h-0 bg-mesh-aurora relative px-2">
        <Virtuoso
          ref={virtuosoRef}
          data={roomMessages}
          firstItemIndex={Math.max(0, 100000 - roomMessages.length)}
          initialTopMostItemIndex={roomMessages.length - 1}
          followOutput="auto"
          alignToBottom
          className="h-full scrollbar-hide"
          components={{
            Header: () => (
              <div className="flex flex-col gap-4 mb-4 pt-4 px-1">
                {task && (conversation.type === 'TASK_ROOM' || conversation.type === 'DIRECT') && (task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'IN_REVIEW') && (
                  <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="mx-auto w-full max-w-[90%] md:max-w-md">
                    <Card tilt glare radius="xl" className="bg-gradient-to-br from-blue-50/90 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-200/50 dark:border-blue-800/30 p-4 shadow-[0_8px_32px_rgba(59,130,246,0.1)] relative overflow-hidden backdrop-blur-md">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                            <CheckCircle size={16} />
                          </div>
                          <h3 className="font-bold text-[14px] text-blue-900 dark:text-blue-100 tracking-tight">✅ Kelishuv Tasdiqlandi!</h3>
                        </div>
                        <button 
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg transition-colors active:scale-95"
                        >
                          Batafsil
                        </button>
                      </div>
                      
                      <div className="bg-white/80 dark:bg-black/30 rounded-xl p-3 mb-3 border border-blue-100/50 dark:border-blue-800/20 grid grid-cols-2 gap-3 backdrop-blur-sm">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-edu-muted mb-0.5">Kelishilgan narx</span>
                        <strong className="text-[14px] text-blue-700 dark:text-blue-300 font-bold">
                          {task.agreedPrice ? `${new Intl.NumberFormat('uz-UZ').format(task.agreedPrice)} UZS` : 'Kelishilmagan'}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-edu-muted mb-0.5">Muddat</span>
                        <strong className="text-[14px] text-blue-700 dark:text-blue-300 font-bold">
                          {new Date(task.deadline).toLocaleDateString('uz-UZ')}
                        </strong>
                      </div>
                    </div>

                    <p className="text-[11px] leading-relaxed text-blue-800/70 dark:text-blue-200/70 font-medium bg-blue-500/5 p-2 rounded-lg">
                      <ShieldAlert size={12} className="inline mr-1 -mt-0.5" />
                      Diqqat: Barcha yozishmalar va fayl almashinuvlarini platformada olib boring.
                    </p>
                    </Card>
                  </motion.div>
                )}
                
                {task && task.status === 'ASSIGNED' && !isClient && conversation.type === 'DIRECT' && (
                  <Button size="md" variant="accent" fullWidth className="shadow-lg" onClick={() => navigate(`/tasks/${task.id}`)}>
                    Vazifani boshlash
                  </Button>
                )}

                {isLoading ? <ChatBubbleSkeleton /> : null}
                
                {hasMore && !isLoading && (
                  <div className="flex justify-center my-2">
                    <Button size="sm" variant="secondary" onClick={loadMore} isLoading={isLoadingMore} className="bg-edu-surface/50 border-edu-border/50">
                      Eski xabarlarni yuklash
                    </Button>
                  </div>
                )}
                
                {!isLoading && roomMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 opacity-40">
                    <div className="w-20 h-20 rounded-full bg-edu-primary/5 flex items-center justify-center mb-4">
                      <Hand size={40} className="text-edu-primary opacity-50" />
                    </div>
                    <p className="text-[15px] font-bold text-edu-text tracking-tight">Suhbatni boshlang!</p>
                  </div>
                )}
              </div>
            ),
            Footer: () => (
              <div className="flex flex-col gap-1 mt-1 px-1">
                {typingUsers?.[chatRoomId]?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-edu-muted text-[11px] font-bold px-3 py-1 opacity-70">
                    <div className="flex gap-[3px] items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.15
                          }}
                          className="w-1.5 h-1.5 bg-edu-primary/70 rounded-full"
                        />
                      ))}
                    </div>
                    <motion.span 
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="ml-1 uppercase tracking-wider text-edu-primary/80"
                    >
                      Yozmoqda...
                    </motion.span>
                  </div>
                )}
                <div className="h-4" />
              </div>
            )
          }}
          itemContent={(index, msg) => (
            <div className="mb-1.5 px-1">
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
            </div>
          )}
        />
      </div>

      {/* Input */}
      <div className="shrink-0 relative z-20 pb-4 pt-2 px-3 bg-gradient-to-t from-edu-bg via-edu-bg to-transparent">
        <ChatInput 
          onSend={handleSend} 
          onTyping={() => emitTyping(chatRoomId)} 
          replyingTo={replyingTo}
          editingMessage={editingMessage}
          onCancelAction={handleCancelAction}
        />
      </div>

      {/* ── Modals ─────────────────────────── */}
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
