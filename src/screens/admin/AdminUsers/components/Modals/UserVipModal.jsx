import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, Select } from '../../../../../components/ui/AdminComponents';

export function UserVipModal({ isOpen, onClose, selectedUser, vipMutation }) {
  const [vipDuration, setVipDuration] = useState('30');

  if (!selectedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogTitle>VIP Maqomini boshqarish</DialogTitle>
        <DialogDescription>
          Foydalanuvchi: <strong>{selectedUser?.fullname}</strong>. VIP muddatini yoki uni butunlay olib tashlashni tanlang.
        </DialogDescription>
        <div className="space-y-4">
          {selectedUser?.isVip ? (
            <button
              onClick={() => vipMutation.mutate({ userId: selectedUser.id, isVip: false })}
              className="w-full px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold transition-all"
            >
              VIP Maqomini Olib Tashlash
            </button>
          ) : (
            <div className="space-y-4">
              <Select
                value={vipDuration}
                onValueChange={setVipDuration}
                placeholder="VIP Davomiyligi"
                options={[
                  { label: '7 Kunlik VIP', value: '7' },
                  { label: '30 Kunlik VIP', value: '30' },
                  { label: '90 Kunlik VIP', value: '90' },
                ]}
              />
              <button
                onClick={() => vipMutation.mutate({ userId: selectedUser.id, isVip: true, durationDays: vipDuration })}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                VIP Maqomini Berish
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
