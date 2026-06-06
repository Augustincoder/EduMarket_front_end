import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, ChevronRight, Bookmark } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { deadlineCountdown, formatPriceRange } from '../../lib/utils';
import { CATEGORIES } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/Card';

function TaskCard({ task, className }) {
  const navigate = useNavigate();
  const catInfo = CATEGORIES.find((c) => c.value === task.category);

  const handleClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 active:scale-[0.98] transition-all duration-300 cursor-pointer border border-black/5 dark:border-white/5 shadow-ios hover:shadow-ios-lg',
        className
      )}
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Header: Category & Price */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#0A84FF] text-[10px] font-black uppercase tracking-widest border border-[#007AFF]/10">
              <span className="text-[12px] leading-none -mt-0.5">{catInfo?.emoji}</span>
              <span>{catInfo?.label || task.category}</span>
            </div>
            {task.isUrgent && (
              <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] text-[10px] font-black uppercase tracking-widest border border-[#FF3B30]/10 animate-pulse-subtle">
                <Clock size={10} strokeWidth={3} /> Tezkor
              </span>
            )}
          </div>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#007AFF] hover:bg-[#007AFF]/5 transition-all">
            <Bookmark size={18} />
          </button>
        </div>

        {/* Body: Title */}
        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[17px] leading-[1.3] tracking-tight line-clamp-2 group-hover:text-[#007AFF] transition-colors">
            {task.title}
          </h3>
          <p className="text-[14px] font-black text-emerald-600 dark:text-[#30D158] tracking-tight">
            {formatPriceRange(task.priceMin, task.priceMax)}
          </p>
        </div>

        {/* Footer: User & Meta */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Avatar
                name={task.client?.fullname}
                avatarUrl={task.client?.avatarUrl}
                size="xs"
                className="w-7 h-7 rounded-xl ring-2 ring-white dark:ring-[#1C1C1E] shadow-sm"
              />
              {task.client?.isVip && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white dark:border-[#1C1C1E] flex items-center justify-center text-[6px]">👑</div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-gray-900 dark:text-gray-200 font-bold truncate max-w-[100px]">
                {task.client?.fullname}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Mijoz</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
               <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Muddati</span>
               <div className="flex items-center gap-1 text-[12px] font-bold text-gray-700 dark:text-gray-300">
                 <Clock size={12} className="text-[#FF9500]" />
                 {deadlineCountdown(task.deadline)}
               </div>
             </div>
             
             <div className="flex flex-col items-end">
               <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Takliflar</span>
               <div className="flex items-center gap-1 text-[12px] font-bold text-gray-700 dark:text-gray-300">
                 <Users size={12} className="text-[#5856D6]" />
                 {task._count?.bids ?? 0}
               </div>
             </div>
          </div>
        </div>

        {/* Assigned Status Overlay */}
        {task.status === 'ASSIGNED' && (
          <div className="absolute inset-0 bg-[#007AFF]/5 rounded-[28px] border-2 border-[#007AFF]/20 pointer-events-none flex items-center justify-center">
            <span className="bg-[#007AFF] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
              Bajarilmoqda
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(TaskCard);
