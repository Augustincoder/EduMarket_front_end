// src/screens/shared/TaskDetail/TaskDetailScreen.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, ChevronDown, ChevronUp,
  MessageSquare, CheckCircle, RotateCcw, AlertTriangle, Star, Sparkles, FileText
} from 'lucide-react';
import { PageLayout } from '../../../components/layout/PageLayout';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusBadge, UserBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { TextArea } from '../../../components/forms/TextArea';
import { TaskDetailSkeleton } from '../../../components/ui/SkeletonCard';
import { useTask } from '../../../hooks/useTasks';
import { useAuthStore } from '../../../store/authStore';
import { useChatStore } from '../../../store/chatStore';
import { useMainButton } from '../../../hooks/useMainButton';
import { formatPrice, formatPriceRange, deadlineCountdown, cn } from '../../../lib/utils';
import { showConfirm } from '../../../lib/telegram';
import toast from 'react-hot-toast';
import { filesApi } from '../../../services/other.service';

// Decomposed Components
import { TaskHeader } from './components/TaskHeader';
import { TaskTimeline } from './components/TaskTimeline';
import { BidModal } from './components/BidModal';
import { RatingModal } from './components/RatingModal';
import { RevisionModal } from './components/RevisionModal';
import { DisputeModal } from './components/DisputeModal';
import { PromoteModal } from './components/PromoteModal';
import { DeliveryPreviewCard } from './components/DeliveryPreviewCard';
import { DeliverySubmitModal } from './components/DeliverySubmitModal';

// Decomposed Hook
import { useTaskActions } from './hooks/useTaskActions';

export default function TaskDetailScreen() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: task, isLoading } = useTask(id);
  const {
    transitions,
    bidOpen, setBidOpen,
    ratingOpen, setRatingOpen,
    revisionOpen, setRevisionOpen,
    disputeOpen, setDisputeOpen,
    bidPrice, setBidPrice,
    bidMsg, setBidMsg,
    bidErrors, setBidErrors,
    rating, setRating,
    ratingComment, setRatingComment,
    ratingErrors, setRatingErrors,
    isRatingLoading,
    revisionNote, setRevisionNote,
    revisionErrors, setRevisionErrors,
    disputeReason, setDisputeReason,
    disputeErrors, setDisputeErrors,
    promoteOpen, setPromoteOpen,
    deliverySubmitOpen, setDeliverySubmitOpen,
    flagOpen, setFlagOpen,
    flagReason, setFlagReason,
    flagErrors, setFlagErrors,
    createBid,
    handleBidSubmit,
    handleRatingSubmit,
    handleRevisionSubmit,
    handleDisputeSubmit,
    handlePromoteSubmit,
    handleDeliverySubmit,
    handleFlagSubmit,
  } = useTaskActions(id);

  const joinRoom = useChatStore((s) => s.joinRoom);
  const leaveRoom = useChatStore((s) => s.leaveRoom);

  useEffect(() => {
    if (id) {
      joinRoom(id);
      return () => leaveRoom(id);
    }
  }, [id, joinRoom, leaveRoom]);

  const [descExpanded, setDescExpanded] = useState(false);

  const isMe      = (uid) => user?.id === uid;
  const isClient  = task ? isMe(task.clientId) : false;
  const isFreelancer = task ? isMe(task.freelancerId) : false;
  const isMember  = isClient || isFreelancer;

  // Determine MainButton state
  let mainBtnText = '';
  let mainBtnClick = () => {};
  let mainBtnLoading = false;

  if (task && user) {
    if (task.status === 'OPEN' && !isClient) {
      mainBtnText = 'Taklif berish';
      mainBtnClick = () => setBidOpen(true);
    } else if (task.status === 'OPEN' && isClient) {
      mainBtnText = 'Takliflarni ko\'rish';
      mainBtnClick = () => navigate(`/tasks/${id}/bids`);
    } else if (task.status === 'ASSIGNED' && isFreelancer) {
      mainBtnText = 'Ishni boshlash';
      mainBtnClick = () => transitions.startProgress.mutate();
      mainBtnLoading = transitions.startProgress.isPending;
    } else if (task.status === 'IN_PROGRESS' && isFreelancer) {
      mainBtnText = 'Natijani yuborish';
      mainBtnClick = () => setDeliverySubmitOpen(true);
      mainBtnLoading = false;
    } else if (task.status === 'PREVIEW_PENDING' && isClient) {
      mainBtnText = 'Vazifani baholash';
      mainBtnClick = () => setRatingOpen(true);
    } else if (task.status === 'IN_REVIEW' && isClient) {
      mainBtnText = 'Vazifani qabul qilish va Baho qoldirish';
      mainBtnClick = async () => {
        await transitions.accept.mutateAsync();
        setRatingOpen(true);
      };
      mainBtnLoading = transitions.accept.isPending;
    }
  }

  useMainButton({
    text: mainBtnText,
    onClick: mainBtnClick,
    isLoading: mainBtnLoading,
  }, [task, user, transitions.startProgress.isPending, transitions.accept.isPending]);

  if (isLoading) {
    return (
      <PageLayout showNav={false} scrollable={false}>
        <div className="flex flex-col h-dvh bg-edu-bg">
          <TaskHeader title="Yuklanmoqda..." showBack />
          <div className="flex-1 overflow-y-auto">
            <TaskDetailSkeleton />
          </div>
        </div>
      </PageLayout>
    );
  }
  if (!task) return null;

  const renderCTA = () => {
    // Flag visibility: user exists, is not client/freelancer, task is open, user is VIP or high rated
    const canFlag = user && !isMember && task.status === 'OPEN' && 
                    (user.isVip || (user.ratingCount >= 5 && (user.ratingSum / user.ratingCount) >= 4.5));

    if (!user) {
      return (
        <div className="p-4">
          <Button fullWidth variant="primary" size="lg" onClick={() => navigate('/')}>
            Kirish va taklif bering
          </Button>
        </div>
      );
    }

    if (canFlag) {
      return (
         <div className="p-4 space-y-2">
            <Button fullWidth variant="primary" size="lg" onClick={mainBtnClick}>
               Taklif berish
            </Button>
            <Button fullWidth variant="ghost" size="md" className="text-red-500 hover:bg-red-50" onClick={() => setFlagOpen(true)}>
               🚩 Qoidabuzarlik haqida shikoyat
            </Button>
         </div>
      );
    }

    if (task.status === 'OPEN' && isClient) {
      return (
        <div className="p-4 space-y-2">
          <Button
            fullWidth size="md" variant="vip"
            icon={<Sparkles size={16} />}
            onClick={() => setPromoteOpen(true)}
          >
            Vazifani ko'tarish
          </Button>
          <Button
            fullWidth size="md" variant="ghost"
            className="text-red-500 hover:bg-red-50"
            isLoading={transitions.cancel.isPending}
            onClick={() => {
              showConfirm("Haqiqatan ham bu vazifani bekor qilmoqchimisiz?", async () => {
                try {
                  await transitions.cancel.mutateAsync();
                  toast.success("Vazifa bekor qilindi");
                } catch (err) {
                  toast.error(err.serverMsg || "Bekor qilishda xato");
                }
              });
            }}
          >
            Vazifani bekor qilish
          </Button>
        </div>
      );
    }

    if (['ASSIGNED', 'IN_PROGRESS'].includes(task.status) && isMember) {
      return (
        <div className="p-4 space-y-2">
          <Button
            fullWidth size="lg" variant="primary"
            icon={<MessageSquare size={18} />}
            onClick={() => navigate(`/tasks/${id}/chat`)}
          >
            Chatga o'tish →
          </Button>
          {isClient && task.status === 'ASSIGNED' && (
            <p className="text-xs text-center text-edu-muted bg-edu-border/20 p-2.5 rounded-xl border border-edu-border/40 font-medium animate-pulse">
              ⏳ Ijrochi ishni boshlashini kutilmoqda...
            </p>
          )}
        </div>
      );
    }

    if (task.status === 'IN_REVIEW' && isClient) {
      return (
        <div className="p-4 space-y-2">
          <div className="flex gap-2">
            <Button
              size="md" variant="secondary" fullWidth
              onClick={() => { setRevisionNote(''); setRevisionErrors({}); setRevisionOpen(true); }}
            >
              <RotateCcw size={14} /> Qayta ishlash
            </Button>
            <Button
              size="md" variant="danger" fullWidth
              onClick={() => { setDisputeReason(''); setDisputeErrors({}); setDisputeOpen(true); }}
            >
              <AlertTriangle size={14} /> Nizo
            </Button>
          </div>
        </div>
      );
    }

    if (task.status === 'COMPLETED' && isMember) {
      return (
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-edu-primary font-bold">
            <CheckCircle size={20} /> Muvaffaqiyatli yakunlandi
          </div>
          <Button
            fullWidth size="md" variant="outline"
            icon={<Star size={16} />}
            onClick={() => setRatingOpen(true)}
          >
            Reyting qoldirish
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <PageLayout showNav={false} scrollable={false} bgClass="bg-[#F2F2F7] dark:bg-black">
      <div className="flex flex-col h-dvh">
        <TaskHeader task={task} user={user} isMember={isMember} />

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6 space-y-5">
          {/* Status & Timeline Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap px-1">
              {task.isUrgent && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] text-[10px] font-black uppercase tracking-widest border border-[#FF3B30]/10 animate-pulse-subtle">
                  <Clock size={10} strokeWidth={3} /> Tezkor
                </span>
              )}
              <StatusBadge status={task.status} className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest" />
            </div>

            <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 shadow-ios border border-black/5 dark:border-white/5">
              <TaskTimeline status={task.status} />
            </div>
            
            {/* Delivery Preview Card */}
            {task.delivery && (isClient || isFreelancer) && (
              <DeliveryPreviewCard 
                delivery={task.delivery} 
                task={task}
                isClient={isClient}
                isFreelancer={isFreelancer}
                isApproving={transitions.approvePreview?.isPending}
                onApprovePreview={async () => {
                  try {
                    await transitions.approvePreview.mutateAsync();
                    toast.success("Muvaffaqiyatli tasdiqlandi!");
                  } catch {
                    // Handled in mutation
                  }
                }}
                onRevealFull={async () => {
                  await transitions.revealFiles.mutateAsync();
                }}
                onLeaveReview={() => setRatingOpen(true)}
              />
            )}
          </div>

          {/* Alerts */}
          {task.status === 'CANCELED' && (
            <div className="bg-[#FF3B30]/10 text-[#FF3B30] p-4 rounded-[24px] flex items-start gap-3 border border-[#FF3B30]/10 shadow-sm">
              <AlertTriangle size={20} className="shrink-0" />
              <div>
                <p className="font-bold text-[15px]">Vazifa bekor qilingan</p>
                <p className="mt-0.5 text-[13px] opacity-80 font-medium">Ushbu vazifa buyurtmachi tomonidan bekor qilingan.</p>
              </div>
            </div>
          )}

          {task.status === 'DISPUTED' && (
            <div className="bg-[#FF9500]/10 text-[#FF9500] p-4 rounded-[28px] flex items-start gap-3 border border-[#FF9500]/10 shadow-sm animate-fade-in">
              <AlertTriangle size={20} className="shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <p className="font-bold text-[15px]">Nizo (Dispute) jarayonida</p>
                <p className="text-[13px] opacity-80 leading-relaxed font-medium">
                  Vazifa yuzasidan kelishmovchilik yuzaga keldi. Hozirda EduMarket ma'muriyati vaziyatni o'rganmoqda.
                </p>
                {task.dispute?.reason && (
                  <div className="bg-white/40 dark:bg-black/20 p-3 rounded-2xl border border-[#FF9500]/10 italic text-[12px]">
                    "{task.dispute.reason}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title & Description */}
          <div className="space-y-4">
            <h1 className="text-[26px] font-black font-display text-gray-900 dark:text-white leading-[1.2] tracking-tight px-1">
              {task.title}
            </h1>

            <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 shadow-ios border border-black/5 dark:border-white/5 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Tavsif</p>
                <p className={cn(
                  'text-[15px] text-gray-800 dark:text-gray-200 leading-[1.5] font-medium transition-all duration-300',
                  !descExpanded && 'line-clamp-4'
                )}>
                  {task.description}
                </p>
                {task.description?.length > 180 && (
                  <button
                    className="text-[13px] text-[#007AFF] font-bold mt-1 flex items-center gap-1 active:scale-95"
                    onClick={() => setDescExpanded((v) => !v)}
                  >
                    {descExpanded ? <><ChevronUp size={14} /> Yopish</> : <><ChevronDown size={14} /> Ko'proq ko'rish</>}
                  </button>
                )}
              </div>

              {task.attachmentFileIds?.length > 0 && isMember && (
                <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-3">
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em]">Biriktirilgan fayllar</p>
                  <div className="grid gap-2">
                    {task.attachmentFileIds.map((fileId, idx) => (
                      <button
                        key={fileId}
                        onClick={async () => {
                          try {
                            const res = await filesApi.getUrl(fileId);
                            window.open(res.data.data.url, '_blank');
                          } catch {
                            toast.error('Xatolik');
                          }
                        }}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 text-[13px] font-bold text-gray-700 dark:text-gray-300 hover:bg-[#007AFF]/5 active:scale-[0.97] transition-all"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
                          <FileText size={16} />
                        </div>
                        <span className="truncate">Fayl #{idx + 1} ni yuklab olish</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Time Info */}
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 shadow-ios border border-black/5 dark:border-white/5 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Narxi</p>
              <p className="text-[17px] font-black text-emerald-600 dark:text-[#30D158] tracking-tight">{formatPriceRange(task.priceMin, task.priceMax)}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Muddati</p>
              <div className="flex items-center justify-end gap-1 text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
                 <Clock size={16} className="text-[#FF9500]" />
                 {deadlineCountdown(task.deadline)}
              </div>
            </div>
          </div>

          {/* Member Cards (Client/Freelancer) */}
          <div className="space-y-3">
             <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Platforma a'zolari</p>
             
             <div className="grid gap-3">
                <div 
                  onClick={() => navigate(`/profile/${task.client?.id}`)}
                  className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-4 shadow-ios border border-black/5 dark:border-white/5 flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Avatar name={task.client?.fullname} avatarUrl={task.client?.avatarUrl} size="md" className="rounded-2xl" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-gray-900 dark:text-white truncate">{task.client?.fullname}</p>
                    <p className="text-[12px] text-gray-400 font-medium uppercase tracking-wider">Mijoz</p>
                  </div>
                  <UserBadge badge={task.client?.badge} isVip={task.client?.isVip} size="xs" />
                </div>

                {task.freelancer && (
                  <div 
                    onClick={() => navigate(`/profile/${task.freelancer.id}`)}
                    className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-4 shadow-ios border border-black/5 dark:border-white/5 flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Avatar name={task.freelancer.fullname} avatarUrl={task.freelancer.avatarUrl} size="md" className="rounded-2xl" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-gray-900 dark:text-white truncate">{task.freelancer.fullname}</p>
                      <p className="text-[12px] text-gray-400 font-medium uppercase tracking-wider">Ijrochi</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <UserBadge badge={task.freelancer.badge} isVip={task.freelancer.isVip} size="xs" />
                      {task.freelancer.ratingCount > 0 && (
                        <div className="flex items-center gap-0.5 text-[11px] text-[#FF9500] font-black">
                          <Star size={10} fill="currentColor" />
                          <span>{(task.freelancer.ratingSum / task.freelancer.ratingCount).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
             </div>
          </div>

          {/* Negotiated Bid Banner */}
          {task.bids?.[0] && task.status !== 'OPEN' && (
            <div className="bg-[#007AFF]/10 rounded-[28px] p-5 border border-[#007AFF]/10 space-y-3">
               <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-[#007AFF] uppercase tracking-[0.15em]">Tasdiqlangan narx</span>
                  <span className="text-[18px] font-black text-[#007AFF] tracking-tight">
                    {formatPrice(task.agreedPrice || task.bids[0].proposedPrice)} UZS
                  </span>
               </div>
               {task.bids[0].message && (
                 <p className="text-[13px] text-gray-700 dark:text-gray-300 italic leading-relaxed bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white/10">
                   "{task.bids[0].message}"
                 </p>
               )}
            </div>
          )}
        </div>

        {/* Bottom CTA Bar */}
        <div className={cn(
          "border-t border-gray-200/50 dark:border-white/5 bg-white/90 dark:bg-black/90 backdrop-blur-2xl pb-safe shadow-ios-lg relative z-20 transition-all duration-500",
          bidOpen ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
        )}>
          <div className="p-4 max-w-[430px] mx-auto">
            {renderCTA()}
          </div>
        </div>
      </div>

      <BidModal
        isOpen={bidOpen}
        onClose={() => setBidOpen(false)}
        task={task}
        bidPrice={bidPrice}
        setBidPrice={setBidPrice}
        bidMsg={bidMsg}
        setBidMsg={setBidMsg}
        bidErrors={bidErrors}
        setBidErrors={setBidErrors}
        isLoading={createBid.isPending}
        onSubmit={handleBidSubmit}
      />

      <RatingModal
        isOpen={ratingOpen}
        onClose={() => setRatingOpen(false)}
        rating={rating}
        setRating={setRating}
        ratingComment={ratingComment}
        setRatingComment={setRatingComment}
        ratingErrors={ratingErrors}
        setRatingErrors={setRatingErrors}
        isLoading={isRatingLoading}
        onSubmit={handleRatingSubmit}
      />

      <RevisionModal
        isOpen={revisionOpen}
        onClose={() => setRevisionOpen(false)}
        revisionNote={revisionNote}
        setRevisionNote={setRevisionNote}
        revisionErrors={revisionErrors}
        setRevisionErrors={setRevisionErrors}
        isLoading={transitions.requestRevision.isPending}
        onSubmit={handleRevisionSubmit}
      />

      <DisputeModal
        isOpen={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        disputeReason={disputeReason}
        setDisputeReason={setDisputeReason}
        disputeErrors={disputeErrors}
        setDisputeErrors={setDisputeErrors}
        isLoading={transitions.dispute.isPending}
        onSubmit={handleDisputeSubmit}
      />

      <PromoteModal
        isOpen={promoteOpen}
        onClose={() => setPromoteOpen(false)}
        isLoading={transitions.promote.isPending}
        onSubmit={handlePromoteSubmit}
      />

      <DeliverySubmitModal
        isOpen={deliverySubmitOpen}
        onClose={() => setDeliverySubmitOpen(false)}
        onSubmit={handleDeliverySubmit}
        isSubmitting={transitions.deliverPreview?.isPending}
      />

      <Modal
        isOpen={flagOpen}
        onClose={() => setFlagOpen(false)}
        title="Qoidabuzarlik haqida shikoyat"
        footer={
          <Button fullWidth variant="danger" onClick={handleFlagSubmit} isLoading={transitions.flagTask?.isPending}>
            Shikoyat qilish
          </Button>
        }
      >
        <div className="py-2">
          <p className="text-sm text-edu-muted mb-4">
            Agar bu vazifa platforma qoidalariga zid bo'lsa (masalan: firibgarlik, noo'rin kontent), iltimos sababini batafsil yozing.
          </p>
          <TextArea
            label="Sabab *"
            placeholder="Shikoyat sababi..."
            value={flagReason}
            onValueChange={(v) => { setFlagReason(v); setFlagErrors(e => ({ ...e, reason: null })); }}
            maxLength={1000}
            minRows={4}
            error={flagErrors.reason?.[0]}
          />
        </div>
      </Modal>
    </PageLayout>
  );
}
