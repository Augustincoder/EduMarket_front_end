import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../../../../components/ui/AdminComponents';
import { Check } from 'lucide-react';

export function StudentVerificationModal({ isOpen, onClose, selectedUser, studentMutation, studentCardUrl }) {
  const [studentRejectReason, setStudentRejectReason] = useState('');

  const handleClose = () => {
    setStudentRejectReason('');
    onClose();
  };

  const handleApprove = () => {
    if (!selectedUser) return;
    studentMutation.mutate({ userId: selectedUser.id, isApproved: true });
  };

  const handleReject = () => {
    if (!selectedUser || !studentRejectReason.trim()) return;
    studentMutation.mutate({ userId: selectedUser.id, isApproved: false, rejectReason: studentRejectReason });
  };

  if (!selectedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Talabalik Arizasini Ko'rish</DialogTitle>
        <DialogDescription>
          Foydalanuvchi talabalik guvohnomasi va u yuborgan o'quv ma'lumotlari.
        </DialogDescription>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-850">
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider">Universitet</p>
              <p className="text-slate-100 font-bold mt-1">{selectedUser.university || 'Kiritilmagan'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider">Fakultet</p>
              <p className="text-slate-100 font-bold mt-1">{selectedUser.faculty || 'Kiritilmagan'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider">O'qish yili (Kurs)</p>
              <p className="text-slate-100 font-bold mt-1">{selectedUser.studyYear ? `${selectedUser.studyYear}-kurs` : 'Kiritilmagan'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider">Viloyat</p>
              <p className="text-slate-100 font-bold mt-1">{selectedUser.region || 'Kiritilmagan'}</p>
            </div>
          </div>

          {/* Document Preview */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 min-h-[250px] max-h-[350px]">
            {studentCardUrl ? (
              <img 
                src={studentCardUrl} 
                alt="Talabalik Guvohnomasi" 
                className="max-w-full max-h-[330px] object-contain rounded-lg"
              />
            ) : (
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Hujjat rasmi yuklanmoqda...</span>
            )}
          </div>

          {/* Action panel */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={studentMutation.isLoading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check size={16} /> Tasdiqlash (Talaba unvonini berish)
              </button>
            </div>
            <div className="border-t border-slate-850 pt-3 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rad etish sababi</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Rad etish sababini yozing..."
                  value={studentRejectReason}
                  onChange={(e) => setStudentRejectReason(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2 text-xs outline-none text-slate-100"
                />
                <button
                  disabled={!studentRejectReason.trim() || studentMutation.isLoading}
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Rad etish
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
