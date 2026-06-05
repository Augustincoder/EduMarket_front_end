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
        'group bg-edu-surface p-5 active-spring cursor-pointer border-edu-border/40 hover:border-edu-primary/30 transition-all hover:shadow-lg hover:shadow-black/[0.02] dark:hover:shadow-white/[0.02]',
        className
      )}
      radius="2xl"
    >
      <CardContent className="p-0">
        {/* Top row: Badges & Price */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-edu-bg border border-edu-border/50 text-[10px] font-black text-edu-text uppercase tracking-tight">
              {catInfo?.emoji} {catInfo?.label || task.category}
            </div>
            {task.isUrgent && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-tight border border-red-500/20">
                <Clock size={10} strokeWidth={3} /> Tezkor
              </span>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-black text-edu-primary tracking-tight">
              {formatPriceRange(task.priceMin, task.priceMax)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-edu-text text-[15px] leading-snug tracking-tight line-clamp-2 mb-4 group-hover:text-edu-primary transition-colors">
          {task.title}
        </h3>

        {/* Client & Meta Row */}
        <div className="flex items-center justify-between pt-3.5 border-t border-edu-border/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <Avatar
                name={task.client?.fullname}
                avatarUrl={task.client?.avatarUrl}
                size="xs"
                className="w-6 h-6 rounded-lg ring-2 ring-edu-bg"
              />
              {task.client?.isVip && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-edu-surface flex items-center justify-center text-[5px]">⭐</div>
              )}
            </div>
            <span className="text-[12px] text-edu-muted font-bold truncate tracking-tight">
              {task.client?.fullname}
            </span>
          </div>

          <div className="flex items-center gap-3.5 shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-edu-muted font-black uppercase tracking-tighter opacity-60">Muddat</span>
              <span className="text-[11px] font-bold text-edu-text tracking-tight">
                {deadlineCountdown(task.deadline)}
              </span>
            </div>
            <div className="w-[1px] h-6 bg-edu-border/40" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-edu-muted font-black uppercase tracking-tighter opacity-60">Takliflar</span>
              <span className="text-[11px] font-bold text-edu-text tracking-tight flex items-center gap-1">
                {task._count?.bids ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Task Banner */}
        {task.status === 'ASSIGNED' && (
          <div className="mt-4 w-full bg-gradient-to-r from-edu-primary/10 to-transparent text-edu-primary text-[11px] font-black py-2.5 px-4 rounded-xl flex items-center justify-between border border-edu-primary/20 uppercase tracking-widest animate-pulse-subtle">
            <span>👉 Jarayondagi ish</span>
            <Users size={14} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(TaskCard);
