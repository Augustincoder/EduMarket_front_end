// src/components/cards/BidCard.jsx
import { Check, Star, Crown, MessageCircle } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { UserBadge } from '../ui/Badge';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export function BidCard({ bid, isSelected, isDisabled, isClient, onAccept }) {
  const { freelancer } = bid;
  const isVip = freelancer?.isVip;
  const isRedacted = bid.proposedPrice === null;

  return (
    <div className={cn(
      'group relative bg-edu-surface rounded-[28px] p-5 active:scale-[0.99] transition-all duration-300 border border-edu-border shadow-ios hover:shadow-ios-lg',
      isSelected && 'border-edu-primary/30 ring-4 ring-edu-primary/5',
    )}>
      {/* VIP Badge Overlay */}
      {isVip && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-edu-vip to-amber-500 rounded-full shadow-ios flex items-center gap-1.5 border border-white/20">
          <Crown size={12} className="text-white fill-white" />
          <span className="text-white text-[10px] font-bold uppercase tracking-widest">VIP PRO</span>
        </div>
      )}

      {/* Freelancer info */}
      <div className="flex items-center gap-3.5 mb-4">
        <div className="relative">
          <Avatar
            name={freelancer?.fullname}
            avatarUrl={freelancer?.avatarUrl}
            size="md"
            className="rounded-2xl ring-2 ring-edu-surface shadow-sm"
          />
          {isVip && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-edu-surface flex items-center justify-center text-[10px]">👑</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-edu-text text-[16px] truncate tracking-tight">{freelancer?.fullname}</span>
            <UserBadge badge={freelancer?.badge} isVip={isVip} size="xs" />
          </div>
          <div className="flex items-center gap-2.5 mt-0.5">
            <div className="flex items-center gap-1 text-[12px] font-bold text-amber-500">
              <Star size={12} fill="currentColor" />
              <span>{freelancer?.ratingCount ? (freelancer?.ratingSum / freelancer?.ratingCount).toFixed(1) : '0.0'}</span>
            </div>
            {freelancer?.completionRate != null && (
              <span className="text-[11px] text-edu-muted font-semibold uppercase tracking-wider">
                {Math.round(freelancer.completionRate)}% yakunlangan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Message */}
      <div className={cn(
        "rounded-2xl p-4 mb-5 border relative",
        isRedacted 
          ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-500/10" 
          : "bg-edu-bg border-edu-border"
      )}>
        <MessageCircle size={14} className={cn(
          "absolute -top-1.5 -left-1.5 rounded-full p-0.5",
          isRedacted ? "text-amber-400 bg-edu-surface" : "text-edu-muted bg-edu-surface"
        )} />
        <p className={cn(
          "text-[14px] leading-relaxed font-medium line-clamp-3 italic",
          isRedacted ? "text-amber-600/80 dark:text-amber-500/80" : "text-edu-text"
        )}>
          "{bid.message || 'Hech qanday xabar qoldirilmagan.'}"
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-edu-muted uppercase tracking-widest leading-none">Taklif narxi</p>
          <p className="text-[20px] font-bold text-edu-text tracking-tight flex items-baseline">
            {isRedacted ? (
              <span className="text-sm text-edu-muted blur-[4px] select-none">100 000 UZS</span>
            ) : (
              <>
                {formatPrice(bid.proposedPrice)} <span className="text-[12px] font-semibold text-edu-muted uppercase ml-0.5 tracking-wide">UZS</span>
              </>
            )}
          </p>
        </div>

        {isSelected ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full font-bold text-[13px] uppercase tracking-wider border border-emerald-500/20">
            <Check size={16} strokeWidth={3} /> Tanlangan
          </div>
        ) : isClient ? (
          <Button
            size="md"
            className={cn(
              "rounded-2xl px-6 font-bold uppercase tracking-widest text-[12px] active:scale-95 transition-all shadow-btn",
              isVip ? "bg-gray-900 dark:bg-white text-white dark:text-black" : "bg-edu-primary text-white"
            )}
            disabled={isDisabled}
            onClick={() => onAccept(bid)}
          >
            Tanlash
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default BidCard;
