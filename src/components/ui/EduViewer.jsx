import { useState, useRef, useEffect } from 'react';
import { fileApi } from '../../services/file.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertTriangle, Download, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { hapticImpact } from '../../lib/telegram';

export default function EduViewer({ fileId, fileName, mimeType, isPaid, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHolding, setIsHolding] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  const isImage = mimeType?.startsWith('image/');
  const isText = mimeType?.startsWith('text/') || mimeType === 'application/json';

  // 1. Fetch Secure Token and Stream File
  useEffect(() => {
    let objectUrl = null;

    const loadSecureFile = async () => {
      try {
        setIsLoading(true);

        if (isPaid) {
          // If paid, just get the normal URL
          const res = await fileApi.getFileUrl(fileId);
          setFileUrl(res.data.data.url);
          setIsLoading(false);
          return;
        }

        // 1. Get 60s Token
        const tokenRes = await fileApi.getSecureToken(fileId);
        const token = tokenRes.data.data.token;

        // 2. Stream File Binary
        const streamRes = await fileApi.streamSecureFile(token);
        
        // 3. Create Blob URL
        const blob = new Blob([streamRes.data], { type: mimeType });
        objectUrl = URL.createObjectURL(blob);
        setFileUrl(objectUrl);
        
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Faylni yuklashda xatolik. Limit tugagan bo'lishi mumkin.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSecureFile();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId, isPaid, mimeType]);

  // 2. Block Right-Click and Copy
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (!isPaid) {
        e.preventDefault();
        toast.error('Saqlash taqiqlangan!');
      }
    };
    
    const handleCopy = (e) => {
      if (!isPaid) {
        e.preventDefault();
        e.clipboardData.setData('text/plain', "⚠️ Ushbu ish uchun hali to'lov qilinmagan (EduMarket). Uni o'g'irlab universitetga topshirish mumkin emas!");
        toast.error("Nusxa ko'chirish taqiqlangan!");
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, [isPaid]);

  // 3. Render Canvas with Visible Watermarks for Images
  useEffect(() => {
    if (!fileUrl || !isImage || isLoading || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);

      if (!isPaid) {
        // Add Heavy Visible Watermarks making it unusable for submission
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; // Red-ish semi-transparent
        ctx.font = `bold ${Math.max(20, img.width / 15)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Diagonal repeating watermark
        ctx.rotate(-Math.PI / 4);
        for (let x = -img.width; x < img.width * 2; x += img.width / 2) {
          for (let y = -img.height; y < img.height * 2; y += img.height / 4) {
            ctx.fillText("TO'LANMAGAN - EDUMARKET", x, y);
          }
        }
        ctx.rotate(Math.PI / 4); // reset
        
        // Big center text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, img.height / 2 - 50, img.width, 100);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(30, img.width / 10)}px sans-serif`;
        ctx.fillText("NAMUNA (PREVIEW)", img.width / 2, img.height / 2);
      }
    };
    img.src = fileUrl;

  }, [fileUrl, isImage, isLoading, isPaid]);

  // 4. Glitch Effect CSS for Text/PDF wrappers
  const glitchStyle = !isPaid && !isHolding ? { filter: 'blur(15px) grayscale(100%)' } : {};

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white active-spring">
            ✕
          </button>
          <div className="text-white">
            <h3 className="font-bold text-sm max-w-[200px] truncate">{fileName}</h3>
            <p className="text-xs text-white/50">{isPaid ? "To'liq ruxsat" : "Himoyalangan namuna"}</p>
          </div>
        </div>
        
        {isPaid && (
          <a href={fileUrl} download={fileName} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-edu-primary rounded-xl text-white font-bold text-sm active-spring">
            <Download size={16} />
            Yuklash
          </a>
        )}
      </div>

      {/* Main Viewer Area */}
      <div className="flex-1 overflow-auto relative flex items-center justify-center p-4">
        {isLoading ? (
          <div className="flex flex-col items-center text-white/50">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-sm">Xavfsiz ulanish o'rnatilmoqda...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-red-400 bg-red-400/10 p-6 rounded-3xl max-w-sm text-center border border-red-500/20">
            <AlertTriangle size={48} className="mb-4 text-red-500" />
            <p className="font-bold text-lg mb-2">Ruxsat etilmadi</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center transition-all duration-300"
            style={glitchStyle}
          >
            {!isPaid && !isHolding && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                <Lock size={64} className="text-white/20 mb-4" />
                <h2 className="text-2xl font-black text-white/40 tracking-widest uppercase text-center">Bosib turing</h2>
              </div>
            )}

            {isImage ? (
              <canvas ref={canvasRef} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
            ) : isText ? (
              <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-2xl whitespace-pre-wrap font-mono text-sm overflow-auto max-h-full relative select-none">
                {!isPaid && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-10 space-y-10 overflow-hidden">
                     {Array.from({length: 10}).map((_, i) => (
                       <h1 key={i} className="text-6xl font-black text-red-600 -rotate-12 whitespace-nowrap">TO'LANMAGAN PREVIEW</h1>
                     ))}
                  </div>
                )}
                {/* Normally we'd render text directly, but for secure preview we might just render an iframe or text block */}
                <iframe src={fileUrl} className="w-full h-[80vh] border-0" title="Secure Document" />
              </div>
            ) : (
              <div className="w-full max-w-4xl h-full bg-white rounded-xl overflow-hidden relative select-none">
                 {!isPaid && (
                  <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center opacity-20 space-y-10 bg-white/50 backdrop-blur-[2px]">
                     {Array.from({length: 5}).map((_, i) => (
                       <h1 key={i} className="text-8xl font-black text-red-600 -rotate-45 whitespace-nowrap drop-shadow-lg">EDUMARKET</h1>
                     ))}
                  </div>
                )}
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full border-0" title="Secure PDF" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hold-to-View Action Bar for Unpaid Files */}
      {!isPaid && !isLoading && !error && (
        <div className="p-6 pb-10 bg-gradient-to-t from-black to-transparent flex flex-col items-center justify-end absolute bottom-0 left-0 right-0 z-50">
          <AnimatePresence>
            {!isHolding && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-4 text-center"
              >
                <p className="text-white/90 text-sm font-bold bg-black/50 px-4 py-1 rounded-full inline-block backdrop-blur-md">Ko'rish uchun tugmani bosib turing</p>
                <p className="text-red-400 text-xs mt-2 drop-shadow-md font-medium">Skrinshot qilish qat'iyan man etiladi!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onPointerDown={(e) => {
              e.preventDefault();
              hapticImpact('heavy');
              setIsHolding(true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              hapticImpact('light');
              setIsHolding(false);
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              setIsHolding(false);
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.5)] border-4 touch-none cursor-pointer",
              isHolding 
                ? "bg-edu-primary border-edu-primary/50 shadow-[0_0_60px_rgba(79,70,229,0.5)] scale-110" 
                : "bg-white/10 border-white/20"
            )}
          >
            {isHolding ? (
              <EyeOff size={32} className="text-white animate-pulse" />
            ) : (
              <Lock size={32} className="text-white/80" />
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
}
