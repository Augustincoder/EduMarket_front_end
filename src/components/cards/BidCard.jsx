// src/components/cards/BidCard.jsx
import { Check } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { UserBadge } from '../ui/Badge';
import { DisplayRating } from '../ui/StarRating';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export function BidCard({ bid, isSelected, isDisabled, onAccept }) {
  const { freelancer } = bid;
  const isVip = freelancer?.isVip;

  return (
    <div className={cn(
      'bg-edu-surface rounded-2xl p-4 shadow-card border',
      'transition-all duration-200',
      isVip        && 'border-edu-vip/50 bg-gradient-to-br from-edu-surface to-yellow-50/30',
      !isVip       && 'border-edu-border/40',
      isSelected   && 'border-edu-primary ring-2 ring-edu-primary/20',
    )}>
      {/* VIP top label */}
      {isVip && (
        <div className="flex items-center gap-1.5 mb-3 w-fit px-2.5 py-1 rounded-lg bg-gradient-to-r from-edu-vip/20 to-yellow-500/10 border border-edu-vip/30 shadow-sm">
          <span className="text-sm">👑</span>
          <span className="text-edu-vip text-xs font-black tracking-widest uppercase">VIP Freelancer</span>
        </div>
      )}

      {/* Freelancer info */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar
          name={freelancer?.fullname}
          avatarUrl={freelancer?.avatarUrl}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-edu-text truncate">{freelancer?.fullname}</span>
            <UserBadge badge={freelancer?.badge} isVip={isVip} size="xs" />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <DisplayRating
              rating={freelancer?.ratingCount
                ? (freelancer?.ratingSum / freelancer?.ratingCount)
                : 0}
              count={freelancer?.ratingCount}
              size={12}
            />
            {freelancer?.completionRate != null && (
              <span className="text-2xs text-edu-muted">
                {Math.round(freelancer.completionRate)}% yakunlash
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-edu-muted leading-relaxed mb-3 line-clamp-3 italic">
        "{bid.message}"
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xs text-edu-muted">Taklif narxi</p>
          <p className="text-lg font-bold text-edu-text">
            {formatPrice(bid.proposedPrice)} <span className="text-xs font-normal text-edu-muted">so'm</span>
          </p>
        </div>

        {isSelected ? (
          <div className="flex items-center gap-1 text-edu-primary font-semibold text-sm">
            <Check size={16} /> Tanlangan
          </div>
        ) : (
          <Button
            size="sm"
            variant={isVip ? 'vip' : 'primary'}
            disabled={isDisabled}
            onClick={() => onAccept(bid.id)}
          >
            Tanlash
          </Button>
        )}
      </div>
    </div>
  );
}

export default BidCard;
