// src/components/cards/GigCard.jsx
import { Clock } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { UserBadge } from '../ui/Badge';
import { DisplayRating } from '../ui/StarRating';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';
import { hapticLight } from '../../lib/telegram';
import { cn } from '../../lib/utils';

export function GigCard({ gig, onOrder }) {
  const { freelancer } = gig;

  return (
    <div className={cn(
      'bg-edu-surface rounded-2xl p-4 shadow-card border border-edu-border/40',
      'transition-all duration-200 hover:shadow-md hover:border-edu-primary/20'
    )}>
      {/* Freelancer */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={freelancer?.fullname} avatarUrl={freelancer?.avatarUrl} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-edu-text text-sm truncate">{freelancer?.fullname}</span>
            <UserBadge badge={freelancer?.badge} isVip={freelancer?.isVip} size="xs" />
          </div>
          <DisplayRating
            rating={freelancer?.ratingCount
              ? (freelancer?.ratingSum / freelancer?.ratingCount)
              : 0}
            count={freelancer?.ratingCount}
            size={12}
          />
        </div>
      </div>

      {/* Gig title */}
      <h3 className="font-bold text-edu-text text-md font-display line-clamp-2 mb-1 leading-snug">
        {gig.title}
      </h3>
      {gig.description && (
        <p className="text-xs text-edu-muted line-clamp-2 mb-3 leading-relaxed">
          {gig.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-edu-border/50">
        <div>
          <p className="text-2xs text-edu-muted mb-0.5">Narx</p>
          <p className="text-lg font-bold text-edu-primary">
            {formatPrice(gig.price)} <span className="text-xs font-normal text-edu-muted">so'm</span>
          </p>
          <p className="flex items-center gap-1 text-2xs text-edu-muted mt-0.5">
            <Clock size={10} /> {gig.deliveryDays} kun ichida
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => { onOrder?.(gig); }}
        >
          Buyurtma
        </Button>
      </div>
    </div>
  );
}

export default GigCard;
