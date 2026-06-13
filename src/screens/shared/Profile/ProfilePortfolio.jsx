import { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { TextInput } from '../../../components/forms/TextInput';
import { FileUpload } from '../../../components/forms/FileUpload';
import { Briefcase, Trash2, Plus } from 'lucide-react';
import { hapticSuccess } from '../../../lib/telegram';

export function ProfilePortfolio({ me, addPortfolio, delPortfolio, handleViewFile }) {
  const [addPortfolioOpen, setAddPortfolioOpen] = useState(false);
  const [portfolioTitle, setPortfolioTitle]     = useState('');
  const [portfolioFiles, setPortfolioFiles]     = useState([]);
  const [portfolioError, setPortfolioError]     = useState('');

  const portfolioLimit = me?.isVip ? 20 : 2;

  const handleAddPortfolioSubmit = () => {
    setPortfolioError('');
    const trimmedTitle = portfolioTitle.trim();
    if (!trimmedTitle) {
      setPortfolioError("Ish nomi kiritilishi majburiy");
      return;
    }
    if (trimmedTitle.length < 5) {
      setPortfolioError("Ish nomi kamida 5 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (trimmedTitle.length > 100) {
      setPortfolioError("Ish nomi maksimal 100 ta belgi bo'lishi kerak");
      return;
    }
    if (portfolioFiles.length === 0) {
      setPortfolioError("Fayl yuklash majburiy");
      return;
    }
    addPortfolio.mutate({
      title: trimmedTitle,
      fileId: portfolioFiles[0].id
    }, {
      onSuccess: () => {
        setAddPortfolioOpen(false);
        setPortfolioTitle('');
        setPortfolioFiles([]);
      }
    });
    hapticSuccess();
  };

  return (
    <>
      <div className="space-y-2.5 mt-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-bold text-edu-text">Portfolio ishlari</p>
          <span className="text-xs font-semibold text-edu-muted">
            {me?.portfolioItems?.length ?? 0}/{portfolioLimit}
            {!me?.isVip && <span className="text-edu-vip font-bold"> (VIP: 20)</span>}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {me?.portfolioItems?.map((item) => (
            <Card 
              key={item.id} 
              className="bg-edu-surface border border-edu-border/40 relative group overflow-hidden cursor-pointer active:scale-[0.98] transition-all" 
              radius="lg"
              onClick={() => handleViewFile(item.fileId, item.title)}
            >
              <CardContent className="p-3 flex flex-col h-full justify-between">
                <div className="w-full h-20 bg-gradient-to-br from-edu-primary/5 to-edu-accent/5 rounded-xl flex items-center justify-center mb-2 border border-edu-border/30 relative">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-edu-bg flex items-center justify-center shadow-sm">
                    <Briefcase size={18} className="text-edu-primary" />
                  </div>
                </div>
                <p className="text-xs font-bold text-edu-text truncate px-0.5">{item.title}</p>
                
                <button
                  className="absolute top-2 right-2 w-6 h-6 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center active:scale-95 duration-[120ms] hover:bg-red-200 transition-colors border border-red-500/10 z-10 after:absolute after:-inset-3 after:content-['']"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Bu ishni portfoliodan o'chirmoqchimisiz?")) {
                      delPortfolio.mutate(item.id);
                    }
                  }}
                >
                  <Trash2 size={11} className="text-red-500" />
                </button>
              </CardContent>
            </Card>
          ))}
          
          {(me?.portfolioItems?.length ?? 0) < portfolioLimit && (
            <button
              onClick={() => { setPortfolioTitle(''); setPortfolioFiles([]); setPortfolioError(''); setAddPortfolioOpen(true); }}
              className="bg-edu-surface/50 border-2 border-dashed border-edu-border/60 hover:border-edu-primary/60 hover:bg-edu-primary/5 transition-all duration-300 rounded-xl flex flex-col items-center justify-center p-4 min-h-[128px] group active:scale-95 duration-[120ms]"
            >
              <div className="w-8 h-8 rounded-full bg-edu-bg group-hover:bg-edu-primary/10 flex items-center justify-center transition-all duration-300">
                <Plus size={18} className="text-edu-muted group-hover:text-edu-primary" />
              </div>
              <span className="text-xs font-bold text-edu-muted group-hover:text-edu-primary mt-2">Ish qo'shish</span>
            </button>
          )}
        </div>
      </div>

      <BottomSheet isOpen={addPortfolioOpen} onClose={() => setAddPortfolioOpen(false)} title="Portfolioga ish qo'shish" fullHeight>
        <div className="space-y-4 py-2">
          <TextInput
            label="Ish nomi (Sarlavha) *"
            placeholder="Masalan: Web-dizayn loyihasi"
            value={portfolioTitle}
            onValueChange={(v) => { setPortfolioTitle(v); setPortfolioError(''); }}
            maxLength={100}
            currentLength={portfolioTitle.length}
          />
          
          <FileUpload
            label="Ish faylini yuklang (Rasm yoki hujjat) *"
            maxFiles={1}
            value={portfolioFiles}
            onChange={(files) => { setPortfolioFiles(files); setPortfolioError(''); }}
          />

          {portfolioError && (
            <p className="text-xs font-bold text-red-500 px-1 animate-pulse">
              ⚠️ {portfolioError}
            </p>
          )}

          <Button
            fullWidth
            size="lg"
            variant="primary"
            isLoading={addPortfolio.isPending}
            onClick={handleAddPortfolioSubmit}
          >
            Portfolioga qo'shish
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
