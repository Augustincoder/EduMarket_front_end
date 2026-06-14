import { Star } from 'lucide-react';
import { Avatar } from '../../../../components/ui/Avatar';
import { UserBadge } from '../../../../components/ui/Badge';

export function TaskMembersSection({ task, navigate }) {
  return (
    <div className="grid grid-cols-1 gap-3">
       <div 
          onClick={() => navigate(`/profile/${task.client?.id}`)}
          className="bg-edu-surface rounded-xl p-4 shadow-ios border border-edu-border flex items-center gap-3 active:scale-[0.98] transition-all"
        >
          <Avatar name={task.client?.fullname} avatarUrl={task.client?.avatarUrl} size="sm" className="rounded-xl" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-edu-text truncate">{task.client?.fullname}</p>
            <p className="text-[11px] text-gray-400 font-medium">Buyurtmachi</p>
          </div>
          <UserBadge badge={task.client?.badge} isVip={task.client?.isVip} size="xs" />
        </div>

        {task.isCoWorking && task.collaborators?.length > 0 ? (
          <div className="bg-edu-surface rounded-xl p-4 shadow-ios border border-edu-border space-y-3">
            <p className="text-[11px] font-bold text-edu-muted uppercase tracking-widest mb-1">Jamoa (Study Buddy)</p>
            {task.collaborators.map((c, idx) => (
              <div 
                key={c.id}
                onClick={() => navigate(`/profile/${c.freelancer.id}`)}
                className="flex items-center gap-3 active:scale-[0.98] transition-all pt-2 border-t border-edu-border/30 first:border-0 first:pt-0"
              >
                <Avatar name={c.freelancer.fullname} avatarUrl={c.freelancer.avatarUrl} size="sm" className="rounded-xl" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-edu-text truncate">
                    {c.freelancer.fullname} {idx === 0 ? '(Lider)' : ''}
                  </p>
                  <p className="text-[10px] text-edu-primary font-medium">{c.sharePercent}% ulush</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.freelancer.ratingCount > 0 && (
                    <div className="flex items-center gap-0.5 text-[11px] text-amber-500 font-bold">
                      <Star size={10} fill="currentColor" />
                      <span>{(c.freelancer.ratingSum / c.freelancer.ratingCount).toFixed(1)}</span>
                    </div>
                  )}
                  <UserBadge badge={c.freelancer.badge} isVip={c.freelancer.isVip} size="xs" />
                </div>
              </div>
            ))}
          </div>
        ) : task.freelancer ? (
          <div 
            onClick={() => navigate(`/profile/${task.freelancer.id}`)}
            className="bg-edu-surface rounded-xl p-4 shadow-ios border border-edu-border flex items-center gap-3 active:scale-[0.98] transition-all"
          >
            <Avatar name={task.freelancer.fullname} avatarUrl={task.freelancer.avatarUrl} size="sm" className="rounded-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-edu-text truncate">{task.freelancer.fullname}</p>
              <p className="text-[11px] text-gray-400 font-medium">Ijrochi</p>
            </div>
            <div className="flex items-center gap-2">
              {task.freelancer.ratingCount > 0 && (
                <div className="flex items-center gap-0.5 text-[11px] text-amber-500 font-bold">
                  <Star size={10} fill="currentColor" />
                  <span>{(task.freelancer.ratingSum / task.freelancer.ratingCount).toFixed(1)}</span>
                </div>
              )}
              <UserBadge badge={task.freelancer.badge} isVip={task.freelancer.isVip} size="xs" />
            </div>
          </div>
        ) : null}
    </div>
  );
}
