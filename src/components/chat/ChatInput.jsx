// src/components/chat/ChatInput.jsx
import { useState, useRef } from 'react';
import { TextInput } from '../forms/TextInput';
import { Button } from '../ui/Button';
import { Paperclip, Send, X, Image, FileText } from 'lucide-react';
import { filesApi } from '../../services/api';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

export function ChatInput({ onSend, onTyping, disabled }) {
  const [text, setText]       = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleSend = () => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    onSend?.(trimmed, null);
    setText('');
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
    <div className="relative border-t border-edu-border/60 bg-edu-surface/95 backdrop-blur-xl pb-safe">
      {/* File menu */}
      {showMenu && (
        <div className="absolute bottom-full left-4 mb-2 bg-edu-surface rounded-2xl shadow-sheet border border-edu-border overflow-hidden z-10 animate-fade-up">
          <button
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-edu-bg text-sm font-medium text-edu-text"
            onClick={() => { fileRef.current.accept='image/*'; fileRef.current.click(); }}
          >
            <Image size={18} className="text-blue-500" /> Foto/Video
          </button>
          <div className="h-px bg-edu-border" />
          <button
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-edu-bg text-sm font-medium text-edu-text"
            onClick={() => { fileRef.current.accept='*'; fileRef.current.click(); }}
          >
            <FileText size={18} className="text-edu-accent" /> Fayl (PDF, PPTX...)
          </button>
          <div className="h-px bg-edu-border" />
          <button
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-edu-bg text-sm font-medium text-red-500"
            onClick={() => setShowMenu(false)}
          >
            <X size={18} /> Bekor qilish
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 px-3 py-2">
        {/* Attach button */}
        <button
          onClick={() => setShowMenu((s) => !s)}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 press-scale',
            showMenu ? 'bg-edu-primary text-white' : 'bg-edu-bg text-edu-muted'
          )}
        >
          {uploading
            ? <div className="w-4 h-4 border-2 border-edu-primary border-t-transparent rounded-full animate-spin" />
            : <Paperclip size={18} />
          }
        </button>

        {/* Text input */}
        <TextInput
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Xabar yozing..."
          disabled={disabled}
          maxLength={2000}
        />

        {/* Send button */}
        <Button
          isIconOnly
          color="primary"
          radius="full"
          size="sm"
          className="w-10 h-10 bg-edu-primary flex-shrink-0"
          isDisabled={!text?.trim() && !uploading}
          onPress={handleSend}
        >
          <Send size={16} className="text-white" />
        </Button>
      </div>

      <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />
    </div>
  );
}

export default ChatInput;
