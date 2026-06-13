import { useState } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { User, Bell, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function ProfileSettings({ isOpen, onClose, onOpenEdit, deleteMe }) {
  const navigate = useNavigate();
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false);

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Sozlamalar">
        <div className="space-y-2 py-4">
          <button 
            className="w-full flex items-center gap-3 p-4 bg-edu-surface rounded-xl border border-edu-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={() => { onClose(); onOpenEdit(); }}
          >
            <div className="w-8 h-8 rounded-full bg-edu-primary/10 flex items-center justify-center text-edu-primary">
              <User size={18} />
            </div>
            <span className="font-bold text-edu-text">Profilni tahrirlash</span>
          </button>
          
          <button 
            className="w-full flex items-center gap-3 p-4 bg-edu-surface rounded-xl border border-edu-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={() => { onClose(); navigate('/settings/notifications'); }}
          >
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Bell size={18} />
            </div>
            <span className="font-bold text-edu-text">Bildirishnomalar (Push)</span>
          </button>

          <button 
            className="w-full flex items-center gap-3 p-4 bg-edu-surface rounded-xl border border-edu-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={() => { 
              onClose(); 
              toast("Tilni o'zgartirish tez orada qo'shiladi!", { icon: '🌐' });
            }}
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <span className="text-[16px]">🇺🇿</span>
            </div>
            <span className="font-bold text-edu-text">Til (O'zbek)</span>
          </button>
          
          <button 
            className="w-full flex items-center gap-3 p-4 bg-edu-surface rounded-xl border border-edu-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors mt-2"
            onClick={() => { onClose(); setDeleteProfileOpen(true); }}
          >
            <div className="w-8 h-8 rounded-full bg-edu-urgent/10 flex items-center justify-center text-edu-urgent">
              <Trash2 size={18} />
            </div>
            <span className="font-semibold text-edu-urgent">Profilni o'chirish</span>
          </button>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={deleteProfileOpen} onClose={() => setDeleteProfileOpen(false)} title="Profilni O'chirish">
        <div className="py-4 space-y-4">
          <div className="bg-edu-surface rounded-xl p-4 shadow-sm border border-edu-border/30">
            <h3 className="text-lg font-bold text-edu-text mb-2">Haqiqatdan ham profilingizni o'chirmoqchimisiz?</h3>
            <p className="text-sm font-normal text-edu-muted">
              Bu amal profilingizni va shaxsiy ma'lumotlaringizni tizimdan o'chirib yuboradi. Barcha aktiv tranzaksiyalar va pullaringiz saqlanib qoladi (moliyaviy xavfsizlik uchun), lekin profilga qayta kira olmaysiz.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteProfileOpen(false)}
              className="flex-1 py-3 bg-edu-bg text-edu-text rounded-xl font-bold transition-all active:scale-[0.98]"
            >
              Bekor qilish
            </button>
            <button
              onClick={() => deleteMe.mutate()}
              disabled={deleteMe.isPending}
              className="flex-1 py-3 bg-edu-urgent text-white rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {deleteMe.isPending ? "O'chirilmoqda..." : "Ha, o'chirish"}
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
