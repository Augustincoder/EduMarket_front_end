import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { hapticLight } from '../../lib/telegram';

export const MediaPreview = ({ file, type }) => {
  const isAudio = type === 'audio';
  const mediaRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
      setProgress((media.currentTime / media.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(media.duration);
    };

    const handleEnded = () => setIsPlaying(false);

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    hapticLight();
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    hapticLight();
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e) => {
    if (mediaRef.current) {
      const seekTime = (e.target.value / 100) * duration;
      mediaRef.current.currentTime = seekTime;
      setProgress(e.target.value);
    }
  };

  const toggleFullscreen = () => {
    if (mediaRef.current && !isAudio) {
      if (mediaRef.current.requestFullscreen) {
        mediaRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6">
      <div className={`relative flex flex-col items-center overflow-hidden bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-lg ${isAudio ? 'w-full max-w-md p-8' : 'w-full max-w-4xl'}`}>
        
        {isAudio ? (
          <div className="w-32 h-32 mb-8 bg-gradient-to-tr from-edu-primary to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)] animate-pulse-slow">
            <Volume2 size={48} className="text-white drop-shadow-md" />
          </div>
        ) : (
          <video
            ref={mediaRef}
            src={file.url}
            className="w-full max-h-[70vh] object-contain rounded-t-xl"
            onClick={togglePlay}
          />
        )}
        
        {isAudio && (
          <audio ref={mediaRef} src={file.url} className="hidden" />
        )}

        {/* Custom Controls */}
        <div className={`w-full ${isAudio ? '' : 'p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0'}`}>
          <div className="flex flex-col gap-3">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-white/60">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={progress || 0}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-edu-primary"
              />
              <span className="text-[10px] font-mono text-white/60">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <button onClick={togglePlay} className="p-3 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-transform">
                {isPlaying ? <Pause size={20} className="fill-black" /> : <Play size={20} className="fill-black ml-0.5" />}
              </button>

              <div className="flex items-center gap-4">
                <button onClick={toggleMute} className="p-2 text-white/80 hover:text-white transition-colors">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                {!isAudio && (
                  <button onClick={toggleFullscreen} className="p-2 text-white/80 hover:text-white transition-colors">
                    <Maximize size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
