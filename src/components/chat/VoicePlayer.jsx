// src/components/chat/VoicePlayer.jsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { filesApi } from '../../services/other.service';

const urlCache = new Map();

export function VoicePlayer({ fileId, isMe }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(urlCache.get(fileId) || null);
  const audioRef = useRef(null);

  const waveform = useMemo(() => {
    let seed = fileId ? fileId.length : 42;
    return Array.from({ length: 30 }).map((_, i) => {
      const h = 4 + Math.abs(Math.sin(i * 0.5) * 10) + (Math.sin(i * seed) * 4);
      return Math.max(4, Math.min(20, h));
    });
  }, [fileId]);

  useEffect(() => {
    if (url) return;
    
    let isMounted = true;
    filesApi.getUrl(fileId).then(res => {
      if (isMounted) {
        const newUrl = res.data.data.url;
        urlCache.set(fileId, newUrl);
        setUrl(newUrl);
      }
    }).catch(err => console.error(err));
    return () => { isMounted = false; };
  }, [fileId, url]);

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
    <div className="flex items-center gap-3 min-w-[220px] py-1">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={togglePlay}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0",
          isMe ? "bg-white text-edu-primary" : "bg-edu-primary text-white"
        )}
      >
        <AnimatePresence mode="popLayout">
          {isPlaying ? (
            <motion.div key="pause" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <Pause size={18} fill="currentColor" />
            </motion.div>
          ) : (
            <motion.div key="play" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <Play size={18} fill="currentColor" className="ml-0.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      <div className="flex-1 flex items-center gap-[2px] h-6 cursor-pointer" onClick={(e) => {
        // Optional: click on waveform to seek
        e.stopPropagation();
        if (!audioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = x / rect.width;
        audioRef.current.currentTime = pct * audioRef.current.duration;
      }}>
        {waveform.map((h, i) => {
          const barPct = (i / waveform.length) * 100;
          const isActive = progress >= barPct;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={{ height: isPlaying && isActive ? [`${h}px`, `${h * 1.5}px`, `${h}px`] : `${h}px` }}
              transition={{ repeat: isPlaying && isActive ? Infinity : 0, duration: 0.6, delay: i * 0.05 }}
              className={cn(
                "w-[3px] rounded-full transition-colors duration-300",
                isActive 
                  ? (isMe ? "bg-white" : "bg-edu-primary") 
                  : (isMe ? "bg-white/30" : "bg-edu-primary/20")
              )}
            />
          );
        })}
      </div>

      <span className={cn("text-[11px] font-mono font-bold tabular-nums tracking-tighter shrink-0", isMe ? "text-white/90" : "text-edu-muted")}>
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
