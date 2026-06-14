import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../../../../components/ui/AdminComponents';

export function UserBanModal({ isOpen, onClose, selectedUser, banMutation }) {
  const [banReason, setBanReason] = useState('');

  const handleClose = () => {
    setBanReason('');
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedUser || !banReason.trim()) return;
    banMutation.mutate({ userId: selectedUser.id, isBanned: true, reason: banReason });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent>
        <DialogTitle>Foydalanuvchini bloklash</DialogTitle>
        <DialogDescription>
          <strong>{selectedUser?.fullname}</strong> ni bloklash sababini kiriting. Ushbu sabab foydalanuvchi tizimga kirishga uringanida ko'rsatiladi.
        </DialogDescription>
        <div className="space-y-4">
          <textarea
            placeholder="Bloklash sababi (majburiy)..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-3 text-xs outline-none min-h-[100px] text-slate-100"
          />
          <div className="flex justify-end gap-3">
            <button 
              onClick={handleClose} 
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-white"
            >
              Bekor qilish
            </button>
            <button
              disabled={!banReason.trim() || banMutation.isLoading}
              onClick={handleSubmit}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold rounded-xl text-white disabled:opacity-50"
            >
              Bloklash
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
