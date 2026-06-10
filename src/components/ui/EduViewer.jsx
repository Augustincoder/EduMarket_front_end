import { useState, useMemo, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, FileType, ZoomIn, ZoomOut, RotateCw, X, Info } from 'lucide-react';
import { createPortal } from 'react-dom';
import { hapticLight } from '../../lib/telegram';
import { CodePreview } from './CodePreview';
import { MediaPreview } from './MediaPreview';

const DOC_VIEWERS = {
  GOOGLE: 'https://docs.google.com/viewer?url=',
};

/**
 * EduViewer God-Tier Component
 * An immersive, full-screen file viewer with gesture support and advanced rendering.
 */
export const EduViewer = ({ 
  isOpen, 
  onClose, 
  file, 
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  // Auto-hide toolbar logic
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      setShowToolbar(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!isDragging) setShowToolbar(false);
      }, 3000);
    };

    if (isOpen) {
      resetTimer();
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('touchstart', resetTimer);
      window.addEventListener('keydown', resetTimer);
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [isOpen, isDragging]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const viewerUrl = useMemo(() => {
    if (!file) return null;
    const fileExt = file.name?.split('.').pop()?.toLowerCase() || '';
    const isDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt);

    if (isDoc) {
      return `${DOC_VIEWERS.GOOGLE}${encodeURIComponent(file.url)}&embedded=true`;
    }
    return file.url;
  }, [file]);

  if (!isOpen || !file) return null;

  const fileExt = file.name?.split('.').pop()?.toLowerCase() || '';
  const isImage = file.type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
  const isPdf = file.type === 'application/pdf' || fileExt === 'pdf';
  const isDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt);
  const isCode = ['js', 'jsx', 'ts', 'tsx', 'py', 'sql', 'html', 'css', 'json', 'md', 'txt'].includes(fileExt);
  const isVideo = file.type?.startsWith('video/') || ['mp4', 'webm', 'ogg'].includes(fileExt);
  const isAudio = file.type?.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(fileExt);

  const handleDownload = () => {
    hapticLight();
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 4));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.5, 0.5));
  const handleRotate = () => setRotate(r => (r + 90) % 360);

  const renderContent = () => {
    if (isImage) {
      return (
        <motion.div 
          className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing p-4 md:p-12"
          drag={zoom > 1}
          dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          onDoubleClick={() => setZoom(z => z > 1 ? 1 : 2)}
        >
          <motion.img 
            src={file.url} 
            alt={file.name} 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl pointer-events-none"
            animate={{ scale: zoom, rotate }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </motion.div>
      );
    }
    
    if (isCode) {
      return (
        <div className="w-full h-full p-4 md:p-12 max-w-6xl mx-auto flex flex-col justify-center">
          <CodePreview file={file} />
        </div>
      );
    }

    if (isVideo || isAudio) {
      return <MediaPreview file={file} type={isVideo ? 'video' : 'audio'} />;
    }

    if (isPdf) {
      return (
        <div className="w-full h-full p-4 md:p-12 pt-20">
          <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
             <iframe src={`${viewerUrl}#toolbar=0`} className="w-full h-full border-none" title="PDF Viewer" />
          </div>
        </div>
      );
    }

    if (isDoc) {
      return (
        <div className="w-full h-full p-4 md:p-12 pt-20">
          <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
             <iframe src={viewerUrl} className="w-full h-full border-none" title="Office Viewer" />
          </div>
        </div>
      );
    }

    // Unsupported fallback
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-white space-y-6">
        <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border border-white/10">
          <FileType size={64} className="text-white/80" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">Qo'llab-quvvatlanmaydigan format</h3>
          <p className="text-white/60 text-sm max-w-sm">
            Iltimos, ushbu faylni ko'rish yoki ochish uchun qurilmangizga yuklab oling.
          </p>
        </div>
        <button 
          onClick={handleDownload}
          className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
        >
          <Download size={18} /> Yuklab olish
        </button>
      </div>
    );
  };

  const overlayContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Top Header */}
          <motion.div 
            className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent"
            initial={{ y: -100 }}
            animate={{ y: showToolbar ? 0 : -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-105 active:scale-95"
              >
                <X size={20} />
              </button>
              <div className="hidden md:flex flex-col">
                <span className="text-white font-semibold tracking-tight text-sm md:text-base">{file.name}</span>
                <span className="text-white/50 text-[10px] md:text-xs font-mono uppercase tracking-widest">{fileExt}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className={`p-3 backdrop-blur-md rounded-full text-white transition-all hover:scale-105 active:scale-95 ${showInfo ? 'bg-edu-primary' : 'bg-white/10 hover:bg-white/20'}`}
              >
                <Info size={20} />
              </button>
              <button 
                onClick={handleDownload}
                className="px-4 py-2.5 bg-edu-primary text-white rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
              >
                <Download size={16} /> <span className="hidden md:inline">Yuklab olish</span>
              </button>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
            {renderContent()}
          </div>

          {/* Bottom Toolbar (Images only for now) */}
          {isImage && (
            <motion.div 
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl z-50 shadow-2xl"
              initial={{ y: 100, x: "-50%" }}
              animate={{ y: showToolbar ? 0 : 100, x: "-50%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button onClick={handleZoomOut} className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"><ZoomOut size={20} /></button>
              <div className="w-px h-6 bg-white/20 mx-1" />
              <button onClick={handleZoomIn} className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"><ZoomIn size={20} /></button>
              <div className="w-px h-6 bg-white/20 mx-1" />
              <button onClick={handleRotate} className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"><RotateCw size={20} /></button>
            </motion.div>
          )}

          {/* Sidebar Info Panel */}
          <AnimatePresence>
            {showInfo && (
              <motion.div 
                className="absolute right-0 top-0 bottom-0 w-80 bg-black/80 backdrop-blur-3xl border-l border-white/10 z-[60] p-6 shadow-2xl"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-white font-bold text-lg">Fayl ma'lumotlari</h3>
                  <button aria-label="Yopish" onClick={() => setShowInfo(false)} className="w-11 h-11 flex items-center justify-center text-white/50 hover:text-white rounded-full hover:bg-white/10"><X size={18} /></button>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-center">
                     <FileText size={48} className="text-white/40" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Nomi</div>
                      <div className="text-white text-sm break-all">{file.name}</div>
                    </div>
                    {file.size && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Hajmi</div>
                        <div className="text-white text-sm font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Turi</div>
                      <div className="text-white text-sm">{file.type || fileExt.toUpperCase()}</div>
                    </div>
                    {file.createdAt && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Yuklangan vaqti</div>
                        <div className="text-white text-sm">{new Date(file.createdAt).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );

  // Portal to body so it escapes all parent containers
  return typeof document !== 'undefined' ? createPortal(overlayContent, document.body) : null;
};

export default memo(EduViewer);
