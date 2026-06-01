// src/components/chat/MessageBubble.jsx
import { cn, formatDatetime } from '../../lib/utils';
import { Check, CheckCheck, FileText, Download } from 'lucide-react';
import { filesApi } from '../../services/api';
import toast from 'react-hot-toast';

export function MessageBubble({ message, isMe }) {
  const hasFile = !!message.fileId;

  const downloadFile = async () => {
    try {
      const res = await filesApi.getUrl(message.fileId);
      window.open(res.data.data.url, '_blank');
    } catch {
      toast.error('Faylni yuklashda xato');
    }
  };

  return (
    <div className={cn('flex items-end gap-2 max-w-[85%] animate-slide-up', isMe ? 'flex-row-reverse ml-auto' : 'mr-auto')}>
      <div
        className={cn(
          'px-4 py-2.5 text-[15px] leading-relaxed break-words relative',
          isMe
            ? 'bg-gradient-to-r from-edu-primary to-[#188F68] text-white rounded-[22px] rounded-br-[4px] shadow-sm shadow-edu-primary/20'
            : 'bg-edu-surface/95 backdrop-blur-xl text-edu-text rounded-[22px] rounded-bl-[4px] shadow-sm border border-edu-border/50',
          hasFile && 'cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all'
        )}
        onClick={hasFile ? downloadFile : undefined}
      >
        {hasFile ? (
          <div className="flex items-center gap-2.5 min-w-[160px]">
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
              isMe ? 'bg-white/20' : 'bg-edu-primary/10'
            )}>
              <FileText size={18} className={isMe ? 'text-white' : 'text-edu-primary'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">Biriktirma</p>
              <p className={cn('text-xs mt-0.5', isMe ? 'text-white/70' : 'text-edu-muted')}>
                Yuklab olish
              </p>
            </div>
            <Download size={14} className={isMe ? 'text-white/70' : 'text-edu-muted'} />
          </div>
        ) : (
          message.content
        )}

        {/* Timestamp + read receipt */}
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isMe ? 'justify-end' : 'justify-start'
        )}>
          <span className={cn('text-[10px]', isMe ? 'text-white/60' : 'text-edu-muted')}>
            {formatDatetime(message.createdAt)}
          </span>
          {isMe && (
            message.isRead
              ? <CheckCheck size={12} className="text-white/80" />
              : <Check size={12} className="text-white/50" />
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
