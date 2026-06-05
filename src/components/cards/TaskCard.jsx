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
        'p-4 active-spring cursor-pointer border-edu-border/20 shadow-ios',
        className
      )}
    >
      <CardContent className="p-0">
        {/* Top row: Badges & Price */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {task.isUrgent && <UrgentBadge size="xs" />}
            <CategoryChip
              category={catInfo?.label || task.category}
              emoji={catInfo?.emoji}
              className="text-[9px] py-0.5 tracking-wider bg-edu-surface-2 border-none font-black"
            />
          </div>
          <span className="text-[14px] font-bold text-edu-primary tracking-ios-text">
            {formatPriceRange(task.priceMin, task.priceMax)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-edu-text text-[16px] tracking-ios-display line-clamp-2 mb-3 leading-tight">
          {task.title}
        </h3>

        {/* Client & Meta Row */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-edu-border/10">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              name={task.client?.fullname}
              avatarUrl={task.client?.avatarUrl}
              size="xs"
              className="w-5 h-5 rounded-lg"
            />
            <span className="text-[12px] text-edu-muted font-semibold truncate tracking-ios-text">
              {task.client?.fullname}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold text-edu-muted uppercase tracking-wider shrink-0">
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
          <div className="mt-3 w-full bg-edu-primary/5 text-edu-primary text-[10px] font-black py-2 px-3 rounded-2xl flex items-center justify-center border border-edu-primary/10 uppercase tracking-widest">
            👉 Chatga o'ting
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(TaskCard);
