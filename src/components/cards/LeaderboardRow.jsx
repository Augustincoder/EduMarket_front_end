// src/components/cards/LeaderboardRow.jsx
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { UserBadge } from '../ui/Badge';
import { Star } from 'lucide-react';

export function LeaderboardRow({ user, rank, isCurrentUser }) {
  const navigate = useNavigate();
  const { id, fullname, username, avatarUrl, ratingSum, ratingCount, completionRate, isVip, badge } = user;

  const rating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '0.0';

  const handleClick = () => {
    navigate(`/profile/${id}`);
  };

  const getRankBadge = (r) => {
    if (r === 1) return '🥇';
    if (r === 2) return '🥈';
    if (r === 3) return '🥉';
    return `#${r}`;
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer active:scale-95 duration-[120ms] ${
        isCurrentUser
          ? 'bg-edu-primary/10 border-edu-primary shadow-btn'
          : 'bg-edu-surface border-edu-border hover:border-edu-primary/30'
      }`}
    >
      {/* Rank */}
      <div className={`w-8 text-center font-bold text-sm ${rank <= 3 ? 'text-lg' : 'text-edu-muted'}`}>
        {getRankBadge(rank)}
      </div>

      {/* Avatar */}
      <Avatar name={fullname} avatarUrl={avatarUrl} size="md" />

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-edu-text truncate">{fullname}</span>
          <UserBadge badge={badge} isVip={isVip} size="xs" />
        </div>
        <div className="text-2xs text-edu-muted truncate">@{username}</div>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-0.5 text-xs font-bold text-edu-vip">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{rating}</span>
        </div>
        <div className="text-2xs text-edu-muted">
          {completionRate ? `${completionRate}% bitirgan` : "0% bitirgan"}
        </div>
      </div>
    </div>
  );
}

export default LeaderboardRow;
