// src/components/forms/FileUpload.jsx
import { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Paperclip, X, Loader2, FileText, Image } from 'lucide-react';
import { filesApi } from '../../services/other.service';
import { BLOCKED_EXTENSIONS, MAX_FILE_SIZE_MB, ACCEPTED_MIME_TYPES } from '../../lib/constants';
import toast from 'react-hot-toast';

function FileIcon({ type }) {
  if (type?.startsWith('image/')) return <Image size={14} className="text-blue-500" />;
  return <FileText size={14} className="text-edu-accent" />;
}

export function FileUpload({ value = [], onChange, maxFiles = 5, label }) {
  const [uploading, setUploading] = useState({});
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    const arr = Array.from(files);

    if (value.length + arr.length > maxFiles) {
      toast.error(`Maksimal ${maxFiles} ta fayl yuklash mumkin`);
      return;
    }

    for (const file of arr) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (BLOCKED_EXTENSIONS.includes(ext)) {
        toast.error(`${ext} kengaytmali fayllar taqiqlangan`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`Fayl hajmi ${MAX_FILE_SIZE_MB}MB dan oshmasligi kerak`);
        continue;
      }

      const tempId = `${file.name}_${Date.now()}`;
      setUploading((u) => ({ ...u, [tempId]: 0 }));

      try {
        const fd = new FormData();
        fd.append('files', file);

        const res = await filesApi.upload(fd, (pct) => {
          setUploading((u) => ({ ...u, [tempId]: pct }));
        });

        const fileId = res.data.data.fileIds[0];
        onChange?.([...value, { id: fileId, name: file.name, type: file.type, size: file.size }]);
      } catch (err) {
        toast.error(err.serverMsg || 'Fayl yuklashda xato');
      } finally {
        setUploading((u) => { const n = { ...u }; delete n[tempId]; return n; });
      }
    }
  };

  const remove = (id) => onChange?.(value.filter((f) => f.id !== id));

  const isUploading = Object.keys(uploading).length > 0;

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-semibold text-edu-text">{label}</p>}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className={[
          'border-2 border-dashed border-edu-border rounded-2xl p-6',
          'flex flex-col items-center gap-2 cursor-pointer',
          'transition-all duration-200',
          'hover:border-edu-primary/50 hover:bg-edu-primary/5',
          isUploading && 'opacity-60 pointer-events-none',
        ].filter(Boolean).join(' ')}
      >
        <div className="w-12 h-12 rounded-2xl bg-edu-primary/10 flex items-center justify-center">
          {isUploading
            ? <Loader2 size={22} className="text-edu-primary animate-spin" />
            : <Paperclip size={22} className="text-edu-primary" />
          }
        </div>
        <p className="text-sm font-semibold text-edu-text">
          {isUploading ? 'Yuklanmoqda...' : 'Fayl qo\'shing'}
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
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Uploaded files list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 bg-edu-surface rounded-xl px-3 py-2.5 border border-edu-border/60"
            >
              <FileIcon type={file.type} />
              <span className="flex-1 text-xs font-medium text-edu-text truncate">
                {file.name}
              </span>
              <button
                onClick={() => remove(file.id)}
                className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 press-scale"
              >
                <X size={10} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
