import { useState } from 'react';
import { X, UploadCloud, FileText, Loader2, ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

export function DeliverySubmitModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [previewFiles, setPreviewFiles] = useState([]);
  const [fullFiles, setFullFiles] = useState([]);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  // Placeholder logic for R2 file upload.
  // In a real app, this would use a chunked uploader to Cloudflare R2
  // and return the uploaded fileIds.
  const handleFileChange = (e, type) => {
    const newFiles = Array.from(e.target.files).map(file => ({
      id: crypto.randomUUID(), // Mock ID until upload is complete
      name: file.name,
      file,
    }));
    
    if (type === 'preview') {
      setPreviewFiles(prev => [...prev, ...newFiles]);
    } else {
      setFullFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id, type) => {
    if (type === 'preview') {
      setPreviewFiles(prev => prev.filter(f => f.id !== id));
    } else {
      setFullFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleSubmit = async () => {
    // Note: Actually uploading to R2 should happen here before calling onSubmit.
    // Assuming file ids for now.
    const previewFileIds = previewFiles.map(f => f.id);
    const fullFileIds = fullFiles.map(f => f.id);
    
    await onSubmit({ previewFileIds, fullFileIds, note });
    onClose();
  };

  const isFormValid = previewFiles.length > 0 && fullFiles.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-edu-bg w-full sm:max-w-md rounded-t-[2rem] sm:rounded-3xl flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 relative border border-edu-border/20">
        
        {/* Header */}
        <div className="p-5 pb-4 border-b border-edu-border/30 flex items-center justify-between sticky top-0 bg-edu-bg z-10 sm:rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-edu-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-edu-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-edu-text leading-tight">Natijani yuborish</h2>
              <p className="text-[11px] text-edu-muted font-medium">Himoyalangan yetkazib berish</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-edu-surface text-edu-muted hover:text-edu-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* Info Banner */}
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-3 flex gap-3 items-start">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700/80 leading-relaxed font-medium">
              Mijoz avval sizning ishingizni <b>"Ko'rish uchun"</b> fayllar orqali tekshiradi. To'liq variant fayllari esa ular faqat baho qoldirgandan keyingina ochiladi.
            </p>
          </div>

          {/* Preview Files Upload */}
          <div className="space-y-2">
            <label className="text-xs font-black text-edu-text uppercase tracking-wider">
              👁️ Ko'rish uchun (Watermarked / Low-res)
            </label>
            <div className="border-2 border-dashed border-edu-border/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-edu-surface/30 relative hover:bg-edu-surface/60 transition-colors">
              <UploadCloud className="w-6 h-6 text-edu-muted mb-2" />
              <p className="text-[11px] font-bold text-edu-text mb-1">Ko'rish fayllarini yuklash</p>
              <p className="text-[10px] text-edu-muted max-w-[200px]">Suv belgisi tushirilgan yoki qismiy yechimni yuklang</p>
              <input 
                type="file" 
                multiple 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleFileChange(e, 'preview')}
              />
            </div>
            {/* File List */}
            {previewFiles.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {previewFiles.map(f => (
                  <div key={f.id} className="flex items-center justify-between bg-edu-surface rounded-xl p-2 px-3 border border-edu-border/30">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-[11px] font-medium text-edu-text truncate">{f.name}</span>
                    </div>
                    <button onClick={() => removeFile(f.id, 'preview')} className="p-1 hover:bg-edu-bg rounded-md">
                      <X className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full Files Upload */}
          <div className="space-y-2">
            <label className="text-xs font-black text-edu-text uppercase tracking-wider">
              🔒 To'liq fayllar (Source / High-res)
            </label>
            <div className="border-2 border-dashed border-edu-border/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-edu-surface/30 relative hover:bg-edu-surface/60 transition-colors">
              <Lock className="w-6 h-6 text-edu-muted mb-2" />
              <p className="text-[11px] font-bold text-edu-text mb-1">Asosiy fayllarni yuklash</p>
              <p className="text-[10px] text-edu-muted max-w-[200px]">Bu fayllar faqat mijoz ishni tasdiqlagandan so'ng ochiladi</p>
              <input 
                type="file" 
                multiple 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleFileChange(e, 'full')}
              />
            </div>
            {/* File List */}
            {fullFiles.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {fullFiles.map(f => (
                  <div key={f.id} className="flex items-center justify-between bg-edu-surface rounded-xl p-2 px-3 border border-edu-border/30">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-3.5 h-3.5 text-edu-primary shrink-0" />
                      <span className="text-[11px] font-medium text-edu-text truncate">{f.name}</span>
                    </div>
                    <button onClick={() => removeFile(f.id, 'full')} className="p-1 hover:bg-edu-bg rounded-md">
                      <X className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-edu-text uppercase tracking-wider">
              Mijozga izoh (Ixtiyoriy)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-edu-surface border border-edu-border/30 rounded-2xl p-3 text-sm text-edu-text focus:outline-none focus:border-edu-primary/30 min-h-[80px]"
              placeholder="Qo'shimcha ma'lumotlar..."
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 pt-4 border-t border-edu-border/30 bg-edu-bg sticky bottom-0 z-10">
          <Button
            fullWidth
            variant="primary"
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit}
            className="shadow-lg shadow-edu-primary/20"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Yuborish'
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
