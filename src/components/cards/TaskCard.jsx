// src/components/cards/TaskCard.jsx
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { StatusBadge, UrgentBadge, CategoryChip, UserBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { deadlineCountdown, formatPriceRange } from '../../lib/utils';
import { CATEGORIES } from '../../lib/constants';
import { hapticLight } from '../../lib/telegram';
import { cn } from '../../lib/utils';

function TaskCard({ task, variant = 'full', className }) {
  const navigate = useNavigate();
  const catInfo  = CATEGORIES.find((c) => c.value === task.category);

  const handleClick = () => {
    hapticLight();
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'bg-edu-surface rounded-[24px] p-5 shadow-sm active-bounce cursor-pointer',
        'border border-edu-border/40 transition-all duration-300',
        'hover:shadow-lg hover:border-edu-primary/20',
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-center gap-2 flex-wrap mb-2.5">
        {task.isUrgent && <UrgentBadge size="xs" />}
        <CategoryChip
          category={catInfo?.label || task.category}
          emoji={catInfo?.emoji}
        />
        <StatusBadge status={task.status} size="xs" />
      </div>

      {/* Title */}
      <h3 className="font-bold text-edu-text text-md font-display line-clamp-2 mb-2.5 leading-snug">
        {task.title}
      </h3>

      {/* Client row */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar
          name={task.client?.fullname}
          avatarUrl={task.client?.avatarUrl}
          size="xs"
        />
        <span className="text-xs text-edu-muted font-medium truncate">
          {task.client?.fullname}
        </span>
        {task.client?.badge && (
          <UserBadge badge={task.client.badge} isVip={task.client?.isVip} size="xs" />
        )}
      </div>

      {/* Price */}
      <p className="text-md font-bold text-edu-text mb-2.5">
        {formatPriceRange(task.priceMin, task.priceMax)}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-edu-muted mb-3">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {deadlineCountdown(task.deadline)}
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {task._count?.bids ?? 0} taklif
        </span>
      </div>

      {/* Assigned Task Banner */}
      {task.status === 'ASSIGNED' && (
        <div className="mt-2 w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
          👉 Chatga o'ting va vazifani boshlang
        </div>
      )}
    </div>
  );
}

export default memo(TaskCard);
