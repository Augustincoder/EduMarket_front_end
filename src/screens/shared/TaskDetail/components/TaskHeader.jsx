// src/screens/shared/TaskDetail/components/TaskHeader.jsx
import { useNavigate } from 'react-router-dom';
import { Share2, AlertTriangle, Trash2 } from 'lucide-react';
import { Header } from '../../../../components/layout/Header';
import { hapticLight } from '../../../../lib/telegram';
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
        <div className="flex items-center gap-1.5">
          {/* Cancel button for Client (Only if task is OPEN) */}
          {isClient && task.status === 'OPEN' && (
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-red-500 transition-all active:scale-90"
              title="Vazifani bekor qilish"
            >
              <Trash2 size={15} />
            </button>
          )}

          {task && user && (task.status === 'OPEN' ? task.clientId !== user.id : (isMember && ['IN_PROGRESS', 'IN_REVIEW'].includes(task.status))) && (
            <button
              onClick={() => navigate(`/report?targetId=${task.id}&targetType=TASK`)}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/5 text-red-500/60 hover:text-red-500 transition-all active:scale-90"
              title="Shikoyat qilish"
            >
              <AlertTriangle size={15} />
            </button>
          )}
          
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-400 active:scale-90 transition-all"
          >
            <Share2 size={15} />
          </button>
        </div>
      }
    />
  );
}

