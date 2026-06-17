import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Paperclip, Send, X, Image as ImageIcon, FileText,
  Check, Mic, Lock, File, CornerDownRight, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { filesApi } from '../../services/other.service';
import { cn } from '../../lib/utils';
import { hapticLight, hapticSuccess } from '../../lib/telegram';
import { VoiceRecorder } from './VoiceRecorder';

function AttachItem({ icon: Icon, label, color, bg, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-black/5 dark:active:bg-white/5"
    >
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', bg)}>
        <Icon size={18} className={color} />
      </span>
      <span className="text-[15px] font-semibold text-edu-text">{label}</span>
    </motion.button>
  );
}

export function ChatInput({ onSend, onTyping, disabled, replyingTo, editingMessage, onCancelAction }) {
  const [text, setText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingFilePreview, setPendingFilePreview] = useState(null);
  const [isSelectingSecureFile, setIsSelectingSecureFile] = useState(false);

  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 118)}px`;
  }, []);

  useEffect(() => {
    if (!editingMessage) return undefined;

    const timer = window.setTimeout(() => {
      setText(editingMessage.content || '');
      textareaRef.current?.focus();
      adjustHeight();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [adjustHeight, editingMessage]);

  const resetComposer = () => {
    if (editingMessage) return;
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = '24px';
  };

  const handleSend = async () => {
    const trimmed = text?.trim() || '';
    if (!trimmed && !pendingFile) return;

    setIsSending(true);
    window.setTimeout(() => setIsSending(false), 180);
    hapticSuccess();

    if (pendingFile) {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('files', pendingFile);
        const res = await filesApi.upload(fd);
        const fileId = res.data.data.fileIds[0];
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
        resetComposer();
      }
      return;
    }

    onSend?.(trimmed, null);
    resetComposer();
  };

  const handleVoiceSend = async (blob) => {
    setUploading(true);
    try {
      const ext = blob.type.includes('webm') ? 'webm' : blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'wav';
      const fd = new FormData();
      fd.append('files', blob, `voice_message.${ext}`);
      const res = await filesApi.upload(fd);
      const fileId = res.data.data.fileIds[0];
      onSend?.(null, fileId, 'voice');
    } catch (err) {
      toast.error(err.serverMsg || err.response?.data?.message || 'Ovozli xabar yuborishda xato');
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
    window.requestAnimationFrame(adjustHeight);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowMenu(false);
    setPendingFile(file);
    setPendingFilePreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    e.target.value = '';
    window.setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleCancelFile = () => {
    setPendingFile(null);
    if (pendingFilePreview) URL.revokeObjectURL(pendingFilePreview);
    setPendingFilePreview(null);
    setIsSelectingSecureFile(false);
  };

  const openPicker = (accept, secure = false) => {
    setIsSelectingSecureFile(secure);
    if (fileRef.current) {
      fileRef.current.accept = accept;
      fileRef.current.click();
    }
  };

  const hasContent = !!(text.trim() || editingMessage || pendingFile);

  if (isVoiceMode) {
    return (
      <div className="px-3 pb-2 pt-2">
        <VoiceRecorder onSend={handleVoiceSend} onCancel={() => setIsVoiceMode(false)} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90]"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="absolute bottom-[calc(100%+10px)] left-3 z-[100] w-[224px] overflow-hidden rounded-[22px] border border-white/45 bg-edu-surface/82 shadow-lg backdrop-blur-2xl dark:border-white/10 dark:bg-edu-surface/78"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20" />
              <AttachItem
                icon={ImageIcon}
                label="Foto / Video"
                color="text-edu-info"
                bg="bg-edu-info-l"
                onClick={() => openPicker('image/*,video/*')}
              />
              <div className="mx-4 h-px bg-edu-border/50" />
              <AttachItem
                icon={FileText}
                label="Fayl (Hujjat)"
                color="text-edu-accent"
                bg="bg-edu-accent-l"
                onClick={() => openPicker('*')}
              />
              <div className="mx-4 h-px bg-edu-border/50" />
              <AttachItem
                icon={Lock}
                label="Himoyalangan fayl"
                color="text-edu-urgent"
                bg="bg-edu-urgent-l"
                onClick={() => openPicker('*', true)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(replyingTo || editingMessage) && !pendingFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="mx-3 mt-2 flex items-center gap-2.5 rounded-[18px] border border-white/35 bg-white/28 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/6">
              <div className={cn('h-9 w-1 shrink-0 rounded-full', replyingTo ? 'bg-edu-primary' : 'bg-edu-info')} />
              <div className="min-w-0 flex-1">
                <div className={cn('flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-label', replyingTo ? 'text-edu-primary' : 'text-edu-info')}>
                  {replyingTo ? <><CornerDownRight size={11} />{replyingTo.sender?.fullname || 'Javob'}</> : <><Edit2 size={11} />Tahrirlash</>}
                </div>
                <div className="truncate text-[13px] font-medium text-edu-text/70">
                  {replyingTo ? (replyingTo.content || 'Biriktirma') : editingMessage?.content}
                </div>
              </div>
              <button
                type="button"
                onClick={onCancelAction}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-edu-muted/10 text-edu-muted transition-all active:scale-90 hover:text-edu-text"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="mx-3 mt-2 flex items-center gap-3 rounded-[18px] border border-white/35 bg-white/28 px-3 py-2.5 shadow-sm dark:border-white/10 dark:bg-white/6">
              {pendingFilePreview ? (
                <img src={pendingFilePreview} alt="preview" className="h-10 w-10 shrink-0 rounded-[14px] border border-black/10 object-cover" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-edu-info-l">
                  <File size={20} className="text-edu-info" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate text-[13px] font-bold text-edu-text">
                  {isSelectingSecureFile && <Lock size={11} className="shrink-0 text-edu-urgent" />}
                  {pendingFile.name}
                </div>
                <div className="text-[11px] font-medium text-edu-muted">
                  {(pendingFile.size / 1024 / 1024).toFixed(2)} MB{isSelectingSecureFile ? ' · Himoyalangan' : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelFile}
                disabled={uploading}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-edu-muted/10 text-edu-muted transition-all active:scale-90 hover:text-edu-text disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={isSending ? { y: 2, scale: 0.99 } : { y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 700, damping: 20 }}
        className="flex items-end gap-2 px-3 pb-2.5 pt-2"
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          aria-label="Biriktirish"
          onClick={() => { hapticLight(); setShowMenu((s) => !s); }}
          disabled={!!editingMessage || uploading}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 disabled:opacity-40',
            showMenu ? 'bg-edu-primary text-white shadow-btn' : 'bg-white/30 text-edu-muted hover:text-edu-text dark:bg-white/5'
          )}
        >
          {uploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-edu-primary border-t-transparent" />
          ) : (
            <Paperclip size={19} strokeWidth={2.2} className={cn('transition-transform duration-200', showMenu && 'rotate-45')} />
          )}
        </motion.button>

        <div
          className={cn(
            'flex min-h-[44px] flex-1 items-end rounded-[22px] px-4 py-[10px]',
            'border border-white/55 bg-white/68 shadow-sm backdrop-blur-xl',
            'transition-all duration-200 dark:border-white/10 dark:bg-white/8',
            'focus-within:border-edu-primary/45 focus-within:bg-white/82 dark:focus-within:bg-white/12'
          )}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingFile ? 'Izoh yozing...' : 'Xabar...'}
            disabled={disabled || uploading}
            rows={1}
            className="max-h-[118px] flex-1 resize-none overflow-hidden border-none bg-transparent py-0 text-[15px] font-medium leading-[1.45] text-edu-text placeholder:text-edu-muted/60 focus:outline-none focus:ring-0"
            style={{ height: '24px' }}
          />
        </div>

        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
          <AnimatePresence mode="popLayout">
            {hasContent ? (
              <motion.button
                key="send"
                type="button"
                initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
                transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                aria-label={editingMessage ? 'Saqlash' : 'Yuborish'}
                disabled={uploading}
                onClick={handleSend}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-edu-primary text-white shadow-btn transition-transform active:scale-90 disabled:opacity-50"
              >
                {editingMessage ? (
                  <Check size={17} strokeWidth={2.5} />
                ) : (
                  <Send size={16} strokeWidth={2.2} className="translate-x-[1px]" />
                )}
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                type="button"
                initial={{ opacity: 0, scale: 0.6, rotate: 20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: -20 }}
                transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                aria-label="Ovozli xabar"
                disabled={uploading}
                onClick={() => { hapticLight(); setIsVoiceMode(true); }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/30 text-edu-muted transition-all active:scale-90 hover:text-edu-text disabled:opacity-50 dark:bg-white/5"
              >
                <Mic size={19} strokeWidth={2} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} />
    </div>
  );
}

export default ChatInput;
