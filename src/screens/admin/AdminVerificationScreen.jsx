import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { verificationApi } from '../../services/verification.service';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { TextArea } from '../../components/forms/TextArea';
import { Avatar } from '../../components/ui/Avatar';
import { ShieldCheck, XCircle, Eye, CheckCircle, Clock, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

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
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
          <ShieldCheck className="text-indigo-600" />
          Tasdiqlash so'rovlari
        </h1>
        <div className="flex gap-2">
           <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
             <Clock size={14} /> {requests.length} kutilmoqda
           </span>
        </div>
      </div>

      <div className="grid gap-4">
        {requests.length > 0 ? requests.map((req) => (
          <Card key={req.id} className="border-gray-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar name={req.user.fullname} avatarUrl={req.user.avatarUrl} size="md" />
                <div>
                  <h3 className="font-bold text-gray-900">{req.user.fullname}</h3>
                  <p className="text-xs text-gray-500">TG ID: {req.user.telegramId}</p>
                  <div className="mt-1 flex gap-2">
                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600 uppercase">
                      {req.documentType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => window.open(`https://t.me/edumarket_bot?start=file_${req.documentFileId}`, '_blank')}
                  className="flex items-center gap-1"
                >
                  <Eye size={14} /> Hujjat
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => window.open(`https://t.me/edumarket_bot?start=file_${req.selfieFileId}`, '_blank')}
                  className="flex items-center gap-1"
                >
                  <Camera size={14} /> Selfie
                </Button>
                <div className="w-px h-8 bg-gray-200 mx-1" />
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => openResolve(req, 'APPROVED')}
                >
                  <CheckCircle size={14} /> Tasdiqlash
                </Button>
                <Button 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => openResolve(req, 'REJECTED')}
                >
                  <XCircle size={14} /> Rad etish
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <ShieldCheck size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Hozircha yangi so'rovlar yo'q</p>
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
              className={statusToSet === 'APPROVED' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
              onClick={handleResolve}
              isLoading={resolve.isPending}
            >
              Yuborish
            </Button>
          </div>
        }
      >
        <div className="py-4 space-y-4">
          <p className="text-sm text-gray-600">
            {statusToSet === 'APPROVED' 
              ? "Foydalanuvchi profiliga 'Tasdiqlangan' belgisi qo'shiladi." 
              : "Foydalanuvchiga rad etish sababini yozib qoldiring."}
          </p>
          <TextArea
            label="Admin izohi (Foydalanuvchi ko'radi)"
            placeholder="Izoh yozing..."
            value={adminNote}
            onValueChange={setAdminNote}
            minRows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
