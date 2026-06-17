// src/components/chat/ChatInput.jsx
// iOS Telegram-style minimalist glass input — Design Spells ✨
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Paperclip, Send, X, Image as ImageIcon, FileText,
  Check, Mic, Lock, File, CornerDownRight, Edit2
} from 'lucide-react';
import { filesApi } from '../../services/other.service';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { hapticLight, hapticSuccess } from '../../lib/telegram';
import { VoiceRecorder } from './VoiceRecorder';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Attach Menu Item ──────────────────────────────────────────────────────────
function AttachItem({ icon: Icon, label, color, bg, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 text-left active:bg-black/5 dark:active:bg-white/5 transition-colors"
    >
      <span className={cn('w-9 h-9 rounded-2xl flex items-center justify-center shrink-0', bg)}>
        <Icon size={18} className={color} />
      </span>
      <span className="text-[15px] font-semibold text-edu-text">{label}</span>
    </motion.button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ChatInput({ onSend, onTyping, disabled, replyingTo, editingMessage, onCancelAction }) {
  const [text, setText]             = useState('');
  const [showMenu, setShowMenu]     = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSending, setIsSending]   = useState(false);
  const [pendingFile, setPendingFile]           = useState(null);
  const [pendingFilePreview, setPendingFilePreview] = useState(null);
  const [isSelectingSecureFile, setIsSelectingSecureFile] = useState(false);

  const fileRef     = useRef(null);
  const textareaRef = useRef(null);

  // ── Sync with edit mode ───────────────────────────────────────────────────
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content || '');
      setTimeout(() => textareaRef.current?.focus(), 50);
    } else if (!replyingTo) {
      // don't clear if we're just replying
    }
  }, [editingMessage]);

  // Auto-grow textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const trimmed = text?.trim() || '';
    if (!trimmed && !pendingFile) return;

    // 🪄 Design Spell: recoil spring on send
    setIsSending(true);
    setTimeout(() => setIsSending(false), 200);
    hapticSuccess();

    if (pendingFile) {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('files', pendingFile);
        const res = await filesApi.upload(fd);
        const fileId = res.data.data.fileIds[0];
        let fileType = 'document';
        if (pendingFile.type.startsWith('image/'))  fileType = 'photo';
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
        if (!editingMessage) { setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }
      }
    } else {
      onSend?.(trimmed, null);
      if (!editingMessage) { setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }
    }
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleChange = (val) => {
    setText(val);
    onTyping?.();
    adjustHeight();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowMenu(false);
    setPendingFile(file);
    setPendingFilePreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    e.target.value = '';
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleCancelFile = () => {
    setPendingFile(null);
    if (pendingFilePreview) URL.revokeObjectURL(pendingFilePreview);
    setPendingFilePreview(null);
    setIsSelectingSecureFile(false);
  };

  const hasContent = !!(text.trim() || editingMessage || pendingFile);

  // ── VoiceRecorder mode ────────────────────────────────────────────────────
  if (isVoiceMode) {
    return (
      <div className="px-2 pb-1">
        <VoiceRecorder onSend={handleVoiceSend} onCancel={() => setIsVoiceMode(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* ── Attach Menu (popup above input) ────────────────────── */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90]"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="absolute bottom-[calc(100%+8px)] left-2 z-[100] w-[220px] rounded-2xl overflow-hidden bg-edu-surface/90 backdrop-blur-2xl border border-edu-border/60 shadow-[0_16px_48px_rgba(0,0,0,0.18)]"
            >
              {/* glass shimmer */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />
              <AttachItem
                icon={ImageIcon} label="Foto / Video"
                color="text-blue-500" bg="bg-blue-500/10"
                onClick={() => { setIsSelectingSecureFile(false); fileRef.current.accept = 'image/*,video/*'; fileRef.current.click(); }}
              />
              <div className="h-px bg-edu-border/50 mx-4" />
              <AttachItem
                icon={FileText} label="Fayl (Hujjat)"
                color="text-indigo-500" bg="bg-indigo-500/10"
                onClick={() => { setIsSelectingSecureFile(false); fileRef.current.accept = '*'; fileRef.current.click(); }}
              />
              <div className="h-px bg-edu-border/50 mx-4" />
              <AttachItem
                icon={Lock} label="Himoyalangan fayl"
                color="text-red-500" bg="bg-red-500/10"
                onClick={() => { setIsSelectingSecureFile(true); fileRef.current.accept = '*'; fileRef.current.click(); }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Reply / Edit banner ─────────────────────────────────── */}
      <AnimatePresence>
        {(replyingTo || editingMessage) && !pendingFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-4 py-2 border-b border-edu-border/30">
              {/* accent stripe */}
              <div className={cn('w-1 h-9 rounded-full shrink-0', replyingTo ? 'bg-edu-primary' : 'bg-blue-500')} />
              <div className="flex-1 min-w-0">
                <div className={cn('text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5', replyingTo ? 'text-edu-primary' : 'text-blue-500')}>
                  {replyingTo ? <><CornerDownRight size={11} />{replyingTo.sender?.fullname || 'Javob'}</> : <><Edit2 size={11} />Tahrirlash</>}
                </div>
                <div className="text-[13px] text-edu-text/70 truncate font-medium">
                  {replyingTo ? (replyingTo.content || 'Biriktirma') : editingMessage?.content}
                </div>
              </div>
              <button
                onClick={onCancelAction}
                className="w-7 h-7 rounded-full bg-edu-muted/10 flex items-center justify-center text-edu-muted hover:text-edu-text active:scale-90 transition-all shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── File Preview banner ──────────────────────────────────── */}
      <AnimatePresence>
        {pendingFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-edu-border/30">
              {pendingFilePreview ? (
                <img src={pendingFilePreview} alt="preview" className="w-10 h-10 rounded-xl object-cover border border-black/10 shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <File size={20} className="text-blue-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-edu-text truncate flex items-center gap-1.5">
                  {isSelectingSecureFile && <Lock size={11} className="text-red-500 shrink-0" />}
                  {pendingFile.name}
                </div>
                <div className="text-[11px] text-edu-muted font-medium">
                  {(pendingFile.size / 1024 / 1024).toFixed(2)} MB{isSelectingSecureFile ? ' · Himoyalangan' : ''}
                </div>
              </div>
              <button
                onClick={handleCancelFile}
                disabled={uploading}
                className="w-7 h-7 rounded-full bg-edu-muted/10 flex items-center justify-center text-edu-muted hover:text-edu-text active:scale-90 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Input Row ───────────────────────────────────────── */}
      {/* 🪄 Design Spell: spring recoil on send */}
      <motion.div
        animate={isSending ? { y: 3, scale: 0.982 } : { y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 700, damping: 18 }}
        className="flex items-end gap-2 px-2 py-2"
      >
        {/* Attach button */}
        <motion.button
          whileTap={{ scale: 0.88, rotate: showMenu ? 0 : 45 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          aria-label="Biriktirish"
          onClick={() => { hapticLight(); setShowMenu(s => !s); }}
          disabled={!!editingMessage || uploading}
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200',
            showMenu
              ? 'bg-edu-primary text-white shadow-[0_4px_12px_rgba(var(--color-primary-rgb,99,102,241),0.4)]'
              : 'text-edu-muted hover:text-edu-text'
          )}
        >
          {uploading
            ? <div className="w-4 h-4 border-2 border-edu-primary border-t-transparent rounded-full animate-spin" />
            : <Paperclip size={19} strokeWidth={2.2} className={cn('transition-transform duration-200', showMenu && 'rotate-45')} />
          }
        </motion.button>

        {/* Textarea pill */}
        <div className={cn(
          'flex-1 flex items-end rounded-[22px] px-4 py-[9px] min-h-[42px]',
          'bg-edu-surface/90 border border-edu-border/60',
          'transition-all duration-200',
          'focus-within:border-edu-primary/50 focus-within:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb,99,102,241),0.1)]',
        )}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingFile ? 'Izoh yozing...' : 'Xabar...'}
            disabled={disabled || uploading}
            rows={1}
            className="flex-1 bg-transparent border-none text-[15px] font-medium text-edu-text placeholder:text-edu-muted/60 focus:outline-none focus:ring-0 resize-none overflow-hidden leading-[1.45] max-h-[120px] py-0"
            style={{ height: '24px' }}
          />
        </div>

        {/* Send / Mic button */}
        <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {hasContent ? (
              <motion.button
                key="send"
                initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.4, rotate: 30 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                aria-label={editingMessage ? 'Saqlash' : 'Yuborish'}
                disabled={uploading}
                onClick={handleSend}
                className="w-9 h-9 rounded-full bg-edu-primary text-white flex items-center justify-center shadow-[0_4px_14px_rgba(var(--color-primary-rgb,99,102,241),0.45)] active:scale-90 transition-transform"
              >
                {editingMessage
                  ? <Check size={17} strokeWidth={2.5} />
                  : <Send size={16} strokeWidth={2.2} className="translate-x-[1px]" />
                }
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                initial={{ opacity: 0, scale: 0.5, rotate: 30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.4, rotate: -30 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                aria-label="Ovozli xabar"
                disabled={uploading}
                onClick={() => { hapticLight(); setIsVoiceMode(true); }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-edu-muted hover:text-edu-text active:scale-90 transition-all"
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
