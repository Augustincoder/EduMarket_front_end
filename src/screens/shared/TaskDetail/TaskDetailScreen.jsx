// src/screens/shared/TaskDetail/TaskDetailScreen.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../../../components/layout/PageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useTick } from '../../../hooks/useTick';
import { useTask } from '../../../hooks/useTasks';
import { useAuthStore } from '../../../store/authStore';
import { useChatStore } from '../../../store/chatStore';
import { cn } from '../../../lib/utils';
import { showConfirm, hapticLight } from '../../../lib/telegram';
import toast from 'react-hot-toast';

// Decomposed Components
import { TaskHeader } from './components/TaskHeader';
import { BidModal } from './components/BidModal';
import { RatingModal } from './components/RatingModal';
import { RevisionModal } from './components/RevisionModal';
import { DisputeModal } from './components/DisputeModal';
import { PromoteModal } from './components/PromoteModal';
import { DeliverySubmitModal } from './components/DeliverySubmitModal';
import { StartWorkModal } from './components/StartWorkModal';
import { AcceptDeliveryModal } from './components/AcceptDeliveryModal';
import { TaskActionButtons } from './components/TaskActionButtons';
import EduViewer from '../../../components/ui/EduViewer';
import { TaskDetailSkeletonWrapper } from './components/TaskDetailSkeletonWrapper';
import { TaskStatusSection } from './components/TaskStatusSection';
import { TaskTitleDescription } from './components/TaskTitleDescription';
import { TaskMembersSection } from './components/TaskMembersSection';
import { TaskAlertsSection } from './components/TaskAlertsSection';

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

  if (isLoading || error) {
    return <TaskDetailSkeletonWrapper isLoading={isLoading} error={error} />;
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
          <TaskStatusSection
            task={task}
            isDeadlinePassed={isDeadlinePassed}
            isUrgentDeadline={isUrgentDeadline}
            isClient={isClient}
            isFreelancer={isFreelancer}
            transitions={transitions}
            setAcceptDeliveryOpen={setAcceptDeliveryOpen}
            setRatingOpen={setRatingOpen}
          />

          <TaskTitleDescription
            task={task}
            isMember={isMember}
            handleViewFile={handleViewFile}
          />

          <TaskMembersSection
            task={task}
            navigate={navigate}
          />

          <TaskAlertsSection
            task={task}
          />
        </div>

        {/* Bottom CTA Bar */}
        <div className={cn(
          "border-t border-edu-border bg-edu-surface/90 backdrop-blur-xl pb-safe shadow-ios-lg relative z-20 transition-all duration-500",
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
