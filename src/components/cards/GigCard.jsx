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
      'bg-edu-surface squircle p-5 shadow-ios border border-edu-border/30',
      'transition-all duration-300 hover:border-edu-primary/30'
    )}>
      {/* Freelancer */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={freelancer?.fullname} avatarUrl={freelancer?.avatarUrl} size="md" className="shadow-sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-edu-text text-[14px] tracking-ios-text truncate">{freelancer?.fullname}</span>
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
      <h3 className="font-black text-edu-text text-[17px] font-display tracking-ios-display line-clamp-2 mb-2 leading-tight">
        {gig.title}
      </h3>
      {gig.description && (
        <p className="text-[13px] text-edu-muted line-clamp-2 mb-4 leading-relaxed font-medium tracking-ios-text">
          {gig.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-4 border-t border-edu-border/10">
        <div>
          <p className="text-[10px] font-black text-edu-muted uppercase tracking-widest mb-1">Narxi</p>
          <p className="text-xl font-black text-edu-primary tracking-ios-display">
            {formatPrice(gig.price)} <span className="text-[11px] font-bold text-edu-muted uppercase">so'm</span>
          </p>
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-edu-muted mt-1 tracking-ios-text">
            <Clock size={12} className="text-edu-primary" /> {gig.deliveryDays} kun yetkazib berish
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          className="shadow-btn px-6 rounded-xl"
          onClick={() => { hapticLight(); onOrder?.(gig); }}
        >
          Buyurtma
        </Button>
      </div>
    </div>
  );
}

export default GigCard;
