// src/components/cards/BidCard.jsx
import { Check, Star, Crown, MessageCircle, ArrowRightLeft } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { UserBadge } from '../ui/Badge';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useMemo } from 'react';

export function BidCard({ bid, task, isSelected, isDisabled, isClient, onAccept, onCounter, customAcceptLabel }) {
  const { freelancer } = bid;
  const isVip = freelancer?.isVip;
  const isRedacted = bid.proposedPrice === null;

  // Calculate percentage diff vs budget
  const priceDiffInfo = useMemo(() => {
    if (isRedacted || !task?.priceMax) return null;
    const proposed = bid.proposedPrice;
    const maxBudget = task.priceMax;
    
    if (proposed > maxBudget) {
      const percent = Math.round(((proposed - maxBudget) / maxBudget) * 100);
      return { type: 'over', text: `+${percent}% byudjetdan yuqori`, color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    }
    if (proposed < task.priceMin) {
      const percent = Math.round(((task.priceMin - proposed) / task.priceMin) * 100);
      return { type: 'under', text: `-${percent}% arzonroq`, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    }
    return { type: 'within', text: `Byudjet ichida`, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
  }, [bid.proposedPrice, task, isRedacted]);

  return (
    <div className={cn(
      'group relative card-base p-5 transition-all duration-300',
      isSelected && 'border-edu-primary/30 ring-4 ring-edu-primary/5',
    )}>
      {/* VIP Badge Overlay */}
      {isVip && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-ios flex items-center gap-1.5 border border-white/20">
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
            className="rounded-lg ring-2 ring-edu-surface shadow-sm"
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
        "rounded-lg p-4 mb-5 border relative",
        isRedacted 
          ? "bg-edu-warn-l border-edu-warn/20" 
          : "bg-edu-bg border-edu-border"
      )}>
        <MessageCircle size={14} className={cn(
          "absolute -top-1.5 -left-1.5 rounded-full p-0.5",
          isRedacted ? "text-amber-400 bg-edu-surface" : "text-edu-muted bg-edu-surface"
        )} />
        <p className={cn(
          "text-[14px] leading-relaxed font-medium line-clamp-3 italic",
          isRedacted ? "text-edu-warn/80" : "text-edu-text"
        )}>
          "{bid.message || 'Hech qanday xabar qoldirilmagan.'}"
        </p>
      </div>

      {/* Counter Offer Status if any */}
      {bid.counterPrice && (
        <div className="mb-4 p-3 bg-edu-info-l border border-edu-info/20 rounded-md">
          <div className="flex items-center gap-1.5 text-edu-info font-bold text-xs mb-1">
            <ArrowRightLeft size={14} /> Karshi taklif yuborildi
          </div>
          <p className="text-edu-info text-sm">{formatPrice(bid.counterPrice)} UZS</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-end justify-between pt-1">
        <div className="space-y-1">
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
          {priceDiffInfo && (
            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase ${priceDiffInfo.color}`}>
              {priceDiffInfo.text}
            </div>
          )}
        </div>

        {isSelected ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full font-bold text-[13px] uppercase tracking-wider border border-emerald-500/20">
            <Check size={16} strokeWidth={3} /> {customAcceptLabel || 'Tanlangan'}
          </div>
        ) : isClient ? (
          <div className="flex flex-col gap-2">
            <Button
              size="md"
              className={cn(
                "rounded-lg px-6 font-bold uppercase tracking-widest text-[12px] active:scale-95 transition-all shadow-btn",
                isVip ? "bg-edu-text text-edu-bg" : "bg-edu-primary text-white"
              )}
              disabled={isDisabled}
              onClick={() => onAccept(bid)}
            >
              {customAcceptLabel || 'Tanlash'}
            </Button>
            <button
              disabled={isDisabled}
              onClick={() => onCounter?.(bid)}
              className="text-[11px] font-bold text-edu-muted hover:text-edu-primary uppercase tracking-widest text-center py-1 transition-colors disabled:opacity-50"
            >
              Savdolashish
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default BidCard;
