// src/components/forms/FileUpload.jsx
import { useRef } from 'react';
import { Paperclip, X, Loader2, FileText, Image, CheckCircle2 } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_MB } from '../../lib/constants';
import { cn } from '../../lib/utils';

function FileIcon({ type }) {
  if (type?.startsWith('image/')) return <Image size={14} className="text-blue-500" />;
  return <FileText size={14} className="text-edu-accent" />;
}

export function FileUpload({ value = [], onChange, onPreview, maxFiles = 5, label }) {
  const inputRef = useRef(null);

  const {
    isUploading,
    progress,
    upload,
    removeFile
  } = useFileUpload({
    maxFiles,
    onSuccess: (uploadedFiles, allFiles) => {
      // value is managed by the parent, but we use the hook to perform the action
      onChange?.([...value, ...uploadedFiles]);
    }
  });

  const handleFiles = (e) => {
    const rawFiles = Array.from(e.target.files);
    upload(rawFiles);
  };

  const remove = (e, id) => {
    e.stopPropagation();
    // Attempt to cleanup via hook if we have the ID tracking, 
    // but parent manages the state so we just filter
    onChange?.(value.filter((f) => (f.fileId || f.id) !== id));
  };

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-semibold text-edu-text">{label}</p>}

      {/* Drop zone */}
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); !isUploading && upload(Array.from(e.dataTransfer.files)); }}
        className={cn(
          'border-2 border-dashed border-edu-border rounded-2xl p-6',
          'flex flex-col items-center gap-2 cursor-pointer',
          'transition-all duration-200 relative overflow-hidden',
          'hover:border-edu-primary/50 hover:bg-edu-primary/5',
          isUploading && 'bg-edu-primary/5 cursor-wait'
        )}
      >
        {isUploading && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-edu-primary transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        )}

        <div className="w-12 h-12 rounded-2xl bg-edu-primary/10 flex items-center justify-center">
          {isUploading
            ? <Loader2 size={22} className="text-edu-primary animate-spin" />
            : <Paperclip size={22} className="text-edu-primary" />
          }
        </div>
        <p className="text-sm font-semibold text-edu-text text-center">
          {isUploading ? `Yuklanmoqda... ${progress}%` : 'Fayl qo\'shing'}
        </p>
        <p className="text-xs text-edu-muted text-center">
          Bosing yoki sudrab tashlang · Maks {maxFiles} ta · {MAX_FILE_SIZE_MB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME_TYPES}
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {/* Uploaded files list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file) => (
            <div
              key={file.fileId || file.id}
              onClick={() => onPreview?.(file)}
              className={cn(
                "flex items-center gap-3 bg-edu-surface rounded-xl px-3 py-2.5 border border-edu-border/60 animate-in fade-in slide-in-from-left-2 transition-all",
                onPreview && "cursor-pointer hover:border-edu-primary/30 hover:bg-edu-primary/5 active:scale-[0.98]"
              )}
            >
              <FileIcon type={file.type} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-edu-text truncate">
                  {file.name}
                </p>
                {file.size && (
                  <p className="text-[9px] text-edu-muted">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <button
                  onClick={(e) => remove(e, file.fileId || file.id)}
                  className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                >
                  <X size={12} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
