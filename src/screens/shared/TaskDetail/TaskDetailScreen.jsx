// src/screens/shared/TaskDetail/TaskDetailScreen.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, ChevronDown, ChevronUp,
  MessageSquare, CheckCircle, RotateCcw, AlertTriangle, Star, FileText, Zap
} from 'lucide-react';
import { PageLayout } from '../../../components/layout/PageLayout';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusBadge, UserBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { TaskDetailSkeleton } from '../../../components/ui/SkeletonCard';
import { useTask } from '../../../hooks/useTasks';
import { useAuthStore } from '../../../store/authStore';
import { useChatStore } from '../../../store/chatStore';
import { formatPrice, formatPriceRange, deadlineCountdown, cn } from '../../../lib/utils';
import { showConfirm, hapticLight } from '../../../lib/telegram';
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
import EduViewer from '../../../components/ui/EduViewer';

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
    createBid,
    handleBidSubmit,
    handleRatingSubmit,
    handleRevisionSubmit,
    handleDisputeSubmit,
    handlePromoteSubmit,
    handleDeliverySubmit,
  } = useTaskActions(id);

  const joinRoom = useChatStore((s) => s.joinRoom);
  const leaveRoom = useChatStore((s) => s.leaveRoom);

  const [viewerFile, setViewerFile] = useState(null);

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

  const handleViewFile = async (fileId) => {
    try {
      const res = await filesApi.getUrl(fileId);
      const url = res.data.data.url;
      // Extract filename from fileId (e.g. uploads/2026/06/uuid.pdf -> uuid.pdf)
      const name = fileId.split('/').pop();
      setViewerFile({ url, name, fileId });
    } catch {
      toast.error('Faylni yuklashda xatolik');
    }
  };

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
    if (!user) {
      return (
        <Button fullWidth variant="primary" size="lg" onClick={() => navigate('/')} className="rounded-2xl h-14 font-black shadow-ios-primary">
          Kirish va taklif bering
        </Button>
      );
    }

    // 1. Task is OPEN
    if (task.status === 'OPEN') {
      if (isClient) {
        return (
          <div className="flex gap-2.5 w-full animate-fade-in">
            <Button 
              fullWidth size="lg" variant="primary" 
              onClick={() => navigate(`/tasks/${id}/bids`)}
              className="flex-1 rounded-[22px] shadow-ios-primary h-14 text-[15px] font-black"
            >
              Takliflarni ko'rish {task._count?.bids > 0 && `(${task._count.bids})`}
            </Button>
            <button
              onClick={() => { setPromoteOpen(true); hapticLight(); }}
              className="w-14 h-14 rounded-[20px] bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 active:scale-90 transition-all border border-amber-500/10 shadow-sm"
              title="Vazifani ko'tarish"
            >
              <Zap size={20} fill="currentColor" />
            </button>
          </div>
        );
      } else {
        return (
          <div className="flex flex-col gap-2 w-full">
            <Button 
              fullWidth variant="primary" size="lg" 
              onClick={() => setBidOpen(true)}
              className="rounded-[22px] h-14 text-[15px] font-black shadow-ios-primary"
            >
              Taklif berish
            </Button>
          </div>
        );
      }
    }

    // 2. Task is ASSIGNED
    if (task.status === 'ASSIGNED') {
      if (isFreelancer) {
        return (
          <div className="flex flex-col gap-3 w-full">
            <Button
              fullWidth size="lg" variant="primary"
              isLoading={transitions.startProgress.isPending}
              onClick={() => transitions.startProgress.mutate()}
              className="rounded-2xl h-14 text-[15px] font-black shadow-ios-primary"
            >
              Ishni boshlash 🚀
            </Button>
            <Button
              fullWidth size="md" variant="ghost"
              icon={<MessageSquare size={16} />}
              onClick={() => navigate(`/tasks/${id}/chat`)}
              className="rounded-xl h-12 text-[#007AFF] font-bold"
            >
              Chatga o'tish
            </Button>
          </div>
        );
      } else if (isClient) {
        return (
          <div className="flex flex-col gap-3 w-full">
            <div className="text-[13px] text-center text-gray-400 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-black/[0.03] font-bold">
              ⏳ Ijrochi ishni boshlashini kutilmoqda...
            </div>
            <Button
              fullWidth size="md" variant="outline"
              icon={<MessageSquare size={16} />}
              onClick={() => navigate(`/tasks/${id}/chat`)}
              className="rounded-2xl h-12 border-black/5 dark:border-white/5 font-bold"
            >
              Chatga o'tish
            </Button>
          </div>
        );
      }
    }

    // 3. Task is IN_PROGRESS
    if (task.status === 'IN_PROGRESS') {
      if (isFreelancer) {
        return (
          <div className="flex flex-col gap-3 w-full">
            <Button
              fullWidth size="lg" variant="primary"
              onClick={() => setDeliverySubmitOpen(true)}
              className="rounded-2xl h-14 text-[15px] font-black shadow-ios-primary"
            >
              Natijani yuborish 📤
            </Button>
            <Button
              fullWidth size="md" variant="ghost"
              icon={<MessageSquare size={16} />}
              onClick={() => navigate(`/tasks/${id}/chat`)}
              className="rounded-xl h-12 text-[#007AFF] font-bold"
            >
              Chatga o'tish
            </Button>
          </div>
        );
      } else if (isClient) {
        return (
          <div className="flex flex-col gap-3 w-full">
            <div className="text-[13px] text-center text-[#007AFF] bg-[#007AFF]/5 p-4 rounded-2xl border border-[#007AFF]/10 font-bold">
              ⚙️ Ijrochi vazifa ustida ishlamoqda
            </div>
            <Button
              fullWidth size="md" variant="outline"
              icon={<MessageSquare size={16} />}
              onClick={() => navigate(`/tasks/${id}/chat`)}
              className="rounded-2xl h-12 border-black/5 dark:border-white/5 font-bold"
            >
              Chatga o'tish
            </Button>
          </div>
        );
      }
    }

    // 4. Task is PREVIEW_PENDING
    if (task.status === 'PREVIEW_PENDING') {
      if (isClient) {
        return (
          <div className="flex flex-col gap-3 w-full">
            <Button
              fullWidth size="lg" variant="primary"
              onClick={() => setRatingOpen(true)}
              className="rounded-2xl h-14 text-[15px] font-black shadow-ios-primary"
            >
              Vazifani baholash ⭐
            </Button>
            <Button
              fullWidth size="md" variant="outline"
              icon={<MessageSquare size={16} />}
              onClick={() => navigate(`/tasks/${id}/chat`)}
              className="rounded-2xl h-12 border-black/5 dark:border-white/5 font-bold"
            >
              Chatga o'tish
            </Button>
          </div>
        );
      } else if (isFreelancer) {
        return (
          <div className="flex flex-col gap-3 w-full">
            <div className="text-[13px] text-center text-amber-600 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 font-bold">
              ⏳ Mijoz yuborilgan fayllarni tekshirmoqda
            </div>
            <Button
              fullWidth size="md" variant="outline"
              icon={<MessageSquare size={16} />}
              onClick={() => navigate(`/tasks/${id}/chat`)}
              className="rounded-2xl h-12 border-black/5 dark:border-white/5 font-bold"
            >
              Chatga o'tish
            </Button>
          </div>
        );
      }
    }

    // 5. Task is IN_REVIEW
    if (task.status === 'IN_REVIEW') {
      if (isClient) {
        return (
          <div className="flex flex-col gap-3 w-full">
            <Button
              fullWidth size="lg" variant="primary"
              isLoading={transitions.accept.isPending}
              onClick={async () => {
                await transitions.accept.mutateAsync();
                setRatingOpen(true);
              }}
              className="rounded-2xl h-14 text-[15px] font-black shadow-ios-primary"
            >
              Vazifani qabul qilish ✅
            </Button>
            <div className="flex gap-2">
              <Button
                size="md" variant="secondary" className="flex-1 rounded-xl h-11 text-[13px] font-bold"
                onClick={() => { setRevisionNote(''); setRevisionErrors({}); setRevisionOpen(true); }}
              >
                <RotateCcw size={14} className="mr-1" /> Qayta ishlash
              </Button>
              <Button
                size="md" variant="outline" className="flex-1 rounded-xl h-11 text-[13px] font-bold text-red-500 border-red-500/20"
                onClick={() => { setDisputeReason(''); setDisputeErrors({}); setDisputeOpen(true); }}
              >
                <AlertTriangle size={14} className="mr-1" /> Nizo
              </Button>
            </div>
          </div>
        );
      } else if (isFreelancer) {
        return (
          <div className="flex flex-col gap-3 w-full">
            <div className="text-[13px] text-center text-amber-600 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 font-bold">
              ⏳ Mijoz yakuniy qabul qilishini kutilmoqda...
            </div>
            <Button
              fullWidth size="md" variant="outline"
              icon={<MessageSquare size={16} />}
              onClick={() => navigate(`/tasks/${id}/chat`)}
              className="rounded-2xl h-12 border-black/5 dark:border-white/5 font-bold"
            >
              Chatga o'tish
            </Button>
          </div>
        );
      }
    }

    // 6. Task is COMPLETED
    if (task.status === 'COMPLETED' && isMember) {
      return (
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-[14px] bg-emerald-500/5 py-4 rounded-2xl border border-emerald-500/10">
            <CheckCircle size={16} /> Muvaffaqiyatli yakunlandi
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline" className="flex-1 rounded-xl h-11 text-[13px] font-bold border-black/5 dark:border-white/5"
              icon={<Star size={14} />}
              onClick={() => setRatingOpen(true)}
            >
              Baholash
            </Button>
            <Button
              variant="outline" className="flex-1 rounded-xl h-11 text-[13px] font-bold border-black/5 dark:border-white/5"
              icon={<MessageSquare size={14} />}
              onClick={() => navigate(`/tasks/${id}/chat`)}
            >
              Chat
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const handleCancelTask = async () => {
    hapticLight();
    const ok = await showConfirm(
      "Vazifani bekor qilishni xohlaysizmi?\n\nBu amalni ortga qaytarib bo'lmaydi."
    );
    if (ok) {
      await transitions.cancel.mutateAsync();
      toast.success('Vazifa bekor qilindi');
    }
  };

  return (
    <PageLayout showNav={false} scrollable={false} bgClass="bg-[#F2F2F7] dark:bg-black">
      <div className="flex flex-col h-dvh">
        <TaskHeader 
          task={task} 
          user={user} 
          isMember={isMember} 
          onCancel={handleCancelTask}
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6 space-y-6">
          {/* Status & Timeline Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest" />
                {task.isUrgent && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500/10">
                    <Clock size={10} strokeWidth={3} /> Tezkor
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                <Clock size={12} />
                <span>{deadlineCountdown(task.deadline)} qoldi</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 shadow-ios border border-black/[0.03] dark:border-white/[0.03]">
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

          {/* Title & Description */}
          <div className="space-y-4">
            <div className="px-1 space-y-1">
               <h1 className="text-[22px] font-black font-display text-gray-900 dark:text-white leading-[1.3] tracking-tight">
                {task.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-black text-emerald-600 dark:text-[#30D158]">
                  {formatPriceRange(task.priceMin, task.priceMax)}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                <span className="text-[12px] font-bold text-gray-400 capitalize">{task.category}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-ios border border-black/[0.03] dark:border-white/[0.03] space-y-5">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Vazifa tavsifi</p>
                <div className="relative">
                  <p className={cn(
                    'text-[14px] text-gray-700 dark:text-gray-300 leading-[1.6] font-medium transition-all duration-300',
                    !descExpanded && 'line-clamp-6'
                  )}>
                    {task.description}
                  </p>
                  {task.description?.length > 250 && (
                    <button
                      className="text-[12px] text-[#007AFF] font-bold mt-2 flex items-center gap-1 active:scale-95 bg-white dark:bg-[#1C1C1E] pr-2"
                      onClick={() => setDescExpanded((v) => !v)}
                    >
                      {descExpanded ? 'Yopish' : 'To\'liq oqish'}
                      {descExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                </div>
              </div>

              {task.attachmentFileIds?.length > 0 && isMember && (
                <div className="pt-5 border-t border-gray-100 dark:border-white/5 space-y-3">
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Hujjatlar</p>
                  <div className="grid grid-cols-1 gap-2">
                    {task.attachmentFileIds.map((fileId, idx) => (
                      <button
                        key={fileId}
                        onClick={() => handleViewFile(fileId)}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-black/20 border border-black/[0.02] dark:border-white/[0.02] text-[12px] font-bold text-gray-700 dark:text-gray-300 active:scale-[0.98] transition-all"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] shrink-0">
                          <FileText size={16} />
                        </div>
                        <span className="truncate flex-1 text-left">Fayl #{idx + 1} ni ko'rish</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Members & Feedback */}
          <div className="grid grid-cols-1 gap-3">
             <div 
                onClick={() => navigate(`/profile/${task.client?.id}`)}
                className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-4 shadow-ios border border-black/[0.03] dark:border-white/[0.03] flex items-center gap-3 active:scale-[0.98] transition-all"
              >
                <Avatar name={task.client?.fullname} avatarUrl={task.client?.avatarUrl} size="sm" className="rounded-xl" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate">{task.client?.fullname}</p>
                  <p className="text-[11px] text-gray-400 font-medium">Buyurtmachi</p>
                </div>
                <UserBadge badge={task.client?.badge} isVip={task.client?.isVip} size="xs" />
              </div>

              {task.freelancer && (
                <div 
                  onClick={() => navigate(`/profile/${task.freelancer.id}`)}
                  className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-4 shadow-ios border border-black/[0.03] dark:border-white/[0.03] flex items-center gap-3 active:scale-[0.98] transition-all"
                >
                  <Avatar name={task.freelancer.fullname} avatarUrl={task.freelancer.avatarUrl} size="sm" className="rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate">{task.freelancer.fullname}</p>
                    <p className="text-[11px] text-gray-400 font-medium">Ijrochi</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.freelancer.ratingCount > 0 && (
                      <div className="flex items-center gap-0.5 text-[11px] text-[#FF9500] font-black">
                        <Star size={10} fill="currentColor" />
                        <span>{(task.freelancer.ratingSum / task.freelancer.ratingCount).toFixed(1)}</span>
                      </div>
                    )}
                    <UserBadge badge={task.freelancer.badge} isVip={task.freelancer.isVip} size="xs" />
                  </div>
                </div>
              )}
          </div>

          {/* Alerts & Notes */}
          <div className="space-y-3 pb-24">
            {task.status === 'CANCELED' && (
              <div className="bg-red-500/5 text-red-500 p-5 rounded-[24px] flex items-start gap-3 border border-red-500/10">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-black text-[14px]">Vazifa bekor qilingan</p>
                  <p className="text-[12px] opacity-70 font-medium">Ushbu vazifa buyurtmachi tomonidan bekor qilingan.</p>
                </div>
              </div>
            )}

            {task.status === 'DISPUTED' && (
              <div className="bg-amber-500/5 text-amber-600 p-5 rounded-[24px] flex items-start gap-3 border border-amber-500/10">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-black text-[14px]">Nizo (Dispute) jarayonida</p>
                  <p className="text-[12px] opacity-70 font-medium">Hozirda ma'muriyat vaziyatni o'rganmoqda.</p>
                  {task.dispute?.reason && (
                    <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl italic text-[11px] font-medium text-gray-500">
                      "{task.dispute.reason}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {task.bids?.[0] && task.status !== 'OPEN' && (
              <div className="bg-[#007AFF]/5 rounded-[24px] p-5 border border-[#007AFF]/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-[#007AFF] uppercase tracking-widest">Kelishilgan narx</p>
                  <p className="text-[16px] font-black text-[#007AFF]">{formatPrice(task.agreedPrice || task.bids[0].proposedPrice)} UZS</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
                  <CheckCircle size={20} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className={cn(
          "border-t border-gray-200/50 dark:border-white/5 bg-white/90 dark:bg-black/90 backdrop-blur-2xl pb-safe shadow-ios-lg relative z-20 transition-all duration-500",
          bidOpen ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
        )}>
          <div className="p-4 max-w-[768px] mx-auto">
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

      <EduViewer
        isOpen={!!viewerFile}
        onClose={() => setViewerFile(null)}
        file={viewerFile}
      />
    </PageLayout>
  );
}
