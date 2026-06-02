// src/components/chat/MessageBubble.jsx
import { useState, useEffect } from 'react';
import { cn, formatDatetime } from '../../lib/utils';
import { Check, CheckCheck, FileText, Download, Image as ImageIcon, X } from 'lucide-react';
import { filesApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Spinner } from '../ui/Spinner';

function ImageAttachment({ fileId, onClick }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
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

export function MessageBubble({ message, isMe }) {
  const hasFile = !!message.fileId;
  const isImage = message.fileType === 'photo' || (message.fileName && /\.(jpg|jpeg|png|gif|webp)$/i.test(message.fileName));

  const [viewerUrl, setViewerUrl] = useState(null);

  const downloadFile = async () => {
    try {
      const res = await filesApi.getUrl(message.fileId);
      window.open(res.data.data.url, '_blank');
    } catch {
      toast.error('Faylni yuklashda xato');
    }
  };

  return (
    <>
      <div className={cn('flex items-end gap-2 max-w-[85%] animate-slide-up', isMe ? 'flex-row-reverse ml-auto' : 'mr-auto')}>
        <div
          className={cn(
            'px-3 py-2 text-[15px] leading-relaxed break-words relative',
            isMe
              ? 'bg-gradient-to-r from-edu-primary to-[#188F68] text-white rounded-[22px] rounded-br-[4px] shadow-sm shadow-edu-primary/20'
              : 'bg-edu-surface/95 backdrop-blur-xl text-edu-text rounded-[22px] rounded-bl-[4px] shadow-sm border border-edu-border/50',
            hasFile && !isImage && 'cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all'
          )}
          onClick={(hasFile && !isImage) ? downloadFile : undefined}
        >
          {hasFile ? (
            isImage ? (
              <ImageAttachment fileId={message.fileId} onClick={(url) => setViewerUrl(url)} />
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
            message.content
          )}

          {/* Timestamp + read receipt */}
          <div className={cn(
            'flex items-center gap-1 mt-1.5',
            isMe ? 'justify-end' : 'justify-start'
          )}>
            <span className={cn('text-[10px]', isMe ? 'text-white/60' : 'text-edu-muted')}>
              {formatDatetime(message.createdAt)}
            </span>
            {isMe && (
              message.isRead
                ? <CheckCheck size={14} className="text-blue-300 drop-shadow-md" />
                : <Check size={12} className="text-white/50" />
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
