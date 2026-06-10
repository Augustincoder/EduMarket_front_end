import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { verificationApi } from '../../services/verification.service';
import { filesApi } from '../../services/other.service';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { TextArea } from '../../components/forms/TextArea';
import { Avatar } from '../../components/ui/Avatar';
import { ShieldCheck, XCircle, Eye, CheckCircle, Clock, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

function ImagePreview({ fileId, label, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const publicUrl = filesApi.getPublicUrl(fileId);

  return (
    <>
      <div className="group relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 cursor-pointer" onClick={() => setIsOpen(true)}>
        {publicUrl ? (
          <img src={publicUrl} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 text-center">
            <Icon size={20} className="mb-1" />
            <span className="text-[10px] font-bold leading-tight">{label}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Eye size={18} className="text-white" />
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={label} size="xl">
        <div className="flex flex-col items-center gap-4 py-2">
          {publicUrl ? (
            <img src={publicUrl} alt={label} className="max-w-full max-h-[70vh] rounded-lg shadow-lg object-contain bg-gray-50" />
          ) : (
            <div className="p-10 text-center text-gray-500">
              Rasm yuklanmadi. Balki u image/ formatida emasdir.
            </div>
          )}
          <div className="flex gap-3">
             <Button variant="secondary" onClick={() => setIsOpen(false)}>Yopish</Button>
             <Button 
               variant="primary" 
               onClick={async () => {
                 try {
                   const res = await filesApi.getUrl(fileId);
                   window.open(res.data.data.url, '_blank');
                 } catch {
                   toast.error('Havolani olishda xato');
                 }
               }}
             >
               To'liq ochish
             </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function AdminVerificationScreen() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [statusToSet, setStatusToSet] = useState('APPROVED');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: () => verificationApi.adminList({ status: 'PENDING' }).then(res => res.data.data),
  });

  const resolve = useMutation({
    mutationFn: ({ id, data }) => verificationApi.adminResolve(id, data),
    onSuccess: () => {
      toast.success('Muvaffaqiyatli bajarildi');
      queryClient.invalidateQueries(['admin-verifications']);
      setResolveOpen(false);
      setSelectedRequest(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  });

  const handleResolve = () => {
    resolve.mutate({
      id: selectedRequest.id,
      data: { status: statusToSet, adminNote }
    });
  };

  const openResolve = (request, status) => {
    setSelectedRequest(request);
    setStatusToSet(status);
    setAdminNote('');
    setResolveOpen(true);
  };

  if (isLoading) return <div className="p-10 text-center">Yuklanmoqda...</div>;

  const requests = data?.requests || [];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <ShieldCheck className="text-indigo-600" />
          Tasdiqlash so'rovlari
        </h1>
        <div className="flex gap-2">
           <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
             <Clock size={14} /> {requests.length} kutilmoqda
           </span>
        </div>
      </div>

      <div className="grid gap-6">
        {requests.length > 0 ? requests.map((req) => (
          <Card key={req.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-4">
                  <Avatar name={req.user.fullname} avatarUrl={req.user.avatarUrl} size="lg" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{req.user.fullname}</h3>
                    <p className="text-sm text-gray-500 font-medium">Telegram ID: {req.user.telegramId.toString()}</p>
                    <div className="mt-1.5 flex gap-2">
                      <span className="text-[11px] font-bold bg-indigo-50 px-2.5 py-1 rounded-lg text-indigo-600 uppercase tracking-wider border border-indigo-100">
                        {req.documentType}
                      </span>
                      <span className="text-[11px] font-bold bg-gray-50 px-2.5 py-1 rounded-lg text-gray-600 uppercase tracking-wider border border-gray-100">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4"
                    onClick={() => openResolve(req, 'APPROVED')}
                  >
                    <CheckCircle size={16} className="mr-2" /> Tasdiqlash
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-4 border border-red-100"
                    onClick={() => openResolve(req, 'REJECTED')}
                  >
                    <XCircle size={16} className="mr-2" /> Rad etish
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-10">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hujjatlar</p>
                  <div className="flex gap-4">
                    <ImagePreview fileId={req.documentFileId} label="Asosiy hujjat" icon={Eye} />
                    <ImagePreview fileId={req.selfieFileId} label="Selfie rasm" icon={Camera} />
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bot orqali tekshirish</p>
                   <div className="flex gap-2">
                     <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => window.open(`https://t.me/edumarket_bot?start=file_${req.documentFileId}`, '_blank')}
                        className="text-xs text-indigo-600 hover:bg-indigo-50"
                      >
                        Botda ochish (Hujjat)
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => window.open(`https://t.me/edumarket_bot?start=file_${req.selfieFileId}`, '_blank')}
                        className="text-xs text-indigo-600 hover:bg-indigo-50"
                      >
                        Botda ochish (Selfie)
                      </Button>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="py-24 text-center bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-bold text-lg">Hozircha yangi so'rovlar yo'q</p>
            <p className="text-gray-400 text-sm mt-1">Barcha so'rovlar ko'rib chiqilgan.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title={statusToSet === 'APPROVED' ? 'Tasdiqlashni yakunlash' : 'So\'rovni rad etish'}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="secondary" fullWidth onClick={() => setResolveOpen(false)}>Bekor qilish</Button>
            <Button 
              fullWidth 
              className={statusToSet === 'APPROVED' ? 'bg-green-600 hover:bg-green-700 text-white font-bold' : 'bg-red-600 hover:bg-red-700 text-white font-bold'}
              onClick={handleResolve}
              isLoading={resolve.isPending}
            >
              {statusToSet === 'APPROVED' ? 'Tasdiqlash' : 'Rad etish'}
            </Button>
          </div>
        }
      >
        <div className="py-4 space-y-4">
          <p className="text-sm font-medium text-gray-600 leading-relaxed">
            {statusToSet === 'APPROVED' 
              ? "Foydalanuvchi profiliga 'Tasdiqlangan' belgisi qo'shiladi va u barcha imtiyozlardan foydalana oladi." 
              : "Foydalanuvchiga rad etish sababini yozib qoldiring. U bu izohni o'z kabinetida ko'radi."}
          </p>
          <TextArea
            label="Admin izohi (Ixtiyoriy)"
            placeholder="Masalan: Ma'lumotlar mos kelmadi..."
            value={adminNote}
            onValueChange={setAdminNote}
            minRows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
