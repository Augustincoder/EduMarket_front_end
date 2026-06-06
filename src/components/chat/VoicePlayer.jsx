// src/components/chat/VoicePlayer.jsx
import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '../../lib/utils';
import { filesApi } from '../../services/other.service';

export function VoicePlayer({ fileId, isMe }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    filesApi.getUrl(fileId).then(res => {
      if (isMounted) setUrl(res.data.data.url);
    }).catch(err => console.error(err));
    return () => { isMounted = false; };
  }, [fileId]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(pct);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const onEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  if (!url) return <div className="w-48 h-10 animate-pulse bg-black/5 dark:bg-white/5 rounded-xl" />;

  return (
    <div className="flex items-center gap-3 min-w-[200px] py-1">
      <button
        onClick={togglePlay}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90",
          isMe ? "bg-white text-edu-primary" : "bg-edu-primary text-white"
        )}
      >
        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
      </button>
      
      <div className="flex-1 h-1 bg-black/10 dark:bg-white/20 rounded-full relative overflow-hidden">
        <div 
          className={cn("h-full absolute left-0 top-0 transition-all duration-100", isMe ? "bg-white" : "bg-edu-primary")} 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <span className={cn("text-[10px] font-mono", isMe ? "text-white/80" : "text-edu-muted")}>
        {duration ? `${Math.floor(duration/60)}:${Math.floor(duration%60).toString().padStart(2,'0')}` : '0:00'}
      </span>

      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        className="hidden"
      />
    </div>
  );
}
