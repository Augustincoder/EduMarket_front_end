// src/components/cards/TaskCard.jsx
import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Bookmark } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { CategoryChip, UrgentBadge } from '../ui/Badge';
import { deadlineCountdown, formatPriceRange } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { hapticLight, hapticSuccess } from '../../lib/telegram';
import { useCategoryStore } from '../../store/categoryStore';
import toast from 'react-hot-toast';

function TaskCard({ task, className }) {
  const navigate = useNavigate();
  
  const categoryStore = useCategoryStore(s => s.categories) || [];
  const catInfo = categoryStore.find((c) => c.value === task.category) || { emoji: '📌', label: task.category };

  const [isSaved, setIsSaved] = useState(() => {
    try {
      const savedTasks = JSON.parse(localStorage.getItem('edu_saved_tasks') || '[]');
      return savedTasks.includes(task.id);
    } catch {
      return false;
    }
  });

  const handleToggleSave = (e) => {
    e.stopPropagation();
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

  const handleClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <Card 
      variant="base" 
      isPressable 
      onClick={handleClick} 
      className={cn("mb-3 p-4", className)}
    >
      <div className="flex flex-col h-full pointer-events-none">
        
        {/* Header: Badges & Save */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CategoryChip category={catInfo.label} emoji={catInfo.emoji} />
            {task.isUrgent && <UrgentBadge />}
          </div>
          
          <button 
            onClick={handleToggleSave}
            aria-label="Saqlash"
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-220 pointer-events-auto",
              isSaved 
                ? "bg-edu-primary-l text-edu-primary" 
                : "bg-edu-surface-2 text-edu-muted hover:text-edu-text"
            )}
          >
            <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} strokeWidth={isSaved ? 0 : 2} />
          </button>
        </div>

        {/* Content: Title & Price */}
        <div className="flex flex-col gap-2 mb-3">
          <h3 className="text-[16px] font-semibold text-edu-text leading-tight line-clamp-2">
            {task.title}
          </h3>
          <span className="text-[18px] font-bold text-edu-primary">
            {formatPriceRange(task.priceMin, task.priceMax)}
          </span>
        </div>

        {/* Footer: Client Info & Meta Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-edu-border">
          <div className="flex items-center gap-2">
            <Avatar
              name={task.client?.fullname || 'Mijoz'}
              avatarUrl={task.client?.avatarUrl}
              size="sm"
            />
            <span className="text-[12px] font-medium text-edu-text truncate max-w-[100px]">
              {task.client?.fullname || 'Mijoz'}
            </span>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 text-[12px] font-medium text-edu-muted">
               <Clock size={12} />
               <span>{deadlineCountdown(task.deadline)}</span>
             </div>
             <div className="flex items-center gap-1 text-[12px] font-medium text-edu-muted">
               <Users size={12} />
               <span>{task._count?.bids ?? 0} taklif</span>
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(TaskCard);
