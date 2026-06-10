// src/screens/shared/TaskDetail/hooks/useTaskActions.js
import { useState } from 'react';
import confetti from 'canvas-confetti';
import { useTaskTransition, useCreateBid } from '../../../../hooks/useTasks';
import { tasksApi } from '../../../../services/tasks.service';
import { hapticSuccess } from '../../../../lib/telegram';
import { trackEvent } from '../../../../lib/observability';
import toast from 'react-hot-toast';

export function useTaskActions(taskId) {
  const transitions = useTaskTransition(taskId);
  const createBid   = useCreateBid();

  const [bidOpen, setBidOpen]           = useState(false);
  const [ratingOpen, setRatingOpen]     = useState(false);
  const [revisionOpen, setRevisionOpen]   = useState(false);
  const [disputeOpen, setDisputeOpen]     = useState(false);
  const [promoteOpen, setPromoteOpen]     = useState(false);
  const [deliverySubmitOpen, setDeliverySubmitOpen] = useState(false);
  const [flagOpen, setFlagOpen]           = useState(false);
  const [startWorkOpen, setStartWorkOpen] = useState(false);
  const [acceptDeliveryOpen, setAcceptDeliveryOpen] = useState(false);

  const [bidPrice, setBidPrice]         = useState('');
  const [bidMsg, setBidMsg]             = useState('');
  const [bidErrors, setBidErrors]       = useState({});

  const [rating, setRating]             = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingErrors, setRatingErrors]   = useState({});
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  const [revisionNote, setRevisionNote]   = useState('');
  const [revisionErrors, setRevisionErrors] = useState({});

  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeFiles, setDisputeFiles]   = useState([]);
  const [disputeErrors, setDisputeErrors] = useState({});

  const [flagReason, setFlagReason]       = useState('');
  const [flagErrors, setFlagErrors]       = useState({});

  const handleBidSubmit = async () => {
    setBidErrors({});
    const errors = {};
    if (!bidPrice) {
      errors.proposedPrice = ['Narx kiritilmagan'];
    } else if (Number(bidPrice) < 1000) {
      errors.proposedPrice = ['Minimal narx 1000 so\'m'];
    }

    if (!bidMsg.trim()) {
      errors.message = ['Xabar bo\'sh'];
    } else if (bidMsg.trim().length < 10) {
      errors.message = ['Taklif xabari kamida 10 ta belgidan iborat bo\'lishi kerak'];
    } else if (bidMsg.trim().length > 1000) {
      errors.message = ['Taklif xabari 1000 ta belgidan oshmasligi kerak'];
    }

    if (Object.keys(errors).length > 0) {
      setBidErrors(errors);
      return;
    }

    try {
      await createBid.mutateAsync({ taskId, proposedPrice: Number(bidPrice), message: bidMsg });
      trackEvent('Bid Created', { taskId, price: Number(bidPrice) });
      setBidOpen(false);
      setBidPrice('');
      setBidMsg('');
    } catch (err) {
      if (err.serverErrors) setBidErrors(err.serverErrors);
    }
  };

  const handleRatingSubmit = async () => {
    setRatingErrors({});
    const errors = {};
    if (!rating) {
      errors.rating = ['Baho qo\'yish majburiy'];
    }
    if (!ratingComment.trim()) {
      errors.comment = ['Fikr-mulohaza yozish majburiy'];
    } else if (ratingComment.trim().length < 5) {
      errors.comment = ['Izoh kamida 5 ta belgidan iborat bo\'lishi kerak'];
    } else if (ratingComment.trim().length > 500) {
      errors.comment = ['Izoh 500 ta belgidan oshmasligi kerak'];
    }

    if (Object.keys(errors).length > 0) {
      setRatingErrors(errors);
      return;
    }

    setIsRatingLoading(true);
    try {
      await tasksApi.rate(taskId, { rating, comment: ratingComment });
      trackEvent('Rating Submitted', { taskId, rating });
      // Upon successful review, trigger revealFiles
      await transitions.revealFiles.mutateAsync();
      
      toast.success("Baho qoldirildi. Fayllar ochildi!");
      hapticSuccess();
      setRatingOpen(false);
    } catch (err) {
      if (err.serverErrors) {
        setRatingErrors(err.serverErrors);
        toast.error("Iltimos, xatoliklarni to'g'irlang");
      } else {
        toast.error(err.serverMsg || "Baho yuborishda xato");
      }
    } finally {
      setIsRatingLoading(false);
    }
  };

  const handleDeliverySubmit = async (data) => {
    try {
      await transitions.deliverPreview.mutateAsync(data);
      setDeliverySubmitOpen(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success("Natija muvaffaqiyatli yuklandi");
    } catch {
      // Errors handled in mutation globally
    }
  };

  const handleRevisionSubmit = async () => {
    setRevisionErrors({});
    if (!revisionNote.trim()) return setRevisionErrors({ note: ['Izoh kiritish majburiy'] });
    try {
      await transitions.requestRevision.mutateAsync({ note: revisionNote });
      setRevisionOpen(false);
      setRevisionNote('');
    } catch (err) {
      if (err.serverErrors) setRevisionErrors(err.serverErrors);
    }
  };

  const handleDisputeSubmit = async () => {
    setDisputeErrors({});
    let hasError = false;
    const errors = {};
    if (!disputeReason) { errors.reason = ['Sabab kiritish majburiy']; hasError = true; }
    if (!disputeDescription || disputeDescription.trim().length < 50) { 
      errors.description = ['Kamida 50 ta belgi yozing']; 
      hasError = true; 
    }
    if (hasError) return setDisputeErrors(errors);

    try {
      const fileIds = disputeFiles.map(f => f.fileId || f.id).filter(Boolean); // Assuming pre-uploaded or we just pass them if they are objects
      await transitions.dispute.mutateAsync({ 
        reason: disputeReason, 
        description: disputeDescription,
        evidenceFileIds: fileIds
      });
      setDisputeOpen(false);
      setDisputeReason('');
      setDisputeDescription('');
      setDisputeFiles([]);
    } catch (err) {
      if (err.serverErrors) setDisputeErrors(err.serverErrors);
    }
  };

  const handlePromoteSubmit = async (packageType) => {
    try {
      await transitions.promote.mutateAsync({ packageType });
      trackEvent('Task Promoted', { taskId, packageType });
      setPromoteOpen(false);
    } catch {
      // toast handled in mutation
    }
  };

  const handleFlagSubmit = async () => {
    setFlagErrors({});
    if (!flagReason.trim()) return setFlagErrors({ reason: ['Sabab kiritish majburiy'] });
    if (flagReason.trim().length < 10) return setFlagErrors({ reason: ['Kamida 10 ta belgi'] });
    try {
      await transitions.flagTask.mutateAsync({ reason: flagReason });
      setFlagOpen(false);
      setFlagReason('');
    } catch (err) {
      if (err.serverErrors) setFlagErrors(err.serverErrors);
    }
  };

  const handleStartWork = async () => {
    try {
      await transitions.startWork.mutateAsync();
      setStartWorkOpen(false);
    } catch {
      // toast handled
    }
  };

  const handleAcceptDelivery = async () => {
    try {
      await transitions.accept.mutateAsync();
      setAcceptDeliveryOpen(false);
      setRatingOpen(true);
    } catch {
      // toast handled
    }
  };

  return {
    transitions,
    bidOpen, setBidOpen,
    ratingOpen, setRatingOpen,
    revisionOpen, setRevisionOpen,
    disputeOpen, setDisputeOpen,
    promoteOpen, setPromoteOpen,
    deliverySubmitOpen, setDeliverySubmitOpen,
    flagOpen, setFlagOpen,
    startWorkOpen, setStartWorkOpen,
    acceptDeliveryOpen, setAcceptDeliveryOpen,
    bidPrice, setBidPrice,
    bidMsg, setBidMsg,
    bidErrors, setBidErrors,
    rating, setRating,
    ratingComment, setRatingComment,
    ratingErrors, setRatingErrors, isRatingLoading,
    revisionNote, setRevisionNote, revisionErrors, setRevisionErrors,
    disputeReason, setDisputeReason, disputeDescription, setDisputeDescription,
    disputeFiles, setDisputeFiles, disputeErrors, setDisputeErrors,
    flagReason, setFlagReason, flagErrors, setFlagErrors,
    createBid,
    handleBidSubmit, handleRatingSubmit, handleRevisionSubmit,
    handleDisputeSubmit, handleFlagSubmit, handleDeliverySubmit,
    handleStartWork, handleAcceptDelivery, handlePromoteSubmit
  };
}

