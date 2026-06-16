import { useState } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { User, Bell, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function ProfileSettings({ isOpen, onClose, onOpenEdit, deleteMe }) {
  const navigate = useNavigate();
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false);

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Sozlamalar">
        <motion.div 
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="space-y-2 py-4"
        >
          <motion.button 
            variants={{
              hidden: { opacity: 0, y: -20, rotateX: -20 },
              visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
            }}
            className="w-full flex items-center gap-3 p-4 bg-edu-surface rounded-xl border border-edu-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={() => { onClose(); onOpenEdit(); }}
          >
            <div className="w-8 h-8 rounded-full bg-edu-primary/10 flex items-center justify-center text-edu-primary">
              <User size={18} />
            </div>
            <span className="font-bold text-edu-text">Profilni tahrirlash</span>
          </motion.button>
          
          <motion.button 
            variants={{
              hidden: { opacity: 0, y: -20, rotateX: -20 },
              visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
            }}
            className="w-full flex items-center gap-3 p-4 bg-edu-surface rounded-xl border border-edu-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={() => { onClose(); navigate('/settings/notifications'); }}
          >
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Bell size={18} />
            </div>
            <span className="font-bold text-edu-text">Bildirishnomalar (Push)</span>
          </motion.button>

          <motion.button 
            variants={{
              hidden: { opacity: 0, y: -20, rotateX: -20 },
              visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
            }}
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
          </motion.button>
          
          <motion.button 
            variants={{
              hidden: { opacity: 0, y: -20, rotateX: -20 },
              visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
            }}
            className="relative w-full flex items-center gap-3 p-4 bg-edu-surface rounded-xl border border-edu-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors mt-2 overflow-hidden group"
            onClick={() => { onClose(); setDeleteProfileOpen(true); }}
          >
            <motion.div 
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-edu-urgent"
            />
            <div className="w-8 h-8 rounded-full bg-edu-urgent/10 flex items-center justify-center text-edu-urgent relative z-10">
              <Trash2 size={18} />
            </div>
            <span className="font-semibold text-edu-urgent relative z-10">Profilni o'chirish</span>
          </motion.button>
        </motion.div>
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
