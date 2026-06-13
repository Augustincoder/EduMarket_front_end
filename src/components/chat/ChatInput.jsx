// src/components/chat/ChatInput.jsx
import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, X, Image as ImageIcon, FileText, Check, Mic, Lock, File } from 'lucide-react';
import { filesApi } from '../../services/other.service';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { hapticLight, hapticSuccess } from '../../lib/telegram';
import { VoiceRecorder } from './VoiceRecorder';

export function ChatInput({ onSend, onTyping, disabled, replyingTo, editingMessage, onCancelAction }) {
  const [text, setText]       = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  // Pending file state for preview before sending
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingFilePreview, setPendingFilePreview] = useState(null);
  const [isSelectingSecureFile, setIsSelectingSecureFile] = useState(false);

  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (editingMessage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(editingMessage.content || '');
    } else if (!replyingTo) {
      setText('');
    }
  }, [editingMessage, replyingTo]);

  useEffect(() => {
    if (!text && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text]);

  const handleSend = async () => {
    const trimmed = text?.trim() || '';
    if (!trimmed && !pendingFile) return;

    if (pendingFile) {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('files', pendingFile);
        const res = await filesApi.upload(fd);
        const fileId = res.data.data.fileIds[0];
        
        // Determine fileType
        let fileType = 'document';
        if (pendingFile.type.startsWith('image/')) fileType = 'photo';
        else if (pendingFile.type.startsWith('video/')) fileType = 'video';
        else if (pendingFile.type.startsWith('audio/')) fileType = 'voice';

        onSend?.(trimmed, fileId, fileType, pendingFile.name, isSelectingSecureFile);
      } catch {
        toast.error('Fayl yuklashda xato');
      } finally {
        setUploading(false);
        setPendingFile(null);
        if (pendingFilePreview) URL.revokeObjectURL(pendingFilePreview);
        setPendingFilePreview(null);
        setIsSelectingSecureFile(false);
        if (!editingMessage) setText('');
        textareaRef.current.style.height = 'auto';
      }
    } else {
      onSend?.(trimmed, null);
      if (!editingMessage) setText('');
      textareaRef.current.style.height = 'auto';
    }
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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowMenu(false);
    
    setPendingFile(file);
    if (file.type.startsWith('image/')) {
      setPendingFilePreview(URL.createObjectURL(file));
    } else {
      setPendingFilePreview(null);
    }
    
    // Clear input so same file can be selected again
    e.target.value = '';
    // Focus text input
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleCancelFile = () => {
    setPendingFile(null);
    if (pendingFilePreview) URL.revokeObjectURL(pendingFilePreview);
    setPendingFilePreview(null);
    setIsSelectingSecureFile(false);
  };

  return (
    <div className="relative rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex flex-col">
      {/* File menu */}
      {showMenu && (
        <div className="absolute bottom-full left-4 mb-3 w-[240px] bg-edu-surface/60 backdrop-blur-md rounded-xl shadow-sheet border border-edu-border overflow-hidden z-10 animate-ios-pop">
          <button
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-black/5 dark:hover:bg-white/5 text-[14px] font-bold text-edu-text active:scale-[0.97] transition-transform duration-[120ms]"
            onClick={() => { setIsSelectingSecureFile(false); fileRef.current.accept='image/*'; fileRef.current.click(); }}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ImageIcon size={18} className="text-blue-500" />
            </div>
            Foto / Video
          </button>
          <div className="h-[1px] bg-edu-border mx-4" />
          <button
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-black/5 dark:hover:bg-white/5 text-[14px] font-bold text-edu-text active:scale-[0.97] transition-transform duration-[120ms]"
            onClick={() => { setIsSelectingSecureFile(false); fileRef.current.accept='*'; fileRef.current.click(); }}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <FileText size={18} className="text-edu-accent" />
            </div>
            Fayl (Hujjat)
          </button>
          <div className="h-[1px] bg-edu-border mx-4" />
          <button
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-black/5 dark:hover:bg-white/5 text-[14px] font-bold text-red-500 active:scale-[0.97] transition-transform duration-[120ms]"
            onClick={() => { setIsSelectingSecureFile(true); fileRef.current.accept='*'; fileRef.current.click(); }}
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Lock size={18} className="text-red-500" />
            </div>
            Himoyalangan fayl (Namuna)
          </button>
        </div>
      )}

      {/* Reply / Edit Preview Bar */}
      {(replyingTo || editingMessage) && !pendingFile && (
        <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 px-4 py-2.5 border-b border-edu-border/30">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-1 h-8 bg-edu-primary rounded-full mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className={cn("text-[11px] font-bold uppercase tracking-wider", replyingTo ? "text-edu-primary" : "text-blue-500")}>
                {replyingTo ? `Javob: ${replyingTo.sender?.fullname || 'Foydalanuvchi'}` : 'Tahrirlash'}
              </div>
              <div className="text-[13px] truncate font-medium text-edu-text opacity-70">
                {replyingTo ? replyingTo.content : editingMessage?.content}
              </div>
            </div>
          </div>
          <button aria-label="Bekor qilish" onClick={onCancelAction} className="w-11 h-11 rounded-full bg-black/5 flex items-center justify-center text-edu-muted active:scale-[0.97] transition-transform duration-[120ms]">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Selected File Preview Bar */}
      {pendingFile && (
        <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 px-4 py-3 border-b border-edu-border/30 animate-fade-in">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {pendingFilePreview ? (
              <img src={pendingFilePreview} alt="preview" className="w-12 h-12 object-cover rounded-xl shadow-sm border border-black/10" />
            ) : (
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-black/10 flex items-center justify-center">
                <File size={24} className="text-blue-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="text-[14px] font-bold text-edu-text truncate">
                  {pendingFile.name}
                </div>
                {isSelectingSecureFile && (
                  <Lock size={12} className="text-red-500 shrink-0" />
                )}
              </div>
              <div className="text-[12px] font-medium text-edu-muted">
                {(pendingFile.size / 1024 / 1024).toFixed(2)} MB {isSelectingSecureFile ? '• Himoyalangan' : ''}
              </div>
            </div>
          </div>
          <button aria-label="Faylni bekor qilish" onClick={handleCancelFile} disabled={uploading} className="w-10 h-10 ml-2 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-edu-text active:scale-[0.97] transition-transform duration-[120ms]">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 px-3 py-3">
        {/* Voice Mode */}
        {isVoiceMode ? (
          <VoiceRecorder 
            onSend={handleVoiceSend} 
            onCancel={() => setIsVoiceMode(false)} 
          />
        ) : (
          <div className="flex items-end flex-1 bg-edu-surface shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none border border-edu-border/60 rounded-xl p-1 transition-all focus-within:border-edu-primary/50 focus-within:ring-[3px] focus-within:ring-edu-primary/10">
            {/* Attach button */}
            <button
              aria-label="Biriktirish"
              onClick={() => { hapticLight(); setShowMenu((s) => !s); }}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 active:scale-[0.97] transition-transform duration-[120ms] transition-all ml-0.5 mb-0.5',
                showMenu ? 'bg-edu-primary text-white shadow-btn' : 'bg-transparent text-edu-muted hover:text-edu-text hover:bg-black/5 dark:hover:bg-white/5'
              )}
              disabled={!!editingMessage || uploading}
            >
              {uploading
                ? <div className="w-5 h-5 border-2 border-edu-primary border-t-transparent rounded-full animate-spin" />
                : <Paperclip size={20} className={showMenu ? 'text-white' : ''} />
              }
            </button>

            {/* Text input */}
            <div className="flex-1 overflow-hidden min-h-[44px] flex items-center py-1">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                  handleChange(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder={pendingFile ? "Izoh yozing..." : "Xabar..."}
                disabled={disabled || uploading}
                rows={1}
                className="w-full bg-transparent border-none px-3 text-[15px] font-medium text-edu-text placeholder:text-edu-muted focus:outline-none focus:ring-0 max-h-[120px] overflow-y-auto resize-none block leading-[1.4]"
                style={{ height: '24px' }}
              />
            </div>

            {/* Send or Mic button */}
            <div className="mr-0.5 mb-0.5 flex-shrink-0">
              {text.trim() || editingMessage || pendingFile ? (
                <button
                  aria-label={editingMessage ? "Saqlash" : "Yuborish"}
                  disabled={uploading}
                  onClick={() => { hapticSuccess(); handleSend(); }}
                  className="w-10 h-10 rounded-full bg-edu-primary flex items-center justify-center text-white shadow-btn active:scale-[0.97] transition-transform duration-[120ms] transition-transform"
                >
                  {editingMessage ? <Check size={18} /> : <Send size={18} className="ml-0.5" />}
                </button>
              ) : (
                <button
                  aria-label="Ovozli xabar"
                  onClick={() => { hapticLight(); setIsVoiceMode(true); }}
                  disabled={uploading}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent text-edu-muted hover:text-edu-text hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.97] transition-transform duration-[120ms] transition-colors"
                >
                  <Mic size={20} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} />
    </div>
  );
}

export default ChatInput;
