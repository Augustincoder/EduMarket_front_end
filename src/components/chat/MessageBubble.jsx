// src/components/chat/MessageBubble.jsx
import { useState, useEffect } from 'react';
import { cn, formatDatetime } from '../../lib/utils';
import { Check, CheckCheck, FileText, Download, Image as ImageIcon, X, MoreVertical, CornerDownRight, Edit2, Trash2, Ban, Clock, AlertCircle } from 'lucide-react';
import { filesApi } from '../../services/other.service';
import toast from 'react-hot-toast';
import { Spinner } from '../ui/Spinner';
import DOMPurify from 'dompurify';
import { VoicePlayer } from './VoicePlayer';

function ImageAttachment({ fileId, onClick }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Images from R2: try direct CDN URL first (instant, no API call)
    const publicUrl = filesApi.getPublicUrl(fileId);
    if (publicUrl) {
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
      onClick={() => onClick(url)}
      className="max-w-[200px] sm:max-w-[250px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity" 
    />
  );
}

export function MessageBubble({ message, isMe, onReply, onEdit, onDelete }) {
  const hasFile = !!message.fileId;
  const isImage = message.fileType === 'photo' || (message.fileName && /\.(jpg|jpeg|png|gif|webp)$/i.test(message.fileName));

  const [viewerUrl, setViewerUrl] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const downloadFile = async () => {
    try {
      const res = await filesApi.getUrl(message.fileId);
      window.open(res.data.data.url, '_blank');
    } catch {
      toast.error('Faylni yuklashda xato');
    }
  };

  if (message.isDeleted) {
    return (
      <div className={cn('flex items-end gap-2 max-w-[85%] animate-fade-in', isMe ? 'flex-row-reverse ml-auto' : 'mr-auto')}>
        <div className={cn('px-3 py-2 text-[14px] italic relative rounded-[22px]', isMe ? 'bg-edu-border/30 rounded-br-[4px] text-edu-muted' : 'bg-edu-border/30 rounded-bl-[4px] text-edu-muted border border-edu-border/50')}>
          <div className="flex items-center gap-2">
            <Ban size={14} className="opacity-50" />
            <span>Ushbu xabar o'chirildi</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('group flex items-end gap-2 max-w-[85%] animate-slide-up relative', isMe ? 'flex-row-reverse ml-auto' : 'mr-auto')}>
        
        {/* Actions Menu Trigger */}
        <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity flex items-center relative", isMe ? "mr-1" : "ml-1")}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-edu-muted"
          >
            <MoreVertical size={16} />
          </button>
          
          {/* Actions Menu */}
          {showMenu && (
            <div className={cn("absolute bottom-8 z-20 w-36 bg-edu-surface border border-edu-border rounded-xl shadow-sheet py-1 animate-fade-in", isMe ? "right-0" : "left-0")}>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" onClick={() => { setShowMenu(false); onReply?.(message); }}>
                <CornerDownRight size={14} /> Javob berish
              </button>
              {isMe && !hasFile && (
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" onClick={() => { setShowMenu(false); onEdit?.(message); }}>
                  <Edit2 size={14} /> Tahrirlash
                </button>
              )}
              {isMe && (
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10" onClick={() => { setShowMenu(false); onDelete?.(message.id); }}>
                  <Trash2 size={14} /> O'chirish
                </button>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            'px-3 py-2 text-[15px] leading-relaxed break-words relative',
            isMe
              ? 'bg-gradient-to-r from-edu-primary to-[#188F68] text-white rounded-[22px] rounded-br-[4px] shadow-sm shadow-edu-primary/20'
              : 'bg-edu-surface/95 backdrop-blur-xl text-edu-text rounded-[22px] rounded-bl-[4px] shadow-sm border border-edu-border/50',
            hasFile && !isImage && 'cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all'
          )}
          onClick={(hasFile && !isImage) ? downloadFile : undefined}
          onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
        >
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
            isImage ? (
              <ImageAttachment fileId={message.fileId} onClick={(url) => setViewerUrl(url)} />
            ) : message.fileType === 'voice' ? (
              <VoicePlayer fileId={message.fileId} isMe={isMe} />
            ) : (
              <div className="flex items-center gap-2.5 min-w-[160px] p-1">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                  isMe ? 'bg-white/20' : 'bg-edu-primary/10'
                )}>
                  <FileText size={18} className={isMe ? 'text-white' : 'text-edu-primary'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{message.fileName || 'Biriktirma'}</p>
                  <p className={cn('text-[10px] mt-0.5', isMe ? 'text-white/70' : 'text-edu-muted')}>
                    Yuklab olish
                  </p>
                </div>
                <Download size={14} className={isMe ? 'text-white/70' : 'text-edu-muted'} />
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
      </div>

      {/* Full Screen Image Viewer Modal */}
      {viewerUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
          <button 
            onClick={() => setViewerUrl(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
          <img 
            src={viewerUrl} 
            alt="Full screen preview" 
            className="max-w-[95vw] max-h-[85vh] object-contain rounded-xl"
          />
          <a 
            href={viewerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors"
          >
            <Download size={18} /> Yuklab olish
          </a>
        </div>
      )}
    </>
  );
}

export default MessageBubble;
