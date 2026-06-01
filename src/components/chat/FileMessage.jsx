// src/components/chat/FileMessage.jsx
import { FileText, Download } from 'lucide-react';
import { cn } from '../../lib/utils';

export function FileMessage({ isMe, filename = 'Fayl biriktirmasi', sizeText = 'Hujjat' }) {
  return (
    <div className="flex items-center gap-2.5 min-w-[180px]">
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
        isMe ? 'bg-white/20' : 'bg-edu-primary/10'
      )}>
        <FileText size={18} className={isMe ? 'text-white' : 'text-edu-primary'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{filename}</p>
        <p className={cn('text-[10px] mt-0.5', isMe ? 'text-white/70' : 'text-edu-muted')}>
          {sizeText}
        </p>
      </div>
      <Download size={14} className={isMe ? 'text-white/70' : 'text-edu-muted'} />
    </div>
  );
}

export default FileMessage;
