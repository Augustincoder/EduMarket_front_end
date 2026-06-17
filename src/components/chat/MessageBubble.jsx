// src/components/chat/MessageBubble.jsx
import { useState, useRef, useEffect } from 'react';
import { cn, formatDatetime } from '../../lib/utils';
import { 
  Check, CheckCheck, FileText, Image as ImageIcon, CornerDownRight, 
  Edit2, Trash2, Clock, AlertCircle, FileType, Lock,
  ThumbsUp, ThumbsDown, Heart, Flame, Star, Zap, Smile, Coffee, Gift, Trophy
} from 'lucide-react';
import { filesApi } from '../../services/other.service';
import { Spinner } from '../ui/Spinner';
import { Avatar } from '../ui/Avatar';
import DOMPurify from 'dompurify';
import { VoicePlayer } from './VoicePlayer';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { hapticLight, hapticSuccess } from '../../lib/telegram';

const REACTION_ICONS = {
  ThumbsUp, ThumbsDown, Heart, Flame, Star, Zap, Smile, Coffee, Gift, Trophy
};

function ImageAttachment({ fileId, onClick }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const publicUrl = filesApi.getPublicUrl(fileId);
    if (publicUrl) {
      // Delay state updates to next tick to avoid "cascading renders" lint error
      setTimeout(() => {
        if (isMounted) {
          setUrl(publicUrl);
          setLoading(false);
        }
      }, 0);
      return;
    }
    filesApi.getUrl(fileId).then(res => {
      if (isMounted) { setUrl(res.data.data.url); setLoading(false); }
    }).catch(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [fileId]);

  if (loading) return <div className="w-48 h-32 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center animate-pulse"><Spinner size="sm" /></div>;
  if (!url) return (
    <div className="w-48 h-32 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-lg flex flex-col items-center justify-center">
      <ImageIcon size={24} className="mb-2 opacity-50" />
      <span className="text-xs">Rasm yuklanmadi</span>
    </div>
  );

  return (
    <img 
      src={url} alt="Attachment" 
      onClick={(e) => { e.stopPropagation(); onClick(url); }}
      className="max-w-[200px] sm:max-w-[250px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity" 
    />
  );
}

export function MessageBubble({ message, isMe, onReply, onEdit, onDelete, onViewFile, onJumpToMessage }) {
  const hasFile = !!message.fileId;
  const isImage = message.fileType === 'photo' || (message.fileName && /\.(jpg|jpeg|png|gif|webp)$/i.test(message.fileName));

  const [showMenu, setShowMenu] = useState(false);
  const [reactionListIcon, setReactionListIcon] = useState(null);
  // Track menu position — above or below bubble
  const [menuAbove, setMenuAbove] = useState(true);
  const bubbleRef = useRef(null);
  const user = useAuthStore(s => s.user);
  const toggleReaction = useChatStore(s => s.toggleReaction);

  // Decide whether to show menu above or below based on available space
  const openMenu = () => {
    if (bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      // If there's at least 200px above, show above; else show below
      setMenuAbove(spaceAbove >= 200);
    }
    hapticLight();
    setShowMenu(true);
  };

  const getMimeType = (fileName, isImg) => {
    if (isImg) return 'image/jpeg';
    if (!fileName) return '';
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return 'application/pdf';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt': return 'text/plain';
      case 'json': return 'application/json';
      default: return '';
    }
  };

  const handleFileClick = () => {
    if (hasFile && message.fileType !== 'voice') {
      const mime = getMimeType(message.fileName, isImage);
      onViewFile?.(message.fileId, message.fileName, message.isSecureFile, mime);
    }
  };

  const handleReact = (iconName) => {
    toggleReaction(message.id, message.chatRoomId, iconName);
    setShowMenu(false);
  };

  const rawReactions = message.reactions || [];
  const groupedReactions = rawReactions.reduce((acc, r) => {
    if (!acc[r.icon]) acc[r.icon] = [];
    acc[r.icon].push(r);
    return acc;
  }, {});

  // Swipe-to-reply physics
  const dragX = useMotionValue(0);
  const replyIconOpacity = useTransform(dragX, [0, -30, -60], [0, 0, 1]);
  const replyIconScale = useTransform(dragX, [0, -60], [0.5, 1.2]);
  
  const handleDragEnd = (event, info) => {
    if (info.offset.x < -60) {
      onReply?.(message);
      hapticSuccess();
    }
  };

  if (message.isDeleted) {
    return (
      <div className={cn('flex items-end gap-2 max-w-[85%] my-1.5', isMe ? 'flex-row-reverse ml-auto' : 'mr-auto')}>
        <div className={cn(
          "px-4 py-2.5 rounded-2xl border border-dashed flex items-center gap-2",
          isMe ? "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 rounded-br-[4px]" : "bg-edu-surface dark:bg-edu-surface border-edu-border/50 rounded-bl-[4px]"
        )}>
          <Trash2 size={14} className="text-edu-muted/50" />
          <p className="text-[13px] italic font-medium text-edu-muted/70">Xabar o'chirildi</p>
        </div>
      </div>
    );
  }

  if (message.type === 'SYSTEM_EVENT') {
    return (
      <div className="flex justify-center w-full my-2 pointer-events-none">
        <div className="px-4 py-1.5 bg-blue-500/10 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[12px] font-bold rounded-full shadow-sm border border-blue-500/20 flex items-center gap-1.5 backdrop-blur-sm">
          {message.content}
        </div>
      </div>
    );
  }

  // ─── menu position classes ────────────────────────────────────────────────────
  const menuPositionClass = menuAbove
    ? 'bottom-full mb-2'
    : 'top-full mt-2';

  return (
    <>
      {/* Backdrop — closes menu on outside click */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] cursor-default bg-black/10 dark:bg-black/40 backdrop-blur-[3px]" 
            onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
          />
        )}
      </AnimatePresence>

      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x: dragX, touchAction: 'pan-y' }}
        // FIX: Subtler entrance animation — no large scale jump
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={cn(
          'group flex items-end gap-2 max-w-[85%] sm:max-w-[75%] my-1.5 relative overflow-x-clip',
          isMe ? 'flex-row-reverse ml-auto' : 'mr-auto',
          showMenu && 'z-[70]'
        )}
      >
        <motion.div
          className="flex flex-col gap-1 w-fit relative"
          ref={bubbleRef}
        >
          <motion.div
            whileTap={{ scale: 0.98 }}
            // FIX: Don't animate scale on showMenu — causes layout shift
            className={cn(
              'px-3.5 py-2 text-[14.5px] leading-relaxed break-words relative shadow-sm cursor-pointer',
              isMe
                ? 'bg-edu-primary text-white rounded-[18px] rounded-br-[4px]'
                : 'bg-edu-surface/96 dark:bg-edu-surface text-edu-text rounded-[18px] rounded-bl-[4px] border border-edu-border/40 backdrop-blur-sm',
              hasFile && message.fileType !== 'voice' && (!isImage || message.isSecureFile) && 'hover:opacity-90 active:scale-[0.98]',
              showMenu && 'ring-2 ring-edu-primary/20'
            )}
            onClick={(e) => {
              const isInteractive = e.target.closest('button') || e.target.closest('a') || e.target.closest('audio') || e.target.closest('img') || e.target.closest('.voice-player-wrap');
              if (isInteractive) return;
              if (hasFile && message.fileType !== 'voice' && (!isImage || message.isSecureFile)) {
                handleFileClick();
              } else {
                showMenu ? setShowMenu(false) : openMenu();
              }
            }}
            onContextMenu={(e) => { e.preventDefault(); openMenu(); }}
          >
            {/* ─── Actions Menu ──────────────────────────────────────────── */}
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.92, y: menuAbove ? 6 : -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: menuAbove ? 6 : -6 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className={cn(
                    // FIX: Use fixed vertical position (above or below) based on measured space
                    // so the menu never clips into the chat list header
                    "absolute z-[80] bg-edu-surface/95 backdrop-blur-xl border border-edu-border",
                    "rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] py-1 flex flex-col",
                    "min-w-[180px] max-w-[240px] overflow-hidden",
                    menuPositionClass,
                    isMe ? "right-0" : "left-0"
                  )} 
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Reactions Row */}
                  <div className="flex items-center gap-0.5 px-2 py-2 border-b border-edu-border/50 overflow-x-auto scrollbar-hide">
                    {Object.entries(REACTION_ICONS).map(([name, Icon]) => (
                      <button 
                        key={name}
                        onClick={() => handleReact(name)}
                        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-transform shrink-0"
                      >
                        <Icon size={18} className="text-edu-text" />
                      </button>
                    ))}
                  </div>

                  <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-edu-text hover:bg-black/5 dark:hover:bg-white/5 text-left font-semibold" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onReply?.(message); }}>
                    <CornerDownRight size={15} /> Javob berish
                  </button>
                  {isMe && !hasFile && (
                    <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-edu-text hover:bg-black/5 dark:hover:bg-white/5 text-left font-semibold" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(message); }}>
                      <Edit2 size={15} /> Tahrirlash
                    </button>
                  )}
                  {isMe && (
                    <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-left font-semibold" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete?.(message.id); }}>
                      <Trash2 size={15} /> O'chirish
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reply Preview */}
            {message.replyTo && !message.replyTo.isDeleted && (
              <div 
                onClick={(e) => { e.stopPropagation(); onJumpToMessage?.(message.replyTo.id); }}
                className={cn(
                  "mb-2 p-1.5 px-2.5 rounded-lg text-xs border-l-2 cursor-pointer hover:bg-black/10 transition-colors",
                  isMe ? "bg-black/10 border-white/40" : "bg-black/5 dark:bg-white/5 border-edu-primary"
                )}
              >
                <div className={cn("font-bold mb-0.5", isMe ? "text-white/90" : "text-edu-primary")}>{message.replyTo.sender?.fullname || 'Foydalanuvchi'}</div>
                <div className={cn("truncate opacity-80", isMe ? "text-white" : "text-edu-text")}>{message.replyTo.content || "Biriktirma"}</div>
              </div>
            )}

            {/* File / Content */}
            {hasFile ? (
              (isImage && !message.isSecureFile) ? (
                <ImageAttachment fileId={message.fileId} onClick={() => onViewFile?.(message.fileId, message.fileName, false, 'image/jpeg')} />
              ) : message.fileType === 'voice' ? (
                <div className="voice-player-wrap" onClick={(e) => e.stopPropagation()}>
                  <VoicePlayer fileId={message.fileId} isMe={isMe} />
                </div>
              ) : (
                <div className="flex items-center gap-2.5 min-w-[160px] p-1">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', isMe ? 'bg-white/20' : (message.isSecureFile ? 'bg-red-500/10' : 'bg-edu-primary/10'))}>
                    {message.isSecureFile ? <Lock size={18} className={isMe ? 'text-white' : 'text-red-500'} /> : <FileText size={18} className={isMe ? 'text-white' : 'text-edu-primary'} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate flex items-center gap-1">
                      {message.isSecureFile && <span className="text-[9px] uppercase bg-red-500 text-white px-1 py-0.5 rounded-sm shrink-0">Himoyalangan</span>}
                      {message.fileName || 'Biriktirma'}
                    </p>
                    <p className={cn('text-[10px] mt-0.5', isMe ? 'text-white/70' : 'text-edu-muted')}>Ko'rish uchun bosing</p>
                  </div>
                  <FileType size={14} className={isMe ? 'text-white/70' : 'text-edu-muted'} />
                </div>
              )
            ) : (
              <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.content, { ALLOWED_TAGS: ['b', 'i', 'a', 'code', 'pre'] }) }} />
            )}

            {/* Timestamp + read receipt */}
            <div className={cn('flex items-center gap-1 mt-1.5', isMe ? 'justify-end' : 'justify-start')}>
              {message.isEdited && (
                <span className={cn('text-[10px] italic mr-1', isMe ? 'text-white/60' : 'text-edu-muted')}>(tahrirlangan)</span>
              )}
              <span className={cn('text-[10px]', isMe ? 'text-white/60' : 'text-edu-muted')}>
                {formatDatetime(message.createdAt)}
              </span>
              {isMe && (
                message.isError ? (
                  <AlertCircle size={12} className="text-red-300" title="Xatolik" />
                ) : message.isSending ? (
                  <Clock size={12} className="text-white/50 animate-pulse" title="Yuborilmoqda..." />
                ) : message.isRead ? (
                  <CheckCheck size={14} className="text-blue-300 drop-shadow-md" />
                ) : (
                  <Check size={12} className="text-white/50" />
                )
              )}
            </div>
          </motion.div>

          {/* Swipe-to-reply icon */}
          <motion.div 
            className="pointer-events-none absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-edu-border bg-edu-surface/80 shadow-sm backdrop-blur-md"
            style={{ opacity: replyIconOpacity, scale: replyIconScale }}
          >
            <CornerDownRight size={13} className="text-edu-primary" />
          </motion.div>

          {/* Reactions */}
          {Object.keys(groupedReactions).length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className={cn("flex flex-wrap gap-1 -mt-3.5 relative z-10", isMe ? "justify-end mr-1" : "justify-start ml-1")}
            >
              {Object.entries(groupedReactions).map(([iconName, reactionItems]) => {
                const Icon = REACTION_ICONS[iconName];
                if (!Icon) return null;
                const hasReacted = reactionItems.some(r => r.userId === user?.id);
                return (
                  <motion.button
                    key={iconName}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReact(iconName)}
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setReactionListIcon(iconName); hapticLight(); }}
                    className={cn(
                      "flex items-center gap-1 pl-1.5 pr-2 py-[3px] rounded-full text-[11px] font-bold shadow-sm border backdrop-blur-md",
                      hasReacted 
                        ? "bg-edu-primary/15 border-edu-primary/30 text-edu-primary dark:bg-edu-primary/25" 
                        : "bg-edu-surface/95 dark:bg-slate-800/95 border-edu-border/60 text-edu-text hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <Icon size={14} className={cn(hasReacted ? "text-edu-primary fill-edu-primary/30" : "text-edu-muted")} />
                    <span className={hasReacted ? "text-edu-primary font-extrabold" : "font-medium"}>{reactionItems.length}</span>
                    
                    {/* Avatars Stack */}
                    <div className="flex -space-x-1.5 ml-0.5 pointer-events-none">
                      {reactionItems.slice(0, 3).map((r, i) => (
                        <Avatar 
                          key={r.userId || i} 
                          name={r.user?.fullname || '?'} 
                          avatarUrl={r.user?.avatarUrl} 
                          size="xs" 
                          className={cn("w-[16px] h-[16px] text-[8px] border-[1.5px]", hasReacted ? "border-edu-surface dark:border-edu-surface" : "border-edu-surface dark:border-edu-surface")}
                        />
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* External action trigger — visible on hover/focus */}
      </motion.div>
      {/* Reaction List Modal */}
      <AnimatePresence>
        {reactionListIcon && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm cursor-pointer"
              onClick={() => setReactionListIcon(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xs bg-edu-surface dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b border-edu-border/50 bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-2">
                  {(() => {
                     const Icon = REACTION_ICONS[reactionListIcon];
                     return Icon ? <Icon size={18} className="text-edu-primary fill-edu-primary/20" /> : null;
                  })()}
                  <span className="font-bold text-sm text-edu-text">Reaksiyalar</span>
                </div>
                <div className="text-xs font-semibold px-2 py-0.5 rounded-full bg-edu-primary/10 text-edu-primary">
                  {groupedReactions[reactionListIcon]?.length || 0}
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {groupedReactions[reactionListIcon]?.map((r, i) => (
                  <div key={r.userId || i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <Avatar name={r.user?.fullname || '?'} avatarUrl={r.user?.avatarUrl} size="sm" />
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-edu-text leading-none">{r.user?.fullname || 'Foydalanuvchi'}</span>
                      {r.user?.userId === user?.id && <span className="text-[10px] font-medium text-edu-muted mt-1">Siz</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MessageBubble;
