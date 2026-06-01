// src/screens/TaskDetailScreen.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import {
  Clock, DollarSign, Paperclip, ChevronDown, ChevronUp,
  MessageSquare, CheckCircle, RotateCcw, AlertTriangle, Star, Share2
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { PageLayout } from '../components/layout/PageLayout';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge, UrgentBadge, UserBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { BottomSheet } from '../components/ui/BottomSheet';
import { StarRating } from '../components/ui/StarRating';
import { FullPageSpinner } from '../components/ui/Spinner';
import { TaskDetailSkeleton } from '../components/ui/SkeletonCard';
import { ProgressStepper } from '../components/ui/ProgressStepper';
import { TextArea } from '../components/forms/TextArea';
import { TextInput } from '../components/forms/TextInput';
import { useTask, useCreateBid, useTaskTransition } from '../hooks/useTasks';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { formatPrice, formatPriceRange, formatDate, deadlineCountdown } from '../lib/utils';
import { hapticSuccess, hapticLight } from '../lib/telegram';
import { tasksApi } from '../services/api';
import toast from 'react-hot-toast';

export default function TaskDetailScreen() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuthStore();

  const { data: task, isLoading } = useTask(id);
  const transitions = useTaskTransition(id);
  const createBid   = useCreateBid();
  const joinRoom = useChatStore((s) => s.joinRoom);
  const leaveRoom = useChatStore((s) => s.leaveRoom);

  useEffect(() => {
    if (id) {
      joinRoom(id);
      return () => leaveRoom(id);
    }
  }, [id, joinRoom, leaveRoom]);

  const [descExpanded, setDescExpanded] = useState(false);
  const [bidOpen, setBidOpen]           = useState(false);
  const [ratingOpen, setRatingOpen]     = useState(false);
  const [bidPrice, setBidPrice]         = useState('');
  const [bidMsg, setBidMsg]             = useState('');
  const [bidErrors, setBidErrors]       = useState({});
  const [rating, setRating]             = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingErrors, setRatingErrors]   = useState({});
  const [revisionOpen, setRevisionOpen]   = useState(false);
  const [revisionNote, setRevisionNote]   = useState('');
  const [revisionErrors, setRevisionErrors] = useState({});
  const [disputeOpen, setDisputeOpen]     = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeErrors, setDisputeErrors] = useState({});

  const handleShare = () => {
    hapticLight();
    const shareData = {
      title: task?.title,
      text: `EduMarket'da yangi vazifa: ${task?.title}`,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Havola nusxalandi!");
    }
  };

  const steps = ['E\'lon', 'Tayinlangan', 'Jarayonda', 'Tekshiruvda', 'Yakunlandi'];
  const getStepNum = (status) => {
    switch (status) {
      case 'OPEN': return 1;
      case 'ASSIGNED': return 2;
      case 'IN_PROGRESS': return 3;
      case 'IN_REVIEW': return 4;
      case 'COMPLETED': return 5;
      default: return 1;
    }
  };

  if (isLoading) {
    return (
      <PageLayout showNav={false} scrollable={false}>
        <div className="flex flex-col h-dvh bg-edu-bg">
          <Header title="Yuklanmoqda..." showBack />
          <div className="flex-1 overflow-y-auto">
            <TaskDetailSkeleton />
          </div>
        </div>
      </PageLayout>
    );
  }
  if (!task) return null;

  const isMe      = (uid) => user?.id === uid;
  const isClient  = isMe(task.clientId);
  const isFreelancer = isMe(task.freelancerId);
  const isMember  = isClient || isFreelancer;

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
      await createBid.mutateAsync({ taskId: task.id, proposedPrice: Number(bidPrice), message: bidMsg });
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

    try {
      await tasksApi.rate(id, { rating, comment: ratingComment });
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

  const renderCTA = () => {
    if (!user) {
      return (
        <div className="p-4">
          <Button fullWidth variant="primary" size="lg" onClick={() => navigate('/')}>
            Kirish va taklif bering
          </Button>
        </div>
      );
    }

    if (task.status === 'OPEN' && !isClient) {
      return (
        <div className="p-4 space-y-2">
          <p className="text-xs text-edu-muted text-center">
            👥 {task._count?.bids ?? 0} ta taklif bor
          </p>
          <Button
            fullWidth size="lg" variant="primary"
            onClick={() => { hapticLight(); setBidOpen(true); }}
          >
            Taklif berish →
          </Button>
        </div>
      );
    }

    if (task.status === 'OPEN' && isClient) {
      return (
        <div className="p-4 space-y-2">
          <p className="text-xs text-edu-muted text-center">
            👥 {task._count?.bids ?? 0} ta taklif keldi
          </p>
          <Button fullWidth size="lg" variant="primary"
            onClick={() => navigate(`/tasks/${id}/bids`)}>
            Takliflarni ko'rish →
          </Button>
          <Button
            fullWidth size="md" variant="ghost"
            className="text-red-500 hover:bg-red-50"
            isLoading={transitions.cancel.isPending}
            onClick={async () => {
              if (window.confirm("Haqiqatan ham bu vazifani bekor qilmoqchimisiz?")) {
                try {
                  await transitions.cancel.mutateAsync();
                  toast.success("Vazifa bekor qilindi");
                } catch (err) {
                  toast.error(err.serverMsg || "Bekor qilishda xato");
                }
              }
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
            Chat →
          </Button>
          {isFreelancer && task.status === 'IN_PROGRESS' && (
            <Button
              fullWidth size="md" variant="secondary"
              isLoading={transitions.submitReview.isPending}
              onClick={() => transitions.submitReview.mutate()}
            >
              📋 Tekshirishga topshirish
            </Button>
          )}
          {isFreelancer && task.status === 'ASSIGNED' && (
            <Button
              fullWidth size="md" variant="secondary"
              isLoading={transitions.startProgress.isPending}
              onClick={() => transitions.startProgress.mutate()}
            >
              ✅ Ishni boshlashni tasdiqlash
            </Button>
          )}
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
          <Button
            fullWidth size="lg" variant="primary"
            icon={<CheckCircle size={18} />}
            isLoading={transitions.accept.isPending}
            onClick={() => transitions.accept.mutate()}
          >
            ✅ Qabul qilish
          </Button>
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

    if (task.status === 'COMPLETED') {
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

  const isActiveStatus = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'].includes(task.status);

  return (
    <PageLayout showNav={false} scrollable={false}>
      <div className="flex flex-col h-dvh">
        <Header
          title="Vazifa tafsiloti"
          showBack
          right={
            <div className="flex items-center gap-2">
              {task && user && (task.status === 'OPEN' ? task.clientId !== user.id : (isMember && ['IN_PROGRESS', 'IN_REVIEW'].includes(task.status))) && (
                <button
                  onClick={() => navigate(`/report?targetId=${id}&targetType=TASK`)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                  title="Shikoyat qilish"
                >
                  <AlertTriangle size={16} />
                </button>
              )}
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-edu-bg press-scale transition-all hover:bg-edu-border/60"
              >
                <Share2 size={16} className="text-edu-text" />
              </button>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
          {/* Status row */}
          <div className="flex items-center gap-2 flex-wrap">
            {task.isUrgent && <UrgentBadge />}
            <StatusBadge status={task.status} />
          </div>

          {/* Stepper Timeline */}
          {isActiveStatus && (
            <div className="bg-edu-surface/50 border border-edu-border/30 rounded-2xl p-3 flex justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
              <ProgressStepper steps={steps} current={getStepNum(task.status)} />
            </div>
          )}

          {/* Canceled/Disputed Warnings */}
          {task.status === 'CANCELED' && (
            <div className="bg-red-50 text-red-700 p-3 rounded-2xl flex items-start gap-2.5 text-xs font-medium border border-red-100/50 shadow-sm animate-fade-in">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-800">Vazifa bekor qilingan</p>
                <p className="mt-0.5 text-red-600/90">Ushbu vazifa buyurtmachi tomonidan bekor qilingan.</p>
              </div>
            </div>
          )}

          {task.status === 'DISPUTED' && (
            <div className="bg-amber-50 text-amber-800 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-medium border border-amber-100 shadow-sm animate-fade-in">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <p className="font-bold text-amber-900">Nizo (Dispute) jarayonida</p>
                <p className="text-amber-700/90 leading-relaxed">
                  Vazifa yuzasidan kelishmovchilik yuzaga keldi. Hozirda EduMarket ma'muriyati vaziyatni o'rganmoqda.
                </p>
                {task.dispute?.reason && (
                  <div className="bg-amber-100/40 p-2.5 rounded-xl border border-amber-200/50">
                    <span className="font-bold text-amber-950 block mb-0.5">Nizo sababi:</span>
                    <span className="text-amber-800 italic">"{task.dispute.reason}"</span>
                  </div>
                )}
                {task.dispute?.adminNotes && (
                  <div className="bg-indigo-50/50 text-indigo-900 p-2.5 rounded-xl border border-indigo-100">
                    <span className="font-bold text-indigo-950 block mb-0.5">Ma'muriyat izohi:</span>
                    <span className="text-indigo-800">{task.dispute.adminNotes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl font-black font-display text-edu-text leading-tight">
            {task.title}
          </h1>

          {/* Client Card */}
          <Card
            isPressable
            onPress={() => navigate(`/profile/${task.client?.id}`)}
            className="bg-edu-surface shadow-card border border-edu-border/40"
            radius="xl"
          >
            <CardContent className="flex flex-row items-center gap-3 p-3">
              <Avatar name={task.client?.fullname} avatarUrl={task.client?.avatarUrl} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-edu-text truncate">{task.client?.fullname}</p>
                <p className="text-xs text-edu-muted">Mijoz</p>
              </div>
              <UserBadge badge={task.client?.badge} isVip={task.client?.isVip} size="xs" />
            </CardContent>
          </Card>

          {/* Freelancer Card */}
          {task.freelancer && (
            <Card
              isPressable
              onPress={() => navigate(`/profile/${task.freelancer.id}`)}
              className="bg-edu-surface shadow-card border border-edu-border/40"
              radius="xl"
            >
              <CardContent className="flex flex-row items-center gap-3 p-3">
                <Avatar name={task.freelancer.fullname} avatarUrl={task.freelancer.avatarUrl} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-edu-text truncate">{task.freelancer.fullname}</p>
                  <p className="text-xs text-edu-muted">Ijrochi</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <UserBadge badge={task.freelancer.badge} isVip={task.freelancer.isVip} size="xs" />
                  {task.freelancer.ratingCount > 0 && (
                    <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                      <Star size={12} fill="currentColor" />
                      <span>{(task.freelancer.ratingSum / task.freelancer.ratingCount).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accepted Bid Details Card */}
          {task.bids?.[0] && task.status !== 'OPEN' && (
            <Card className="bg-gradient-to-br from-edu-primary/5 to-edu-primary/10 border border-edu-primary/20 shadow-card" radius="xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-edu-primary uppercase tracking-wider">Kelishilgan taklif</span>
                    {task.agreedPrice && (
                      <span className="w-1.5 h-1.5 rounded-full bg-edu-primary animate-ping" />
                    )}
                  </div>
                  <span className="text-base font-black text-edu-primary">
                    {formatPrice(task.agreedPrice || task.bids[0].proposedPrice)} so'm
                  </span>
                </div>
                {task.bids[0].message && (
                  <p className="text-xs text-edu-text/90 italic leading-relaxed bg-white/70 backdrop-blur-md p-2.5 rounded-xl border border-edu-border/20">
                    "{task.bids[0].message}"
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Meta */}
          <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-edu-primary/10 flex items-center justify-center">
                  <DollarSign size={16} className="text-edu-primary" />
                </div>
                <div>
                  <p className="text-2xs text-edu-muted">Narx oralig'i</p>
                  <p className="font-bold text-edu-text">{formatPriceRange(task.priceMin, task.priceMax)}</p>
                </div>
              </div>
              <hr className="border-edu-border/40" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Clock size={16} className="text-edu-urgent" />
                </div>
                <div>
                  <p className="text-2xs text-edu-muted">Muddat</p>
                  <p className="font-bold text-edu-text">
                    {formatDate(task.deadline)} · {deadlineCountdown(task.deadline)}
                  </p>
                </div>
              </div>
              {task.attachments?.length > 0 && isMember && (
                <>
                  <hr className="border-edu-border/40" />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-edu-accent/10 flex items-center justify-center">
                      <Paperclip size={16} className="text-edu-accent" />
                    </div>
                    <p className="text-sm text-edu-muted">
                      {task.attachments.length} ta biriktirma
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-edu-muted uppercase tracking-wider mb-2">Tavsif</p>
              <p className={['text-sm text-edu-text leading-relaxed', !descExpanded && 'line-clamp-3'].filter(Boolean).join(' ')}>
                {task.description}
              </p>
              {task.description?.length > 150 && (
                <button
                  className="text-xs text-edu-primary font-semibold mt-2 flex items-center gap-1 press-scale"
                  onClick={() => setDescExpanded((v) => !v)}
                >
                  {descExpanded ? <><ChevronUp size={14} /> Yopish</> : <><ChevronDown size={14} /> Ko'proq ko'rish</>}
                </button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Sticky CTA ─────────────────────────────── */}
        <div className="border-t border-edu-border/40 bg-edu-surface/85 backdrop-blur-2xl pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.06)] relative z-20">
          {renderCTA()}
        </div>
      </div>

      {/* ── Bid BottomSheet ────────────────────────── */}
      <BottomSheet isOpen={bidOpen} onClose={() => setBidOpen(false)} title="Taklif berish">
        <div className="space-y-4 py-2">
          <div className="bg-edu-bg rounded-xl px-3 py-2 text-sm text-edu-muted">
            💡 Narx oralig'i: {formatPriceRange(task.priceMin, task.priceMax)}
          </div>
          <TextInput
            label="Narx (so'm)"
            type="number"
            placeholder={String(task.priceMin)}
            value={bidPrice}
            onValueChange={(v) => { setBidPrice(v); setBidErrors(e => ({ ...e, proposedPrice: null })); }}
            error={bidErrors.proposedPrice?.[0]}
          />
          <TextArea
            label="Xabar"
            placeholder="Tajribangiz va muddatingiz haqida yozing..."
            value={bidMsg}
            onValueChange={(v) => { setBidMsg(v); setBidErrors(e => ({ ...e, message: null })); }}
            maxLength={1000}
            error={bidErrors.message?.[0]}
          />
          <Button
            fullWidth size="lg" variant="primary"
            isLoading={createBid.isPending}
            onClick={handleBidSubmit}
          >
            Taklif yuborish
          </Button>
        </div>
      </BottomSheet>

      {/* ── Rating Modal ───────────────────────────── */}
      <Modal
        isOpen={ratingOpen}
        onClose={() => setRatingOpen(false)}
        title="Bajaruvchini baholang"
        footer={
          <Button fullWidth variant="primary" onClick={handleRatingSubmit} isLoading={false}>
            Yuborish
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="text-center">
            <StarRating value={rating} onChange={(v) => { setRating(v); setRatingErrors(e => ({ ...e, rating: null })); }} size={36} />
            {ratingErrors.rating && <p className="text-red-500 text-xs mt-1 font-medium">{ratingErrors.rating[0]}</p>}
            <p className="text-xs text-edu-muted mt-2 font-medium">(1 — 5 yulduz)</p>
          </div>
          <TextArea
            label="Fikr-mulohaza (sharh) *"
            placeholder="Fikringizni yozing (kamida 5 ta belgi)..."
            value={ratingComment}
            onValueChange={(v) => { setRatingComment(v); setRatingErrors(e => ({ ...e, comment: null })); }}
            maxLength={500}
            error={ratingErrors.comment?.[0]}
          />
        </div>
      </Modal>

      {/* ── Revision Modal ─────────────────────────── */}
      <Modal
        isOpen={revisionOpen}
        onClose={() => setRevisionOpen(false)}
        title="Qayta ishlashga yuborish"
        footer={
          <Button fullWidth variant="primary" onClick={handleRevisionSubmit} isLoading={transitions.requestRevision.isPending}>
            Yuborish
          </Button>
        }
      >
        <div className="py-2">
          <TextArea
            label="Izoh (qayta ishlash sababi) *"
            placeholder="Nimalarni to'g'irlash kerakligini batafsil yozing..."
            value={revisionNote}
            onValueChange={(v) => { setRevisionNote(v); setRevisionErrors(e => ({ ...e, note: null })); }}
            maxLength={1000}
            minRows={4}
            error={revisionErrors.note?.[0]}
          />
        </div>
      </Modal>

      {/* ── Dispute Modal ──────────────────────────── */}
      <Modal
        isOpen={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        title="Nizo ochish"
        footer={
          <Button fullWidth variant="danger" onClick={handleDisputeSubmit} isLoading={transitions.dispute.isPending}>
            Tasdiqlash va Nizo ochish
          </Button>
        }
      >
        <div className="py-2 space-y-3">
          <div className="bg-red-50 text-red-600 p-3 rounded-xl flex gap-2 items-start text-sm">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p>Nizo ochilgandan so'ng ma'muriyat aralashadi va muammoni hal qiladi.</p>
          </div>
          <TextArea
            label="Sabab *"
            placeholder="Nima uchun nizo ochayotganingizni yozing..."
            value={disputeReason}
            onValueChange={(v) => { setDisputeReason(v); setDisputeErrors(e => ({ ...e, reason: null })); }}
            maxLength={1000}
            minRows={4}
            error={disputeErrors.reason?.[0]}
          />
        </div>
      </Modal>
    </PageLayout>
  );
}
