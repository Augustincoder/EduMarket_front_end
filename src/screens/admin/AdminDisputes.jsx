import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/admin.service';
import { filesApi } from '../../services/other.service';
import { formatPrice } from '../../lib/constants';
import { toast } from 'react-hot-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  Select
} from '../../components/ui/AdminComponents';
import { Gavel, MessageSquare, ShieldAlert, Award } from 'lucide-react';

export default function AdminDisputes() {
  const queryClient = useQueryClient();
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [winner, setWinner] = useState('');

  // 1. Fetch Disputes
  const { data: disputesData, isLoading } = useQuery({
    queryKey: ['admin', 'disputes'],
    queryFn: () => adminApi.getDisputes().then(r => r.data.data)
  });
  const disputes = disputesData?.disputes || [];

  // 2. Fetch Dispute Chat history
  const { data: chatData, isLoading: isChatLoading } = useQuery({
    queryKey: ['admin', 'dispute-chat', selectedDispute?.id],
    queryFn: () => adminApi.getDisputeChat(selectedDispute.id).then(r => r.data.data),
    enabled: !!selectedDispute?.id
  });
  const chatMessages = chatData || [];

  // 3. Resolve Dispute Mutation
  const resolveMutation = useMutation({
    mutationFn: ({ id, winner, adminNotes }) => adminApi.resolveDispute(id, { winner, adminNotes }),
    onSuccess: () => {
      toast.success('Nizo muvaffaqiyatli hal qilindi');
      queryClient.invalidateQueries(['admin', 'disputes']);
      queryClient.invalidateQueries(['admin', 'stats']);
      closeModal();
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const openDispute = (disp) => {
    setSelectedDispute(disp);
    setAdminNotes(disp.adminNotes || '');
  };

  const closeModal = () => {
    setSelectedDispute(null);
    setAdminNotes('');
    setWinner('');
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nizolar yuklanmoqda...</span>
          </div>
        ) : disputes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-950/20">
                  <th className="py-4 px-6">Topshiriq</th>
                  <th className="py-4 px-6">Mijoz</th>
                  <th className="py-4 px-6">Ijrochi (Freelancer)</th>
                  <th className="py-4 px-6">Nizo sababi</th>
                  <th className="py-4 px-6">Sana</th>
                  <th className="py-4 px-6 text-right">Tekshirish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
                {disputes.map((disp) => (
                  <tr key={disp.id} className="hover:bg-slate-900/20 transition-all">
                    <td className="py-4 px-6 font-bold text-slate-100">
                      {disp.task?.title}
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {disp.task?.client?.fullname}
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {disp.task?.freelancer?.fullname || 'Ijrochi tayinlanmagan'}
                    </td>
                    <td className="py-4 px-6 text-slate-400 max-w-xs truncate">
                      {disp.reason}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(disp.createdAt).toLocaleString('uz-UZ')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end">
                        <button
                          onClick={() => openDispute(disp)}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Gavel size={14} /> Nizoni Yechish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-xs font-semibold">Tizimda ochiq nizolar mavjud emas</p>
          </div>
        )}
      </div>

      {/* ── Radix Dialog: Dispute Resolution Panel ──────── */}
      <Dialog open={!!selectedDispute} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>Nizoni ko'rib chiqish va hal qilish</DialogTitle>
          <DialogDescription>
            Quyida vazifaning tavsifi, mijoz va ijrochi o'rtasidagi chat tarixi berilgan. Adolatli g'olibni aniqlang.
          </DialogDescription>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* Left: Task Info & Chat Logs */}
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-2">
                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Topshiriq tavsifi</h4>
                <p className="text-xs font-bold text-slate-100">{selectedDispute?.task?.title}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed max-h-24 overflow-y-auto">{selectedDispute?.task?.description}</p>
                <div className="pt-2 border-t border-slate-850/60 flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Kelishilgan narx: {formatPrice(selectedDispute?.task?.agreedPrice || 0)} UZS</span>
                  <span>Ochilgan sana: {selectedDispute && new Date(selectedDispute.createdAt).toLocaleDateString('uz-UZ')}</span>
                </div>
              </div>

              {/* Chat history */}
              <div className="bg-slate-950/60 rounded-2xl border border-slate-850 p-4 flex flex-col h-[280px]">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MessageSquare size={12} />
                  Muloqot chat loglari
                </h4>
                
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-[11px]">
                  {isChatLoading ? (
                    <div className="h-full flex items-center justify-center text-slate-600">Yuklanmoqda...</div>
                  ) : chatMessages.length > 0 ? (
                    chatMessages.map((msg) => {
                      const isClient = msg.senderId === selectedDispute.task?.clientId;
                      const publicUrl = msg.fileId ? filesApi.getPublicUrl(msg.fileId) : null;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isClient ? 'items-start' : 'items-end'}`}>
                          <div className={`p-2.5 rounded-2xl max-w-[80%] ${
                            isClient ? 'bg-slate-900 text-slate-300' : 'bg-indigo-600/10 text-indigo-300 border border-indigo-500/20'
                          }`}>
                            <p className="font-bold text-[9px] mb-0.5 opacity-60">{msg.sender?.fullname}</p>
                            {msg.content && <p className="leading-relaxed mb-1">{msg.content}</p>}
                            {msg.fileId && (
                              <div className="mt-1">
                                {publicUrl ? (
                                  <img 
                                    src={publicUrl} 
                                    alt="Chat file" 
                                    className="max-w-full rounded-lg border border-white/10 cursor-pointer"
                                    onClick={() => window.open(publicUrl, '_blank')}
                                  />
                                ) : (
                                  <button
                                    onClick={async () => {
                                      const res = await filesApi.getUrl(msg.fileId);
                                      window.open(res.data.data.url, '_blank');
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-black/20 hover:bg-black/40 rounded-xl text-[10px] font-bold border border-white/5"
                                  >
                                    📂 {msg.fileName || 'Faylni yuklash'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-[8px] text-slate-600 mt-0.5">{new Date(msg.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-600">Chat xabarlari topilmadi</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Resolution controls */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl">
                  <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <ShieldAlert size={12} />
                    Nizo ochilish sababi
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed italic">"{selectedDispute?.reason}"</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">G'olibni Aniqlash</label>
                    <Select
                      value={winner}
                      onValueChange={setWinner}
                      placeholder="G'olibni tanlang..."
                      options={[
                        { label: 'Mijoz (Client) foydasiga yopish (Escrow puli mijozga qaytariladi)', value: 'CLIENT' },
                        { label: 'Ijrochi (Freelancer) foydasiga yopish (Escrow puli ijrochiga o\'tkaziladi)', value: 'FREELANCER' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Yechim Izohi</label>
                    <textarea
                      placeholder="Yopilish to'g'risidagi qaror sababini yozing..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs outline-none min-h-[110px]"
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={!winner || !adminNotes.trim() || resolveMutation.isLoading}
                onClick={() => resolveMutation.mutate({ id: selectedDispute.id, winner, adminNotes })}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Award size={16} /> Qarorni Tasdiqlash & Yopish
              </button>
            </div>

          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
