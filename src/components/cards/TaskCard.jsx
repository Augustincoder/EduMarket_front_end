import { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Bookmark, Sparkles, ArrowRight } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { deadlineCountdown, formatPriceRange, formatPrice, formatDate } from '../../lib/utils';
import { CATEGORIES } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { hapticLight, hapticSuccess } from '../../lib/telegram';
import toast from 'react-hot-toast';

function TaskCard({ task, className }) {
  const navigate = useNavigate();
  const catInfo = CATEGORIES.find((c) => c.value === task.category);

  // Local favorite state for tasks
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const savedTasks = JSON.parse(localStorage.getItem('edu_saved_tasks') || '[]');
      return savedTasks.includes(task.id);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const savedTasks = JSON.parse(localStorage.getItem('edu_saved_tasks') || '[]');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSaved(savedTasks.includes(task.id));
    } catch {
      setIsSaved(false);
    }
  }, [task.id]);

  const handleToggleSave = (e) => {
    e.stopPropagation();
    hapticLight();
    try {
      const savedTasks = JSON.parse(localStorage.getItem('edu_saved_tasks') || '[]');
      let newSaved;
      if (isSaved) {
        newSaved = savedTasks.filter(id => id !== task.id);
        toast.success("Vazifa saqlanganlardan o'chirildi");
      } else {
        newSaved = [...savedTasks, task.id];
        toast.success("Vazifa saqlandi! ✨");
        hapticSuccess();
      }
      localStorage.setItem('edu_saved_tasks', JSON.stringify(newSaved));
      setIsSaved(!isSaved);
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative bg-edu-surface rounded-[24px] p-5 active:scale-[0.98] transition-all duration-500 cursor-pointer border border-edu-border shadow-ios hover:shadow-ios-lg hover:border-edu-primary/30',
        className
      )}
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Header: Status Labels & Actions */}
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-1.5 max-w-[75%]">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-edu-bg border border-edu-border text-[10px] font-bold text-edu-muted">
              <span className="text-[12px]">{catInfo?.emoji}</span>
              <span className="truncate max-w-[80px]">{catInfo?.label || task.category}</span>
            </div>
            {task.isUrgent && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-[9px] font-bold uppercase tracking-wider text-red-500 animate-pulse-subtle">
                <Sparkles size={8} fill="currentColor" /> Tezkor
              </span>
            )}
            {task.dnaScore && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                🧬 {task.dnaScore}%
              </div>
            )}
          </div>
          
          <button 
            onClick={handleToggleSave}
            aria-label="Saqlash"
            className={cn(
              "w-11 h-11 -mt-2 -mr-2 rounded-2xl flex items-center justify-center transition-all duration-300",
              isSaved 
                ? "bg-edu-primary/10 text-edu-primary shadow-inner-sm" 
                : "bg-edu-bg text-edu-muted hover:text-edu-text"
            )}
          >
            <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Content: Title & Price */}
        <div className="space-y-2 flex-1">
          <h3 className="font-bold text-edu-text text-[18px] leading-[1.3] tracking-tight line-clamp-2 group-hover:text-edu-primary transition-colors duration-300">
            {task.title}
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[16px] font-bold text-emerald-500 tracking-tight">
              {formatPriceRange(task.priceMin, task.priceMax)}
            </span>
            <span className="text-[11px] font-bold text-edu-muted uppercase tracking-widest bg-edu-bg px-2 py-0.5 rounded-md">
              UZS
            </span>
          </div>
        </div>

        {/* Footer: Client Info & Meta Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-edu-border/50">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Avatar
                name={task.client?.fullname || 'Mijoz'}
                avatarUrl={task.client?.avatarUrl}
                size="sm"
                className="w-8 h-8 rounded-2xl ring-2 ring-edu-surface shadow-sm"
              />
              {task.client?.isVip && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-edu-surface flex items-center justify-center shadow-sm">
                  <span className="text-[6px] leading-none">👑</span>
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] text-edu-text font-bold truncate max-w-[90px]">
                {task.client?.fullname || 'Mijoz'}
              </span>
              <span className="text-[10px] text-edu-muted font-medium">Buyurtmachi</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end gap-1">
               <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-500/5 text-amber-500 text-[11px] font-bold">
                 <Clock size={12} strokeWidth={2.5} />
                 {deadlineCountdown(task.deadline)}
               </div>
               <div className="flex items-center gap-1.5 pr-1">
                 <Users size={11} className="text-edu-muted" />
                 <span className="text-[11px] font-bold text-edu-muted">{task._count?.bids ?? 0} ta taklif</span>
               </div>
             </div>
          </div>
        </div>

        {/* Assigned Status Indicator */}
        {task.status === 'ASSIGNED' && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-edu-primary rounded-b-[24px] overflow-hidden">
            <div className="w-full h-full bg-edu-primary animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(TaskCard);
