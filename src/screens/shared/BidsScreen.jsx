// src/screens/BidsScreen.jsx
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import BidCard from '../../components/cards/BidCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { TaskCardSkeleton } from '../../components/ui/SkeletonCard';
import { useTaskBids, useAcceptBid, useTask } from '../../hooks/useTasks';
import { useAuthStore } from '../../store/authStore';
import { hapticSuccess } from '../../lib/telegram';
import { trackEvent } from '../../lib/observability';

export default function BidsScreen() {
  const { id }  = useParams();
  const { data: bids, isLoading: isBidsLoading } = useTaskBids(id);
  const { data: task, isLoading: isTaskLoading } = useTask(id);
  const acceptBid = useAcceptBid(id);
  const [confirming, setConfirming] = useState(null);
  const user = useAuthStore((s) => s.user);

  // Anyone can view the BidsScreen now (Client sees all, freelancers see redacted)

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

  const [displayLimit, setDisplayLimit] = useState(10);
  const displayedBids = useMemo(() => {
    if (!bids) return [];
    return bids.slice(0, displayLimit);
  }, [bids, displayLimit]);

  const hasMore = bids && bids.length > displayLimit;

  return (
    <PageLayout showNav={false} bgClass="bg-edu-bg dark:bg-black">
      <Header title={`Takliflar (${bids?.length ?? 0} ta)`} showBack className="ios-glass" />

      <div className="px-4 py-6 space-y-4">
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
                  isSelected={!!bid.isAccepted}
                  isDisabled={bids.some(b => b.isAccepted)}
                  isClient={user?.id === task?.clientId}
                  onAccept={(bid) => setConfirming(bid)}
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

      <Modal
        isOpen={!!confirming}
        onClose={() => setConfirming(null)}
        title="Tasdiqlang"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setConfirming(null)}>Bekor</Button>
            <Button variant="primary" fullWidth isLoading={acceptBid.isPending} onClick={handleAccept}>✅ Tasdiqlash</Button>
          </div>
        }
      >
        <div className="text-center space-y-2 py-2">
          <p className="text-edu-text font-medium">{confirming?.freelancer?.fullname}ni tanlaysizmi?</p>
          <p className="text-edu-muted text-sm">Narx: {confirming?.proposedPrice?.toLocaleString()} so'm</p>
          <p className="text-xs text-edu-muted">Boshqa takliflar yopiladi</p>
        </div>
      </Modal>
    </PageLayout>
  );
}
