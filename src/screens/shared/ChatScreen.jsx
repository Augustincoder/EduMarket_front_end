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

import { ChatInfoDrawer } from './Chat/ChatInfoDrawer';

// GroupSettingsModal removed, we now use ChatInfoDrawer.

export default function ChatScreen() {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  
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
    enabled: !!chatRoomId && !storeConversation,
    retry: 1,
  });

  const conversation = storeConversation || {
    chatRoomId,
    type: roomInfoData?.room?.type || 'DIRECT',
    taskId: roomInfoData?.room?.taskId,
    title: roomInfoData?.room?.name || '',
    avatarUrl: roomInfoData?.room?.avatarUrl,
    otherUser: roomInfoData?.room?.type === 'DIRECT' ? roomInfoData?.participants?.find(p => p.user?.id !== user?.id)?.user : null
  };

  const taskId = conversation.taskId;
  const isGroup = conversation.type === 'CUSTOM_GROUP';

  const { data: task } = useTask(taskId, { enabled: !!taskId });
  const transitions = useTaskTransition(taskId);

  useChatSocket(chatRoomId, token);
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

  // Read receipt
  useEffect(() => {
    // Optimization: only scan the last 20 messages instead of potentially 10,000
    const recentMessages = roomMessages.slice(-20);
    const hasUnread = recentMessages.some(m => !m.isRead && m.senderId !== user?.id);
    if (hasUnread) {
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
    <div className="fixed inset-0 bg-edu-bg max-w-[768px] mx-auto w-full grid grid-rows-[auto_1fr_auto] h-[100dvh]">
      {/* Row 1: Header Area */}
      <div className="flex flex-col z-30">
        <Header
          title={
            <div 
              className={cn("flex flex-col transition-opacity", isGroup || conversation?.type === 'DIRECT' ? "cursor-pointer hover:opacity-80" : "")}
              onClick={() => {
                if (isGroup || conversation?.type === 'DIRECT') setIsGroupSettingsOpen(true);
              }}
            >
              <span className="font-bold leading-tight">{title}</span>
              <span className="text-[11px] text-edu-muted leading-tight truncate max-w-[200px]">{subtitle}</span>
            </div>
          }
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
        {isInReview && isClient && !isGroup && (
          <div className="bg-edu-surface/90 backdrop-blur-xl border-b border-edu-border/50 px-4 py-3 shadow-sm relative">
            <p className="text-sm font-bold text-edu-text mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-600 text-[10px]">
                <Zap size={10} />
              </span>
              Ish topshirildi, tekshiring
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" fullWidth onClick={() => setAcceptDeliveryOpen(true)}><CheckCircle size={14} className="mr-1" /> Qabul</Button>
              <Button size="sm" variant="secondary" fullWidth onClick={() => { setRevisionNote(''); setRevisionErrors({}); setRevisionOpen(true); }}><RefreshCw size={14} className="mr-1" /> Qaytarish</Button>
            </div>
          </div>
        )}
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
                {task && !isGroup && (task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'IN_REVIEW') && (
                  <div className="mx-auto w-full max-w-[90%] md:max-w-md bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <CheckCircle size={16} />
                      </div>
                      <h3 className="font-bold text-[14px] text-blue-900 dark:text-blue-100 tracking-tight">✅ Kelishuv Tasdiqlandi!</h3>
                    </div>
                    
                    <div className="bg-white/60 dark:bg-black/20 rounded-xl p-3 mb-3 border border-blue-100/50 dark:border-blue-800/20 grid grid-cols-2 gap-3">
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
                  </div>
                )}
                
                {task && task.status === 'ASSIGNED' && !isClient && !isGroup && (
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
                  <div className="flex items-center gap-1.5 text-edu-muted text-[11px] font-bold animate-pulse px-3 py-1 opacity-70">
                    <div className="flex gap-0.5">
                      <span className="w-1 h-1 bg-edu-muted rounded-full"></span>
                      <span className="w-1 h-1 bg-edu-muted rounded-full"></span>
                      <span className="w-1 h-1 bg-edu-muted rounded-full"></span>
                    </div>
                    <span className="ml-1 uppercase tracking-wider">Yozmoqda...</span>
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
    </div>
  );
}
