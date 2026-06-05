// src/components/chat/ChatInput.jsx
import { useState, useRef, useEffect } from 'react';
import { TextInput } from '../forms/TextInput';
import { Button } from '../ui/Button';
import { Paperclip, Send, X, Image, FileText, CornerDownRight, Edit2, Check, Mic } from 'lucide-react';
import { filesApi } from '../../services/other.service';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { VoiceRecorder } from './VoiceRecorder';

export function ChatInput({ onSend, onTyping, disabled, replyingTo, editingMessage, onCancelAction }) {
  const [text, setText]       = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content || '');
    } else if (!replyingTo) {
      setText('');
    }
  }, [editingMessage, replyingTo]);

  const handleSend = () => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    onSend?.(trimmed, null);
    if (!editingMessage) setText('');
  };

  const handleVoiceSend = async (blob) => {
    setUploading(true);
    try {
      const extension = blob.type.includes('webm') ? 'webm' : 
                        blob.type.includes('mp4')  ? 'm4a' : 
                        blob.type.includes('ogg')  ? 'ogg' : 'wav';
      
      const fd = new FormData();
      fd.append('files', blob, `voice_message.${extension}`);
      const res = await filesApi.upload(fd);
      const fileId = res.data.data.fileIds[0];
      onSend?.(null, fileId, 'voice');
    } catch (err) {
      const msg = err.serverMsg || err.response?.data?.message || 'Ovozli xabar yuborishda xato';
      toast.error(msg);
      console.error("Voice upload error:", err);
    } finally {
      setUploading(false);
      setIsVoiceMode(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (val) => {
    setText(val);
    onTyping?.();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowMenu(false);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await filesApi.upload(fd);
      const fileId = res.data.data.fileIds[0];
      onSend?.(null, fileId);
    } catch {
      toast.error('Fayl yuklashda xato');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="relative border-t border-edu-border ios-glass pb-safe flex flex-col">
      {/* File menu */}
      {showMenu && (
        <div className="absolute bottom-full left-4 mb-3 w-[200px] ios-glass rounded-[20px] shadow-sheet border border-edu-border overflow-hidden z-10 animate-ios-pop">
          <button
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-black/5 dark:hover:bg-white/5 text-[14px] font-bold text-edu-text active-spring"
            onClick={() => { fileRef.current.accept='image/*'; fileRef.current.click(); }}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Image size={18} className="text-blue-500" />
            </div>
            Foto / Video
          </button>
          <div className="h-[1px] bg-edu-border mx-4" />
          <button
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-black/5 dark:hover:bg-white/5 text-[14px] font-bold text-edu-text active-spring"
            onClick={() => { fileRef.current.accept='*'; fileRef.current.click(); }}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <FileText size={18} className="text-edu-accent" />
            </div>
            Fayl (Hujjat)
          </button>
        </div>
      )}

      {/* Reply / Edit Preview Bar */}
      {(replyingTo || editingMessage) && (
        <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 px-4 py-2.5 border-b border-edu-border/30">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-1 h-8 bg-edu-primary rounded-full mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className={cn("text-[11px] font-black uppercase tracking-wider", replyingTo ? "text-edu-primary" : "text-blue-500")}>
                {replyingTo ? `Javob: ${replyingTo.sender?.fullname || 'Foydalanuvchi'}` : 'Tahrirlash'}
              </div>
              <div className="text-[13px] truncate font-medium text-edu-text opacity-70">
                {replyingTo ? replyingTo.content : editingMessage?.content}
              </div>
            </div>
          </div>
          <button onClick={onCancelAction} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-edu-muted active-spring">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3 px-3 py-2.5">
        {/* Attach button */}
        {!isVoiceMode && (
          <button
            onClick={() => { hapticLight(); setShowMenu((s) => !s); }}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 active-spring transition-all',
              showMenu ? 'bg-edu-primary text-white shadow-btn' : 'bg-black/5 dark:bg-white/5 text-edu-muted'
            )}
            disabled={!!editingMessage || uploading}
          >
            {uploading
              ? <div className="w-5 h-5 border-2 border-edu-primary border-t-transparent rounded-full animate-spin" />
              : <Paperclip size={20} className={showMenu ? 'text-white' : 'text-edu-text'} />
            }
          </button>
        )}

        {/* Text input or Voice UI */}
        {isVoiceMode ? (
          <VoiceRecorder 
            onSend={handleVoiceSend} 
            onCancel={() => setIsVoiceMode(false)} 
          />
        ) : (
          <>
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Xabar..."
                disabled={disabled || uploading}
                rows={1}
                className="w-full bg-black/5 dark:bg-white/5 border border-edu-border/50 rounded-[20px] px-4 py-2.5 text-[15px] text-edu-text focus:outline-none focus:border-edu-primary transition-all max-h-32 overflow-y-auto resize-none"
              />
            </div>

            {/* Send or Mic button */}
            {text.trim() || editingMessage ? (
              <button
                disabled={uploading}
                onClick={() => { hapticSuccess(); handleSend(); }}
                className="w-10 h-10 rounded-full bg-edu-primary flex items-center justify-center text-white shadow-btn active-spring flex-shrink-0"
              >
                {editingMessage ? <Check size={18} /> : <Send size={18} className="ml-0.5" />}
              </button>
            ) : (
              <button
                onClick={() => { hapticLight(); setIsVoiceMode(true); }}
                disabled={uploading}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 text-edu-text hover:text-edu-primary active-spring transition-colors flex-shrink-0"
              >
                <Mic size={20} />
              </button>
            )}
          </>
        )}
      </div>

      <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />
    </div>
  );
}

export default ChatInput;
