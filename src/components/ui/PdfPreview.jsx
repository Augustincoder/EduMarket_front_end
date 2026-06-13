import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { hapticLight } from '../../lib/telegram';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PdfPreview = ({ file, allowDownload }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    hapticLight();
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  // Resize handler for responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setScale(0.8);
      } else {
        setScale(1.2);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`w-full h-full flex flex-col items-center pt-20 pb-4 ${!allowDownload ? 'select-none pointer-events-none' : ''}`}>
      <div className="flex-1 overflow-auto custom-scrollbar w-full flex justify-center pb-16 relative">
        <Document
          file={file.url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center gap-2 text-white/50 pt-20">
              <Loader2 className="animate-spin" size={24} />
              <span>PDF yuklanmoqda...</span>
            </div>
          }
          error={
            <div className="text-red-400 pt-20">PDF faylni yuklashda xatolik yuz berdi.</div>
          }
        >
          {numPages && (
            <div className="shadow-lg rounded-xl overflow-hidden bg-white mt-4 relative">
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={allowDownload} // Block text selection if not allowed
                renderAnnotationLayer={allowDownload}
              />
            </div>
          )}
        </Document>
      </div>

      {numPages && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-lg z-50 pointer-events-auto">
          <button 
            disabled={pageNumber <= 1} 
            onClick={previousPage}
            className="text-white/80 hover:text-white disabled:opacity-30 transition-all p-1"
          >
            <ChevronLeft size={24} />
          </button>
          <p className="text-white font-mono font-bold text-sm tracking-widest min-w-[80px] text-center">
            {pageNumber} / {numPages}
          </p>
          <button 
            disabled={pageNumber >= numPages} 
            onClick={nextPage}
            className="text-white/80 hover:text-white disabled:opacity-30 transition-all p-1"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};
