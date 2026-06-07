// src/screens/shared/TaskDetail/components/TaskHeader.jsx
import { useNavigate } from 'react-router-dom';
import { Share2, AlertTriangle, Trash2 } from 'lucide-react';
import { Header } from '../../../../components/layout/Header';
import { hapticLight } from '../../../../lib/telegram';
import { showConfirm } from '../../../../lib/telegram';
import toast from 'react-hot-toast';

export function TaskHeader({ task, user, isMember, onCancel }) {
  const navigate = useNavigate();

  const handleShare = () => {
    hapticLight();
    const shareData = {
      title: task?.title,
      text: `EduMarket'da yangi vazifa: ${task?.title}`,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Havola nusxalandi!");
    }
  };

  const isClient = task && user && task.clientId === user.id;

  return (
    <Header
      title="Vazifa tafsiloti"
      showBack
      right={
        <div className="flex items-center gap-2">
          {/* Cancel button for Client (Only if task is OPEN) */}
          {isClient && task.status === 'OPEN' && (
            <button
              onClick={() => {
                showConfirm("Haqiqatan ham bu vazifani bekor qilmoqchimisiz?", async () => {
                  try {
                    await onCancel();
                    toast.success("Vazifa bekor qilindi");
                  } catch (err) {
                    toast.error(err.serverMsg || "Bekor qilishda xato");
                  }
                });
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:bg-white/5 transition-all"
              title="Vazifani bekor qilish"
            >
              <Trash2 size={16} />
            </button>
          )}

          {task && user && (task.status === 'OPEN' ? task.clientId !== user.id : (isMember && ['IN_PROGRESS', 'IN_REVIEW'].includes(task.status))) && (
            <button
              onClick={() => navigate(`/report?targetId=${task.id}&targetType=TASK`)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
              title="Shikoyat qilish"
            >
              <AlertTriangle size={16} />
            </button>
          )}
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-edu-bg press-scale transition-all hover:bg-edu-border/60"
          >
            <Share2 size={16} className="text-edu-text" />
          </button>
        </div>
      }
    />
  );
}
