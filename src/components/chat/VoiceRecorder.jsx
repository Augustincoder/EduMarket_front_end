// src/components/chat/VoiceRecorder.jsx
import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { hapticMedium, hapticSuccess } from '../../lib/telegram';
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
  }, []);

  if (!isRecording) {
    return (
      <div className="flex-1 flex items-center gap-3 bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-2.5 animate-pulse text-xs text-edu-muted font-bold">
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
    <div className="flex-1 flex items-center gap-3 bg-edu-primary/10 rounded-2xl px-3 py-1 animate-fade-in">
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-sm font-mono font-bold text-edu-primary">{formatDuration(duration)}</span>
      
      <div className="flex-1" />

      <button onClick={cancelRecording} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
        <X size={18} />
      </button>
      
      <button onClick={stopAndSend} className="w-8 h-8 rounded-full bg-edu-primary flex items-center justify-center text-white shadow-sm transition-all active:scale-90">
        <Send size={14} />
      </button>
    </div>
  );
}
