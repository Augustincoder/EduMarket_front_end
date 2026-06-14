// src/components/chat/MessageBubble.jsx
import { useState, useEffect } from 'react';
import { cn, formatDatetime } from '../../lib/utils';
import { 
  Check, CheckCheck, FileText, Image as ImageIcon, MoreVertical, CornerDownRight, 
  Edit2, Trash2, Ban, Clock, AlertCircle, FileType, Lock,
  ThumbsUp, ThumbsDown, Heart, Flame, Star, Zap, Smile, Coffee, Gift, Trophy
} from 'lucide-react';
import { filesApi } from '../../services/other.service';
import { Spinner } from '../ui/Spinner';
import DOMPurify from 'dompurify';
import { VoicePlayer } from './VoicePlayer';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

const REACTION_ICONS = {
  ThumbsUp, ThumbsDown, Heart, Flame, Star, Zap, Smile, Coffee, Gift, Trophy
};

function ImageAttachment({ fileId, onClick }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Images from R2: try direct CDN URL first (instant, no API call)
    const publicUrl = filesApi.getPublicUrl(fileId);
    if (publicUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUrl(publicUrl);
       
      setLoading(false);
      return;
    }

    // Fallback: use presigned URL for non-CDN or unknown image types
    filesApi.getUrl(fileId).then(res => {
      if (isMounted) {
        setUrl(res.data.data.url);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, [fileId]);

  if (loading) {
    return <div className="w-48 h-32 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center animate-pulse"><Spinner size="sm" /></div>;
  }

  if (!url) {
    return (
      <div className="w-48 h-32 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-lg flex flex-col items-center justify-center">
        <ImageIcon size={24} className="mb-2 opacity-50" />
        <span className="text-xs">Rasm yuklanmadi</span>
      </div>
    );
  }

  return (
    <img 
      src={url} 
      alt="Attachment" 
      onClick={(e) => { e.stopPropagation(); onClick(url); }}
      className="max-w-[200px] sm:max-w-[250px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity" 
    />
  );
}

export function MessageBubble({ message, isMe, onReply, onEdit, onDelete, onViewFile }) {
  const hasFile = !!message.fileId;
  const isImage = message.fileType === 'photo' || (message.fileName && /\.(jpg|jpeg|png|gif|webp)$/i.test(message.fileName));

  const [showMenu, setShowMenu] = useState(false);
  const user = useAuthStore(s => s.user);
  const toggleReaction = useChatStore(s => s.toggleReaction);

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
    acc[r.icon].push(r.userId);
    return acc;
  }, {});

  if (message.isDeleted) {
    return (
      <div className={cn('flex items-end gap-2 max-w-[85%] animate-fade-in', isMe ? 'flex-row-reverse ml-auto' : 'mr-auto')}>
        <div className={cn('px-3 py-2 text-[14px] italic relative rounded-xl', isMe ? 'bg-edu-border/30 rounded-br-[4px] text-edu-muted' : 'bg-edu-border/30 rounded-bl-[4px] text-edu-muted border border-edu-border/50')}>
          <div className="flex items-center gap-2">
            <Ban size={14} className="opacity-50" />
            <span>Ushbu xabar o'chirildi</span>
          </div>
        </div>
      </div>
    );
  }

  // Tizim xabarlari (SYSTEM_EVENT)
  if (message.type === 'SYSTEM_EVENT') {
    return (
      <div className="flex justify-center w-full my-3 animate-fade-in pointer-events-none">
        <div className="px-4 py-1.5 bg-blue-500/10 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[12px] font-bold rounded-full shadow-sm border border-blue-500/20 flex items-center gap-1.5 backdrop-blur-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <>
      {showMenu && (
        <div 
          className="fixed inset-0 z-[60] cursor-default bg-black/5" 
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}

      <div className={cn('group flex items-end gap-2 max-w-[85%] sm:max-w-[75%] my-2 animate-slide-up relative', isMe ? 'flex-row-reverse ml-auto' : 'mr-auto', showMenu && 'z-[70]')}>
        <div className="flex flex-col gap-1 w-full relative">
          <div
            className={cn(
              'px-3.5 py-2 text-[14.5px] leading-relaxed break-words relative transition-all shadow-sm cursor-pointer hover:brightness-98 dark:hover:brightness-110 active:scale-[0.99]',
              isMe
                ? 'bg-gradient-to-br from-edu-primary/95 to-edu-primary/85 text-white rounded-[18px] rounded-br-[4px] shadow-edu-primary/10'
                : 'bg-edu-surface dark:bg-edu-surface text-edu-text rounded-[18px] rounded-bl-[4px] border border-edu-border/40',
              hasFile && message.fileType !== 'voice' && (!isImage || message.isSecureFile) && 'hover:opacity-90 active:scale-[0.98]'
            )}
            onClick={(e) => {
              const isInteractive = e.target.closest('button') || e.target.closest('a') || e.target.closest('audio') || e.target.closest('img') || e.target.closest('.voice-player-wrap');
              if (isInteractive) return;

              if (hasFile && message.fileType !== 'voice' && (!isImage || message.isSecureFile)) {
                handleFileClick();
              } else {
                setShowMenu(!showMenu);
              }
            }}
            onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
          >
            {/* Actions Menu */}
            {showMenu && (
              <div 
                className={cn(
                  "absolute bottom-full mb-2 z-[80] bg-edu-surface dark:bg-edu-surface border border-edu-border rounded-xl shadow-lg py-1 animate-ios-pop flex flex-col min-w-[180px] max-w-[240px]",
                  isMe ? "right-0" : "left-0"
                )} 
                onClick={(e) => e.stopPropagation()}
              >
                {/* Reactions Row */}
                <div className="flex items-center gap-1 px-2 py-2 border-b border-edu-border/50 overflow-x-auto scrollbar-hide">
                  {Object.entries(REACTION_ICONS).map(([name, Icon]) => (
                    <button 
                      key={name}
                      onClick={() => handleReact(name)}
                      className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-transform shrink-0"
                    >
                      <Icon size={18} className={isMe ? "text-edu-text" : "text-edu-text"} />
                    </button>
                  ))}
                </div>

                <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-edu-text hover:bg-black/5 dark:hover:bg-white/5 text-left font-semibold mt-0.5" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onReply?.(message); }}>
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
              </div>
            )}

            {/* Reply Preview */}
            {message.replyTo && !message.replyTo.isDeleted && (
              <div 
                className={cn(
                  "mb-2 p-1.5 px-2.5 rounded-lg text-xs border-l-2",
                  isMe ? "bg-black/10 border-white/40" : "bg-black/5 dark:bg-white/5 border-edu-primary"
                )}
              >
                <div className={cn("font-bold mb-0.5", isMe ? "text-white/90" : "text-edu-primary")}>{message.replyTo.sender?.fullname || 'Foydalanuvchi'}</div>
                <div className={cn("truncate opacity-80", isMe ? "text-white" : "text-edu-text")}>{message.replyTo.content || "Biriktirma"}</div>
              </div>
            )}

            {hasFile ? (
              (isImage && !message.isSecureFile) ? (
                <ImageAttachment fileId={message.fileId} onClick={() => onViewFile?.(message.fileId, message.fileName, false, 'image/jpeg')} />
              ) : message.fileType === 'voice' ? (
                <div className="voice-player-wrap" onClick={(e) => e.stopPropagation()}>
                  <VoicePlayer fileId={message.fileId} isMe={isMe} />
                </div>
              ) : (
                <div className="flex items-center gap-2.5 min-w-[160px] p-1">
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                    isMe ? 'bg-white/20' : (message.isSecureFile ? 'bg-red-500/10' : 'bg-edu-primary/10')
                  )}>
                    {message.isSecureFile ? (
                      <Lock size={18} className={isMe ? 'text-white' : 'text-red-500'} />
                    ) : (
                      <FileText size={18} className={isMe ? 'text-white' : 'text-edu-primary'} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate flex items-center gap-1">
                      {message.isSecureFile && <span className="text-[9px] uppercase bg-red-500 text-white px-1 py-0.5 rounded-sm shrink-0">Himoyalangan</span>}
                      {message.fileName || 'Biriktirma'}
                    </p>
                    <p className={cn('text-[10px] mt-0.5', isMe ? 'text-white/70' : 'text-edu-muted')}>
                      Ko'rish uchun bosing
                    </p>
                  </div>
                  <FileType size={14} className={isMe ? 'text-white/70' : 'text-edu-muted'} />
                </div>
              )
            ) : (
              <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.content, { ALLOWED_TAGS: ['b', 'i', 'a', 'code', 'pre'] }) }} />
            )}

            {/* Timestamp + read receipt */}
            <div className={cn(
              'flex items-center gap-1 mt-1.5',
              isMe ? 'justify-end' : 'justify-start'
            )}>
              {message.isEdited && (
                <span className={cn('text-[10px] italic mr-1', isMe ? 'text-white/60' : 'text-edu-muted')}>
                  (tahrirlangan)
                </span>
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
          </div>

          {/* Render Reactions */}
          {Object.keys(groupedReactions).length > 0 && (
            <div className={cn("flex flex-wrap gap-1 mt-1 z-10 relative px-1", isMe ? "justify-end" : "justify-start")}>
              {Object.entries(groupedReactions).map(([iconName, users]) => {
                const Icon = REACTION_ICONS[iconName];
                if (!Icon) return null;
                const hasReacted = users.includes(user?.id);
                return (
                  <button
                    key={iconName}
                    onClick={() => handleReact(iconName)}
                    className={cn(
                      "group flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all active:scale-95 shadow-sm border",
                      hasReacted 
                        ? "bg-edu-primary/10 border-edu-primary/30 text-edu-primary dark:bg-edu-primary/20" 
                        : "bg-edu-surface dark:bg-slate-800 border-edu-border/60 text-edu-muted hover:text-edu-text hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <Icon size={14} className={cn("transition-transform group-hover:scale-110", hasReacted ? "text-edu-primary fill-edu-primary/20" : "")} />
                    <span className={hasReacted ? "text-edu-primary font-extrabold" : "font-medium"}>{users.length}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* External action trigger for better visibility */}
        <button 
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className={cn(
            "p-1 rounded-full text-edu-muted opacity-0 group-hover:opacity-100 transition-opacity self-end mb-2 hover:bg-black/5 dark:hover:bg-white/5",
            showMenu && "opacity-100 bg-black/5"
          )}
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </>
  );
}

export default MessageBubble;
