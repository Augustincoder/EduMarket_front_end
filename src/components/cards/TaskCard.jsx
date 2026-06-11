import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Bookmark, Sparkles } from 'lucide-react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Avatar } from '../ui/Avatar';
import { deadlineCountdown, formatPriceRange } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { hapticLight, hapticSuccess } from '../../lib/telegram';
import { useCategoryStore } from '../../store/categoryStore';
import toast from 'react-hot-toast';

function TaskCard({ task, className }) {
  const navigate = useNavigate();
  
  // Dynamic category mapping
  const categoryStore = useCategoryStore(s => s.categories);
  const catInfo = categoryStore.find((c) => c.value === task.category) || { emoji: '📌', label: task.category, colorHex: '#64748b' };

  // Local favorite state for tasks
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const savedTasks = JSON.parse(localStorage.getItem('edu_saved_tasks') || '[]');
      return savedTasks.includes(task.id);
    } catch {
      return false;
    }
  });



  const toggleSave = () => {
    hapticLight();
    try {
      const savedTasks = JSON.parse(localStorage.getItem('edu_saved_tasks') || '[]');
      let newSaved;
      if (isSaved) {
        newSaved = savedTasks.filter(id => id !== task.id);
        toast.success("Saqlanganlardan o'chirildi");
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

  const handleToggleSave = (e) => {
    e.stopPropagation();
    toggleSave();
  };

  const handleClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  // Framer Motion Swipe Logic
  const controls = useAnimation();
  const x = useMotionValue(0);
  const swipeOpacity = useTransform(x, [0, 80], [0, 1]);
  const swipeScale = useTransform(x, [0, 80], [0.8, 1.2]);

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 80) {
      toggleSave();
    }
    controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] mb-4">
      {/* Background layer revealed during swipe */}
      <div className="absolute inset-0 bg-edu-primary/10 flex items-center px-6 border border-edu-primary/20 rounded-[24px]">
        <motion.div 
          style={{ opacity: swipeOpacity, scale: swipeScale }}
          className="w-12 h-12 bg-edu-primary text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Bookmark size={24} fill="currentColor" />
        </motion.div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.5 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        onClick={handleClick}
        className={cn(
          'relative z-10 bg-edu-surface rounded-[24px] p-5 active:scale-[0.98] transition-transform duration-300 cursor-pointer border border-edu-border shadow-ios hover:shadow-ios-lg',
          className
        )}
      >
        <div className="flex flex-col h-full space-y-4 pointer-events-none">
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
      </motion.div>
    </div>
  );
}

export default memo(TaskCard);
