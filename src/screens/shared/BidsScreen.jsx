// src/screens/BidsScreen.jsx
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import BidCard from '../../components/cards/BidCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/forms/TextInput';
import { TaskCardSkeleton } from '../../components/ui/SkeletonCard';
import { useTaskBids, useAcceptBid, useTask } from '../../hooks/useTasks';
import { useAuthStore } from '../../store/authStore';
import { hapticSuccess, hapticLight } from '../../lib/telegram';
import { trackEvent } from '../../lib/observability';
import { formatPrice } from '../../lib/utils';
import { SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Eng yangi' },
  { value: 'priceAsc', label: 'Eng arzon' },
  { value: 'ratingDesc', label: 'Yuqori reyting' }
];

export default function BidsScreen() {
  const { id }  = useParams();
  const { data: bids, isLoading: isBidsLoading } = useTaskBids(id);
  const { data: task, isLoading: isTaskLoading } = useTask(id);
  const acceptBid = useAcceptBid(id);
  
  const [confirming, setConfirming] = useState(null);
  const [countering, setCountering] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  const user = useAuthStore((s) => s.user);
  const isLoading = isBidsLoading || isTaskLoading;

  const handleAccept = async () => {
    await acceptBid.mutateAsync(confirming.id);
    hapticSuccess();
    trackEvent('Bid Accepted', {
      taskId: id,
      bidId: confirming.id,
      price: confirming.proposedPrice,
    });
    setConfirming(null);
  };

  const handleCounterSubmit = () => {
    if (!counterPrice) return toast.error("Narxni kiriting");
    hapticSuccess();
    toast.success("Qarshi taklif yuborildi!");
    setCountering(null);
    setCounterPrice('');
  };

  const [displayLimit, setDisplayLimit] = useState(10);
  
  const sortedBids = useMemo(() => {
    if (!bids) return [];
    let result = [...bids];
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.proposedPrice - b.proposedPrice);
    } else if (sortBy === 'ratingDesc') {
      result.sort((a, b) => {
        const aRating = a.freelancer?.ratingCount ? a.freelancer.ratingSum / a.freelancer.ratingCount : 0;
        const bRating = b.freelancer?.ratingCount ? b.freelancer.ratingSum / b.freelancer.ratingCount : 0;
        return bRating - aRating;
      });
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  }, [bids, sortBy]);

  const displayedBids = useMemo(() => {
    return sortedBids.slice(0, displayLimit);
  }, [sortedBids, displayLimit]);

  const hasMore = sortedBids.length > displayLimit;

  return (
    <PageLayout showNav={false} bgClass="bg-edu-bg dark:bg-black">
      <Header title={`Takliflar (${bids?.length ?? 0})`} showBack className="bg-edu-surface/60 backdrop-blur-md" />

      <div className="px-4 py-4">
        {/* Sort Controls */}
        {bids?.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            <div className="flex items-center gap-2 bg-edu-surface rounded-xl p-1 border border-edu-border/50">
              <div className="pl-3 pr-2 flex items-center gap-2 border-r border-edu-border/50">
                <SlidersHorizontal size={14} className="text-edu-muted" />
                <span className="text-[10px] font-bold text-edu-muted uppercase tracking-widest">Saralash:</span>
              </div>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); hapticLight(); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    sortBy === opt.value ? 'bg-edu-bg shadow-sm text-edu-primary' : 'text-edu-muted hover:text-edu-text'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 mt-2">
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <TaskCardSkeleton key={i} />)}
            </div>
          ) : !bids?.length ? (
            <EmptyState emoji="🤷" title="Hali hech kim taklif bermagan" subtitle="Biroz kuting..." />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedBids.map((bid) => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    task={task}
                    isSelected={!!bid.isAccepted}
                    isDisabled={bids.some(b => b.isAccepted)}
                    isClient={user?.id === task?.clientId}
                    onAccept={(bid) => { setConfirming(bid); hapticLight(); }}
                    onCounter={(bid) => { setCountering(bid); setCounterPrice(String(bid.proposedPrice)); hapticLight(); }}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center pt-6 pb-10">
                  <Button variant="secondary" onClick={() => setDisplayLimit(p => p + 10)} className="rounded-2xl px-8 font-bold uppercase tracking-widest text-[12px] h-11">
                    Ko'proq ko'rsatish
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Defensive Confirmation Modal */}
      <Modal
        isOpen={!!confirming}
        onClose={() => setConfirming(null)}
        title="Rozilikni tasdiqlang"
        footer={
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setConfirming(null)} className="h-12 rounded-[18px]">Bekor</Button>
            <Button variant="primary" fullWidth isLoading={acceptBid.isPending} onClick={handleAccept} className="h-12 rounded-[18px] bg-emerald-500 shadow-ios">✅ Tasdiqlash</Button>
          </div>
        }
      >
        <div className="text-center space-y-4 py-3">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-xl p-3 text-xs font-medium">
            Diqqat! Tasdiqlaganingizdan so'ng, topshiriq boshqa freelancerlarga ko'rinmaydi.
          </div>
          <div className="space-y-1">
            <p className="text-[13px] text-edu-muted">Ijrochi</p>
            <p className="text-[18px] text-edu-text font-bold">{confirming?.freelancer?.fullname}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[13px] text-edu-muted">Narx</p>
            <p className="text-3xl text-emerald-500 font-bold tracking-tight">
              {formatPrice(confirming?.proposedPrice)} UZS
            </p>
          </div>
        </div>
      </Modal>

      {/* Counter Offer Bottom Sheet */}
      <BottomSheet
        isOpen={!!countering}
        onClose={() => setCountering(null)}
        title="Qarshi taklif"
      >
        <div className="space-y-5 py-2">
          <div className="bg-edu-primary/5 rounded-2xl p-4 flex items-center justify-between border border-edu-primary/10">
            <div>
              <p className="text-[10px] font-bold text-edu-muted uppercase tracking-widest mb-1">Joriy taklif</p>
              <p className="text-sm font-bold">{formatPrice(countering?.proposedPrice)} UZS</p>
            </div>
            <div className="text-2xl">🤝</div>
          </div>
          
          <TextInput
            label="Sizning narxingiz (UZS)"
            type="number"
            value={counterPrice}
            onValueChange={setCounterPrice}
            placeholder="O'z narxingizni yozing..."
          />
          
          <div className="pt-2">
            <Button fullWidth size="lg" variant="primary" onClick={handleCounterSubmit} className="h-14 rounded-xl shadow-ios-primary font-bold">
              Yuborish
            </Button>
          </div>
        </div>
      </BottomSheet>
    </PageLayout>
  );
}
