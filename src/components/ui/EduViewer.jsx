import { useState, useMemo, memo } from 'react';
import { Download, FileText, Code2, FileType, SearchPlus, SearchMinus, RotateCw } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { hapticLight } from '../../lib/telegram';

const DOC_VIEWERS = {
  GOOGLE: 'https://docs.google.com/viewer?url=',
  MICROSOFT: 'https://view.officeapps.live.com/op/view.aspx?src=',
};

/**
 * EduViewer Component
 * A premium, full-screen file viewer for images, PDFs, and Office docs.
 */
export const EduViewer = ({ 
  isOpen, 
  onClose, 
  file, // { url: string, name: string, type: string }
  title 
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);

  const viewerUrl = useMemo(() => {
    if (!file) return null;
    const fileExt = file.name?.split('.').pop()?.toLowerCase() || '';
    const isPdf = file.type === 'application/pdf' || fileExt === 'pdf';
    const isDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt);

    if (isDoc) {
      // Use Google Docs Viewer for Office files (requires public URL)
      return `${DOC_VIEWERS.GOOGLE}${encodeURIComponent(file.url)}&embedded=true`;
    }
    if (isPdf) return file.url;
    return null;
  }, [file]);

  if (!file) return null;

  const fileExt = file.name?.split('.').pop()?.toLowerCase() || '';
  const isImage = file.type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
  const isPdf = file.type === 'application/pdf' || fileExt === 'pdf';
  const isDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt);
  const isCode = ['js', 'jsx', 'ts', 'tsx', 'py', 'sql', 'html', 'css', 'json', 'md'].includes(fileExt);

  const handleDownload = () => {
    hapticLight();
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotate(r => (r + 90) % 360);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || file.name}
    >
      <div className="flex flex-col h-full min-h-[60vh] relative">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-white/5 p-2 rounded-2xl border border-black/[0.03] dark:border-white/[0.05]">
          <div className="flex items-center gap-1">
            {isImage && (
              <>
                <button onClick={handleZoomOut} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-colors"><SearchMinus size={18} /></button>
                <button onClick={handleZoomIn} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-colors"><SearchPlus size={18} /></button>
                <button onClick={handleRotate} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-colors"><RotateCw size={18} /></button>
              </>
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
              .{fileExt}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-edu-primary/10 text-edu-primary rounded-xl text-xs font-bold active:scale-95 transition-all"
            >
              <Download size={14} /> Yuklab olish
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-[24px] overflow-hidden relative min-h-[400px] flex items-center justify-center border border-black/[0.03] dark:border-white/[0.05]">
          
          {isImage ? (
            <div 
              className="transition-transform duration-300 ease-out p-4"
              style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }}
            >
              <img 
                src={file.url} 
                alt={file.name} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          ) : isPdf ? (
            <iframe 
              src={`${viewerUrl}#toolbar=0`} 
              className="w-full h-full border-none min-h-[500px]"
              title="PDF Viewer"
            />
          ) : isDoc ? (
            <iframe 
              src={viewerUrl} 
              className="w-full h-full border-none min-h-[500px]"
              title="Office Viewer"
            />
          ) : isCode ? (
            <div className="w-full h-full p-6 overflow-auto bg-[#1E1E1E] text-gray-300 font-mono text-[13px] leading-relaxed">
              <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                <Code2 size={16} className="text-blue-400" />
                <span className="text-[11px] font-bold opacity-60">KODNI KO'RISH</span>
              </div>
              <pre className="whitespace-pre-wrap break-all">
                {/* Fallback to simple text display for now since we avoid new large deps */}
                Fetching content...
              </pre>
              <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                Kod fayllarini to'liq ko'rish uchun yuklab olish tavsiya etiladi.
              </div>
            </div>
          ) : (
            <div className="text-center p-10 space-y-4">
              <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-3xl mx-auto flex items-center justify-center shadow-sm">
                <FileType size={40} className="text-edu-muted" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Ushbu fayl turi qo'llab-quvvatlanmaydi</h3>
                <p className="text-xs text-gray-500">Iltimos, uni ko'rish uchun yuklab oling.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownload} icon={<Download size={14} />}>
                Yuklab olish
              </Button>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-medium text-gray-400">
           <div className="flex items-center gap-1.5"><FileText size={12} /> {file.name}</div>
           {file.size && <div>{(file.size / 1024 / 1024).toFixed(2)} MB</div>}
        </div>
      </div>
    </Modal>
  );
};

export default memo(EduViewer);
