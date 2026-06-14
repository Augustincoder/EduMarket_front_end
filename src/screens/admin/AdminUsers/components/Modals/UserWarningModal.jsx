import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../../../../components/ui/AdminComponents';

export function UserWarningModal({ isOpen, onClose, selectedUser, warnMutation }) {
  const [warnMessage, setWarnMessage] = useState('');

  const handleClose = () => {
    setWarnMessage('');
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedUser || !warnMessage.trim()) return;
    warnMutation.mutate({ userId: selectedUser.id, message: warnMessage });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent>
        <DialogTitle>Telegram Ogohlantirish Yuborish</DialogTitle>
        <DialogDescription>
          Foydalanuvchi: <strong>{selectedUser?.fullname}</strong>. Unga yuboriladigan ogohlantirish matnini yozing.
        </DialogDescription>
        <div className="space-y-4">
          <textarea
            placeholder="Ogohlantirish xabari..."
            value={warnMessage}
            onChange={(e) => setWarnMessage(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs outline-none min-h-[100px] text-slate-100"
          />
          <div className="flex justify-end gap-3">
            <button onClick={handleClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-white">
              Bekor qilish
            </button>
            <button
              disabled={!warnMessage.trim() || warnMutation.isLoading}
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl text-white disabled:opacity-50"
            >
              Xabarni yuborish
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
