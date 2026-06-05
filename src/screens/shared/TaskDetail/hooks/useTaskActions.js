// src/screens/shared/TaskDetail/hooks/useTaskActions.js
import { useState } from 'react';
import { useTaskTransition, useCreateBid } from '../../../../hooks/useTasks';
import { tasksApi } from '../../../../services/tasks.service';
import { hapticSuccess } from '../../../../lib/telegram';
import { fireConfetti } from '../../../../lib/gamification';
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
  const [disputeErrors, setDisputeErrors] = useState({});

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
      toast.success("Baho qoldirildi. Rahmat!");
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
    if (!disputeReason.trim()) return setDisputeErrors({ reason: ['Sabab kiritish majburiy'] });
    try {
      await transitions.dispute.mutateAsync({ reason: disputeReason });
      setDisputeOpen(false);
      setDisputeReason('');
    } catch (err) {
      if (err.serverErrors) setDisputeErrors(err.serverErrors);
    }
  };

  const handlePromoteSubmit = async (packageType) => {
    try {
      await transitions.promote.mutateAsync({ packageType });
      trackEvent('Task Promoted', { taskId, packageType });
      setPromoteOpen(false);
    } catch (err) {
      // toast handled in mutation
    }
  };

  return {
    transitions,
    bidOpen, setBidOpen,
    ratingOpen, setRatingOpen,
    revisionOpen, setRevisionOpen,
    disputeOpen, setDisputeOpen,
    promoteOpen, setPromoteOpen,
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
    handleBidSubmit,
    handleRatingSubmit,
    handleRevisionSubmit,
    handleDisputeSubmit,
    handlePromoteSubmit,
  };
}
