// src/components/cards/TaskCard.jsx
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { StatusBadge, UrgentBadge, CategoryChip, UserBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { deadlineCountdown, formatPriceRange } from '../../lib/utils';
import { CATEGORIES } from '../../lib/constants';
import { cn } from '../../lib/utils';

import { Card, CardContent } from '../ui/Card';

function TaskCard({ task, variant = 'full', className }) {
  const navigate = useNavigate();
  const catInfo  = CATEGORIES.find((c) => c.value === task.category);

  const handleClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <Card
      isPressable
      onPress={handleClick}
      className={cn(
        'p-3 active-bounce cursor-pointer border-edu-border/30 hover:border-edu-primary/20',
        className
      )}
    >
      <CardContent className="p-0">
        {/* Top row: Badges & Price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {task.isUrgent && <UrgentBadge size="xs" />}
            <CategoryChip
              category={catInfo?.label || task.category}
              emoji={catInfo?.emoji}
              className="text-[10px] py-0.5"
            />
          </div>
          <span className="text-[13px] font-black text-edu-primary bg-edu-primary/5 px-2 py-0.5 rounded-lg border border-edu-primary/10">
            {formatPriceRange(task.priceMin, task.priceMax)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-edu-text text-[15px] font-display line-clamp-2 mb-2 leading-tight">
          {task.title}
        </h3>

        {/* Client & Meta Row */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar
              name={task.client?.fullname}
              avatarUrl={task.client?.avatarUrl}
              size="xs"
              className="w-5 h-5"
            />
            <span className="text-[11px] text-edu-muted font-bold truncate">
              {task.client?.fullname}
            </span>
            {task.client?.isVip && <span className="text-[10px]">👑</span>}
          </div>

          <div className="flex items-center gap-3 text-[10px] font-black text-edu-muted uppercase tracking-tighter shrink-0">
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-orange-500" />
              {deadlineCountdown(task.deadline)}
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} className="text-blue-500" />
              {task._count?.bids ?? 0}
            </span>
          </div>
        </div>

        {/* Assigned Task Banner */}
        {task.status === 'ASSIGNED' && (
          <div className="mt-2.5 w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black py-1.5 px-3 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30 uppercase tracking-wider">
            👉 Chatga o'ting
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(TaskCard);
