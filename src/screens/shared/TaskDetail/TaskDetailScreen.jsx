// src/screens/shared/TaskDetail/TaskDetailScreen.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Star, FileText
} from 'lucide-react';
import { PageLayout } from '../../../components/layout/PageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../../../components/ui/Avatar';
import { useTick } from '../../../hooks/useTick';
import { StatusBadge, UserBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { TaskDetailSkeleton } from '../../../components/ui/SkeletonCard';
import { useTask } from '../../../hooks/useTasks';
import { useAuthStore } from '../../../store/authStore';
import { useChatStore } from '../../../store/chatStore';
import { formatPrice, formatPriceRange, deadlineCountdown, cn } from '../../../lib/utils';
import { showConfirm, hapticLight } from '../../../lib/telegram';
import toast from 'react-hot-toast';
// import { filesApi } from '../../../services/other.service';

// Decomposed Components
import { TaskHeader } from './components/TaskHeader';
import { TaskTimeline } from './components/TaskTimeline';
import { BidModal } from './components/BidModal';
import { RatingModal } from './components/RatingModal';
import { RevisionModal } from './components/RevisionModal';
import { DisputeModal } from './components/DisputeModal';
import { PromoteModal } from './components/PromoteModal';
import { DeliveryPreviewCard } from './components/DeliveryPreviewCard';
import { TaskMetadata } from '../../../components/cards/TaskMetadata';
import { DeliverySubmitModal } from './components/DeliverySubmitModal';
import { StartWorkModal } from './components/StartWorkModal';
import { AcceptDeliveryModal } from './components/AcceptDeliveryModal';
import { TaskActionButtons } from './components/TaskActionButtons';
import EduViewer from '../../../components/ui/EduViewer';

// Decomposed Hook
import { useTaskActions } from './hooks/useTaskActions';

export default function TaskDetailScreen() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const user = useAuthStore((s) => s.user);
  const now = useTick(1000);

  const { data: task, isLoading, error } = useTask(id);
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
    disputeDescription, setDisputeDescription,
    disputeFiles, setDisputeFiles,
    disputeErrors, setDisputeErrors,
    promoteOpen, setPromoteOpen,
    deliverySubmitOpen, setDeliverySubmitOpen,
    startWorkOpen, setStartWorkOpen,
    acceptDeliveryOpen, setAcceptDeliveryOpen,
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
      const name = fileId.split('/').pop();
      const ext = name.split('.').pop().toLowerCase();
      
      let mimeType = 'application/octet-stream';
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) mimeType = `image/${ext}`;
      else if (ext === 'pdf') mimeType = 'application/pdf';
      else if (ext === 'txt') mimeType = 'text/plain';
      else if (ext === 'json') mimeType = 'application/json';

      const isPreviewFile = task.delivery?.previewFileIds?.includes(fileId);
      const isDeliveryFile = task.delivery?.fullFileIds?.includes(fileId);
      
      let isPaid = true;
      if (isClient) {
        if ((isPreviewFile || isDeliveryFile) && task.status !== 'COMPLETED') isPaid = false;
      }
      
      setViewerFile({ fileId, name, mimeType, isPaid });
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

  if (error) {
    return (
      <PageLayout showNav={false} scrollable={false}>
        <div className="flex flex-col h-dvh bg-edu-bg">
          <TaskHeader title="Xatolik" showBack />
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
            <div className="w-full bg-edu-surface border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-edu-text mb-1">Vazifani yuklashda xatolik</h3>
              <p className="text-[11px] text-edu-muted font-medium mb-4 max-w-[200px]">Server bilan ulanishda xatolik yoki vazifa mavjud emas. Iltimos qayta urinib ko'ring.</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="rounded-xl h-9 text-xs font-bold border-edu-border">
                Qayta yuklash
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!task) return null;

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

  const timeToDeadline = new Date(task?.deadline || 0) - now;
  const isUrgentDeadline = timeToDeadline > 0 && timeToDeadline < 2 * 3600 * 1000; // less than 2 hours
  const isDeadlinePassed = timeToDeadline <= 0;

  // Edge cases variables
  const hoursSinceAssigned = task?.assignedAt ? (now - new Date(task.assignedAt)) / 3600000 : 0;
  const isFreelancerGhosting = task?.status === 'ASSIGNED' && hoursSinceAssigned > 48;
  
  const hoursSinceDelivery = task?.delivery?.submittedAt ? (now - new Date(task.delivery.submittedAt)) / 3600000 : 0;
  const hoursToAutoAccept = Math.max(0, 48 - hoursSinceDelivery);

  return (
    <PageLayout showNav={false} scrollable={false} bgClass="bg-edu-bg">
      <div className="flex flex-col h-dvh">
        <TaskHeader 
          task={task} 
          user={user} 
          isMember={isMember} 
          onCancel={handleCancelTask}
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6 space-y-6 pb-32">
          {/* Status & Timeline Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest" />
                {task.isUrgent && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[9px] font-bold uppercase tracking-widest border border-red-500/10">
                    <Clock size={10} strokeWidth={3} /> Tezkor
                  </span>
                )}
              </div>
              <div className={cn(
                "flex items-center gap-1.5 text-[11px] font-bold transition-colors duration-500",
                isDeadlinePassed ? "text-red-500" : isUrgentDeadline ? "text-amber-500 animate-pulse" : "text-gray-400"
              )}>
                <Clock size={12} />
                <span>{isDeadlinePassed ? "Muddati o'tgan" : `${deadlineCountdown(task.deadline)} qoldi`}</span>
              </div>
            </div>

            <div className="bg-edu-surface rounded-xl p-5 shadow-ios border border-edu-border">
              <TaskTimeline status={task.status} />
            </div>
            
            {/* Delivery Preview Card */}
            {task.delivery && (isClient || isFreelancer) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
              >
                <DeliveryPreviewCard 
                  delivery={task.delivery} 
                  task={task}
                  isClient={isClient}
                  isFreelancer={isFreelancer}
                  isApproving={transitions.approvePreview?.isPending}
                  onApprovePreview={() => setAcceptDeliveryOpen(true)}
                  onRevealFull={async () => {
                    await transitions.revealFiles.mutateAsync();
                  }}
                  onLeaveReview={() => setRatingOpen(true)}
                />
              </motion.div>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <div className="px-1 space-y-1">
               <h1 className="text-2xl font-bold font-display text-edu-text leading-[1.3] tracking-tight">
                {task.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-500">
                  {formatPriceRange(task.priceMin, task.priceMax)}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                <span className="text-[12px] font-bold text-gray-400 capitalize">{task.category}</span>
              </div>
              <TaskMetadata category={task.category} metadata={task.metadata} />
            </div>

            <div className="bg-edu-surface rounded-xl p-6 shadow-ios border border-edu-border space-y-5">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-edu-muted uppercase tracking-[0.15em]">Vazifa tavsifi</p>
                <div className="relative">
                  <p className={cn(
                    'text-[14px] text-gray-700 dark:text-gray-300 leading-[1.6] font-medium transition-all duration-300',
                    !descExpanded && 'line-clamp-6'
                  )}>
                    {task.description}
                  </p>
                  {task.description?.length > 250 && (
                    <button
                      className="text-[12px] text-edu-primary font-bold mt-2 flex items-center gap-1 active:scale-95 bg-edu-surface pr-2"
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
                  <p className="text-[10px] font-bold text-edu-muted uppercase tracking-[0.15em]">Hujjatlar</p>
                  <div className="grid grid-cols-1 gap-2">
                    {task.attachmentFileIds.map((fileId, idx) => (
                      <button
                        key={fileId}
                        onClick={() => handleViewFile(fileId)}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-black/20 border border-black/[0.02] dark:border-white/[0.02] text-[12px] font-bold text-gray-700 dark:text-gray-300 active:scale-[0.98] transition-all"
                      >
                        <div className="w-8 h-8 rounded-xl bg-edu-primary/10 flex items-center justify-center text-edu-primary shrink-0">
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
                className="bg-edu-surface rounded-xl p-4 shadow-ios border border-edu-border flex items-center gap-3 active:scale-[0.98] transition-all"
              >
                <Avatar name={task.client?.fullname} avatarUrl={task.client?.avatarUrl} size="sm" className="rounded-xl" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-edu-text truncate">{task.client?.fullname}</p>
                  <p className="text-[11px] text-gray-400 font-medium">Buyurtmachi</p>
                </div>
                <UserBadge badge={task.client?.badge} isVip={task.client?.isVip} size="xs" />
              </div>

              {task.freelancer && (
                <div 
                  onClick={() => navigate(`/profile/${task.freelancer.id}`)}
                  className="bg-edu-surface rounded-xl p-4 shadow-ios border border-edu-border flex items-center gap-3 active:scale-[0.98] transition-all"
                >
                  <Avatar name={task.freelancer.fullname} avatarUrl={task.freelancer.avatarUrl} size="sm" className="rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-edu-text truncate">{task.freelancer.fullname}</p>
                    <p className="text-[11px] text-gray-400 font-medium">Ijrochi</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.freelancer.ratingCount > 0 && (
                      <div className="flex items-center gap-0.5 text-[11px] text-amber-500 font-bold">
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
              <div className="bg-red-500/5 text-red-500 p-5 rounded-xl flex items-start gap-3 border border-red-500/10">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[14px]">Vazifa bekor qilingan</p>
                  <p className="text-[12px] opacity-70 font-medium">Ushbu vazifa buyurtmachi tomonidan bekor qilingan.</p>
                </div>
              </div>
            )}

            {task.status === 'DISPUTED' && (
              <div className="bg-amber-500/5 text-amber-600 p-5 rounded-xl flex items-start gap-3 border border-amber-500/10">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-bold text-[14px]">Nizo (Dispute) jarayonida</p>
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
              <div className="bg-edu-primary/5 rounded-xl p-5 border border-edu-primary/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-edu-primary uppercase tracking-widest">Kelishilgan narx</p>
                  <p className="text-[16px] font-bold text-edu-primary">{formatPrice(task.agreedPrice || task.bids[0].proposedPrice)} UZS</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-edu-primary/10 flex items-center justify-center text-edu-primary">
                  <CheckCircle size={20} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className={cn(
          "border-t border-edu-border bg-edu-surface/90 backdrop-blur-2xl pb-safe shadow-ios-lg relative z-20 transition-all duration-500",
          bidOpen ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
        )}>
          <div className="p-4 max-w-[768px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={task.status + (isFreelancerGhosting ? '-ghosting' : '')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
              >
                <TaskActionButtons 
                  task={task}
                  user={user}
                  isClient={isClient}
                  isFreelancer={isFreelancer}
                  isMember={isMember}
                  transitions={transitions}
                  setBidOpen={setBidOpen}
                  setPromoteOpen={setPromoteOpen}
                  setStartWorkOpen={setStartWorkOpen}
                  setDeliverySubmitOpen={setDeliverySubmitOpen}
                  setRatingOpen={setRatingOpen}
                  setRevisionOpen={setRevisionOpen}
                  setRevisionNote={setRevisionNote}
                  setRevisionErrors={setRevisionErrors}
                  setDisputeOpen={setDisputeOpen}
                  setDisputeReason={setDisputeReason}
                  setDisputeErrors={setDisputeErrors}
                  handleCancelTask={handleCancelTask}
                  isFreelancerGhosting={isFreelancerGhosting}
                  hoursToAutoAccept={hoursToAutoAccept}
                />
              </motion.div>
            </AnimatePresence>
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
        disputeDescription={disputeDescription}
        setDisputeDescription={setDisputeDescription}
        disputeFiles={disputeFiles}
        setDisputeFiles={setDisputeFiles}
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

      <StartWorkModal
        isOpen={startWorkOpen}
        onClose={() => setStartWorkOpen(false)}
        deadline={task.deadline}
        isLoading={transitions.startProgress.isPending}
        onConfirm={async () => {
          await transitions.startProgress.mutateAsync();
          setStartWorkOpen(false);
        }}
      />

      <AcceptDeliveryModal
        isOpen={acceptDeliveryOpen}
        onClose={() => setAcceptDeliveryOpen(false)}
        isLoading={transitions.approvePreview?.isPending || transitions.accept?.isPending}
        onConfirm={async () => {
          try {
            if (task.status === 'PREVIEW_PENDING') {
              await transitions.approvePreview.mutateAsync();
            } else if (task.status === 'IN_REVIEW') {
              await transitions.accept.mutateAsync();
            }
            setAcceptDeliveryOpen(false);
          } catch {
            // Error handled by mutation
          }
        }}
      />

      {viewerFile && (
        <EduViewer
          fileId={viewerFile.fileId}
          fileName={viewerFile.name}
          mimeType={viewerFile.mimeType}
          isPaid={viewerFile.isPaid}
          onClose={() => setViewerFile(null)}
        />
      )}
    </PageLayout>
  );
}
