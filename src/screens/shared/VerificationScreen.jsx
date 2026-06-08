import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageLayout } from '../../components/layout/PageLayout';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { FileUpload } from '../../components/forms/FileUpload';
import { verificationApi } from '../../services/verification.service';
import { filesApi } from '../../services/other.service';
import { useAuth } from '../../hooks/useAuth';
import { hapticSuccess, hapticError, hapticLight } from '../../lib/telegram';
import { CheckCircle2, ShieldCheck, AlertCircle, Info, Camera, FileText, ChevronRight, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import EduViewer from '../../components/ui/EduViewer';
import toast from 'react-hot-toast';

const DOC_TYPES = [
  { value: 'PASSPORT', label: 'Pasport / ID karta' },
  { value: 'STUDENT_ID', label: 'Talabalik guvohnomasi' },
  { value: 'DRIVER_LICENSE', label: 'Haydovchilik guvohnomasi' },
];

export default function VerificationScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [docType, setDocType] = useState('STUDENT_ID');
  const [docFiles, setDocFiles] = useState([]);
  const [selfieFiles, setSelfieFiles] = useState([]);
  const [error, setError] = useState('');
  const [viewerFile, setViewerFile] = useState(null);

  const { data: status, isLoading: statusLoading, isError: statusError, error: queryError, refetch } = useQuery({
    queryKey: ['verification-status'],
    queryFn: () => verificationApi.getMyStatus().then(res => res.data.data),
    retry: 1,
  });

  // Sync global user state if status changed to APPROVED
  useEffect(() => {
    if (status?.status === 'APPROVED' && user?.verificationStatus !== 'APPROVED') {
      refreshUser();
    }
  }, [status, user, refreshUser]);

  const handleViewFile = (file) => {
    if (!file) return;
    hapticLight();
    // For local preview before submit, we might not have a signed URL yet, 
    // but the file object should have a local URL from the upload hook or we can create one.
    // Actually our useFileUpload hook returns { fileId, name, size, type } and the file.controller returns objectKey.
    // We need a URL to view. If it's just uploaded, we can get a public URL if it's an image.
    // For simplicity, let's assume we fetch a temporary URL if needed, but for images we can use getPublicUrl.
    const publicUrl = filesApi.getPublicUrl(file.fileId || file.id);
    if (publicUrl) {
      setViewerFile({ url: publicUrl, name: file.name, type: file.type });
    } else {
      // Fetch signed URL
      filesApi.getUrl(file.fileId || file.id).then(res => {
        setViewerFile({ url: res.data.data.url, name: file.name, type: file.type });
      });
    }
  };

  const currentStatus = status?.status || user?.verificationStatus;

  const submit = useMutation({
    mutationFn: (data) => verificationApi.submit(data),
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['verification-status'] });
      const previousStatus = queryClient.getQueryData(['verification-status']);
      queryClient.setQueryData(['verification-status'], { status: 'PENDING' });
      return { previousStatus };
    },
    onError: (err, _newData, context) => {
      hapticError();
      // Rollback to previous state if error occurs
      queryClient.setQueryData(['verification-status'], context.previousStatus);
      const msg = err.response?.data?.message || 'Server bilan bog\'lanishda xatolik (404/500)';
      toast.error(msg);
    },
    onSuccess: () => {
      hapticSuccess();
      toast.success('So\'rov yuborildi!');
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
    }
  });

  const handleNext = () => {
    if (step === 2 && !docType) return setError('Hujjat turini tanlang');
    if (step === 3 && docFiles.length === 0) return setError('Hujjat rasmini yuklang');
    if (step === 4 && selfieFiles.length === 0) return setError('Selfie rasmini yuklang');
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = () => {
    submit.mutate({
      documentType: docType,
      documentFileId: docFiles[0].id,
      selfieFileId: selfieFiles[0].id
    });
  };

  if (statusLoading) return <PageLayout><div className="p-20 text-center flex flex-col items-center gap-4"><RefreshCcw className="animate-spin text-edu-primary" /> <span>Yuklanmoqda...</span></div></PageLayout>;

  if (statusError) {
    return (
      <PageLayout>
        <Header title="Xatolik" showBack />
        <div className="px-4 py-16 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black">Bog'lanib bo'lmadi</h2>
            <p className="text-sm text-edu-muted max-w-[280px]">
              Tizim bilan bog'lanishda xatolik yuz berdi. Bu server yangilanayotganligi yoki manzil o'zgarganligi sababli bo'lishi mumkin.
            </p>
            <p className="text-[10px] font-mono text-red-400 bg-red-50 p-2 rounded-lg break-all">
              {queryError?.message || 'Error 404: Not Found'}
            </p>
          </div>
          <Button onClick={() => refetch()} fullWidth variant="primary" icon={<RefreshCcw size={16} />}>Qayta urinish</Button>
        </div>
      </PageLayout>
    );
  }

  // If already verified or pending
  if (currentStatus === 'APPROVED' || currentStatus === 'PENDING') {
    return (
      <PageLayout>
        <Header title="Tasdiqlash" showBack />
        <div className="px-4 py-10 flex flex-col items-center text-center space-y-6">
          <div className={cn(
            "w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl",
            currentStatus === 'APPROVED' ? "bg-edu-primary text-white" : "bg-amber-500 text-white"
          )}>
            {currentStatus === 'APPROVED' ? <ShieldCheck size={48} /> : <AlertCircle size={48} />}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-edu-text">
              {currentStatus === 'APPROVED' ? 'Profil tasdiqlangan' : 'So\'rov kutilmoqda'}
            </h2>
            <p className="text-sm text-edu-muted max-w-[280px]">
              {currentStatus === 'APPROVED' 
                ? "Tabriklaymiz! Sizning profilingiz rasman tasdiqlandi. Endi sizga ko'proq ishonch bildiriladi."
                : "Sizning hujjatlaringiz adminlar tomonidan ko'rib chiqilmoqda. Bu odatda 24 soatgacha vaqt oladi."}
            </p>
          </div>

          {status?.adminNote && (
            <div className="bg-edu-surface p-4 rounded-2xl border border-edu-border/50 text-left w-full">
              <p className="text-[10px] font-black text-edu-muted uppercase tracking-wider mb-1">Admin izohi:</p>
              <p className="text-xs text-edu-text italic leading-relaxed">{status.adminNote}</p>
            </div>
          )}

          <Button variant="secondary" onClick={() => navigate(-1)} fullWidth>Orqaga qaytish</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Header title="Profilni tasdiqlash" showBack />
      
      <div className="px-4 pt-3 pb-20 space-y-6">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center px-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300",
                step === s ? "bg-edu-primary text-white scale-110 shadow-lg" : 
                step > s ? "bg-edu-primary/20 text-edu-primary" : "bg-edu-surface text-edu-muted border border-edu-border"
              )}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < 5 && <div className={cn("w-6 h-0.5 mx-1", step > s ? "bg-edu-primary/20" : "bg-edu-border")} />}
            </div>
          ))}
        </div>

        {/* Step 1: Instructions */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-edu-primary/5 border border-edu-primary/10 rounded-3xl p-6 text-center">
              <ShieldCheck size={48} className="mx-auto text-edu-primary mb-4" />
              <h3 className="text-xl font-black text-edu-text mb-2">Nega tasdiqlash kerak?</h3>
              <ul className="text-sm text-edu-muted text-left space-y-3 mt-4">
                <li className="flex gap-3"><ChevronRight size={18} className="text-edu-primary shrink-0" /> Buyurtmachilar ishonchini 3 barobar oshiradi</li>
                <li className="flex gap-3"><ChevronRight size={18} className="text-edu-primary shrink-0" /> To'lovlarni yechib olishda ustuvorlik</li>
                <li className="flex gap-3"><ChevronRight size={18} className="text-edu-primary shrink-0" /> Profilingizda maxsus "Tasdiqlangan" belgisi</li>
                <li className="flex gap-3"><ChevronRight size={18} className="text-edu-primary shrink-0" /> VIP xizmatlardan foydalanish imkoniyati</li>
              </ul>
            </div>
            <Button onClick={handleNext} fullWidth variant="primary">Boshlash</Button>
          </div>
        )}

        {/* Step 2: Choose Type */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-edu-text px-1">Hujjat turini tanlang</h3>
              <div className="grid gap-3">
                {DOC_TYPES.map((t) => (
                  <Card 
                    key={t.value}
                    onClick={() => setDocType(t.value)}
                    className={cn(
                      "cursor-pointer transition-all border-2",
                      docType === t.value ? "border-edu-primary bg-edu-primary/5" : "border-transparent bg-edu-surface"
                    )}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", docType === t.value ? "bg-edu-primary text-white" : "bg-edu-bg text-edu-muted")}>
                        <FileText size={20} />
                      </div>
                      <span className="font-bold text-edu-text">{t.label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <Button onClick={handleNext} fullWidth variant="primary">Davom etish</Button>
          </div>
        )}

        {/* Step 3: Document Upload */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3">
              <Info size={20} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                Hujjatning old tomoni to'liq va aniq ko'rinishi kerak. Matnlar o'qiladigan bo'lishi shart.
              </p>
            </div>
            <div className="py-2">
              <FileUpload 
                label={`${DOC_TYPES.find(d=>d.value===docType)?.label} rasmi`}
                value={docFiles}
                onChange={setDocFiles}
                onPreview={handleViewFile}
                maxFiles={1}
              />
            </div>
            {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
            <Button onClick={handleNext} fullWidth variant="primary">Rasm yuklandi</Button>
            <Button onClick={() => setStep(2)} variant="secondary" fullWidth>Orqaga</Button>
          </div>
        )}

        {/* Step 4: Selfie Upload */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-edu-surface rounded-full mx-auto flex items-center justify-center border-2 border-dashed border-edu-border">
                <Camera size={32} className="text-edu-muted" />
              </div>
              <h3 className="text-lg font-black text-edu-text">Selfie (Hujjat bilan)</h3>
              <p className="text-xs text-edu-muted leading-relaxed">
                Hujjatni yuzingiz yonida ushlab rasmga tushing. Ham yuzingiz, ham hujjat aniq ko'rinishi shart.
              </p>
            </div>
            <div className="py-2">
              <FileUpload 
                label="Selfie rasmini yuklang"
                value={selfieFiles}
                onChange={setSelfieFiles}
                onPreview={handleViewFile}
                maxFiles={1}
              />
            </div>
            {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
            <Button onClick={handleNext} fullWidth variant="primary">Selfie yuklandi</Button>
            <Button onClick={() => setStep(3)} variant="secondary" fullWidth>Orqaga</Button>
          </div>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <div className="space-y-5 animate-fade-in">
            <Card className="bg-edu-primary/5 border border-edu-primary/20" radius="2xl">
              <CardContent className="p-6 text-center space-y-4">
                <ShieldCheck size={48} className="mx-auto text-edu-primary" />
                <h3 className="text-xl font-black text-edu-text">Ma'lumotlarni tasdiqlaysizmi?</h3>
                <p className="text-sm text-edu-muted">
                  Barcha ma'lumotlar to'g'ri ekanligini qayta tekshiring. Noto'g'ri ma'lumotlar profilning cheklanishiga olib kelishi mumkin.
                </p>
              </CardContent>
            </Card>
            <Button 
              onClick={handleSubmit} 
              fullWidth 
              variant="primary" 
              isLoading={submit.isPending}
            >
              Tasdiqlashga yuborish
            </Button>
            <Button onClick={() => setStep(4)} variant="secondary" fullWidth>Tahrirlash</Button>
          </div>
        )}

      </div>

      <EduViewer
        isOpen={!!viewerFile}
        onClose={() => setViewerFile(null)}
        file={viewerFile}
      />
    </PageLayout>
  );
}
