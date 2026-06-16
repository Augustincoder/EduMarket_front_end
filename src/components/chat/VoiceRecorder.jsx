// src/components/chat/VoiceRecorder.jsx
import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { hapticMedium, hapticSuccess } from '../../lib/telegram';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function VoiceRecorder({ onSend, onCancel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      hapticMedium();

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
      toast.error("Mikrofonga ruxsat berilmadi");
      onCancel();
    }
  };

  const stopTracks = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const stopAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      const mimeType = mediaRecorderRef.current.mimeType;
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        onSend(audioBlob);
        hapticSuccess();
        stopTracks();
      };
      mediaRecorderRef.current.stop();
      cleanup();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = () => {
        stopTracks();
      };
      mediaRecorderRef.current.stop();
      cleanup();
      onCancel();
    } else {
      onCancel();
    }
  };

  const cleanup = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatDuration = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startRecording();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isRecording) {
    return (
      <div className="flex-1 flex items-center gap-3 bg-black/5 dark:bg-white/5 rounded-xl px-4 py-2.5 animate-pulse text-xs text-edu-muted font-bold">
        <div className="w-1.5 h-1.5 rounded-full bg-edu-primary animate-ping shrink-0" />
        <span>Mikrofon faollashtirilmoqda...</span>
        <div className="flex-1" />
        <button onClick={cancelRecording} className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center gap-3 bg-edu-primary/10 rounded-xl px-3 py-1 animate-fade-in">
      <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
        <motion.div 
          animate={{ scale: [1, 3], opacity: [0.6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          className="absolute w-2 h-2 bg-red-500 rounded-full"
        />
        <div className="w-2 h-2 rounded-full bg-red-500 relative z-10" />
      </div>
      <span className="text-[13px] font-mono font-bold text-edu-primary tabular-nums shrink-0">{formatDuration(duration)}</span>
      
      {/* Acoustic wave simulator */}
      <div className="flex items-center justify-center gap-[3px] mx-2 h-6 flex-1 opacity-80 overflow-hidden">
        {[10, 16, 12, 20, 14, 22, 12, 18, 10, 16, 12].map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: ["4px", `${h}px`, "4px"] }}
            transition={{
              duration: 0.5 + (i % 3) * 0.1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.05
            }}
            className="w-[3px] bg-edu-primary rounded-full"
          />
        ))}
      </div>

      <button onClick={cancelRecording} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0 outline-none">
        <X size={18} />
      </button>
      
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={stopAndSend} 
        className="w-8 h-8 rounded-full bg-edu-primary flex items-center justify-center text-white shadow-sm transition-colors relative outline-none shrink-0"
      >
        <Send size={14} />
      </motion.button>
    </div>
  );
}
