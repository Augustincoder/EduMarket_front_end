// src/screens/TaskDetailScreen.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import {
  Clock, DollarSign, Paperclip, ChevronDown, ChevronUp,
  MessageSquare, CheckCircle, RotateCcw, AlertTriangle, Star
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
import { TextArea } from '../components/forms/TextArea';
import { TextInput } from '../components/forms/TextInput';
import { useTask, useCreateBid, useTaskTransition } from '../hooks/useTasks';
import { useAuthStore } from '../store/authStore';
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

  const [descExpanded, setDescExpanded] = useState(false);
  const [bidOpen, setBidOpen]           = useState(false);
  const [ratingOpen, setRatingOpen]     = useState(false);
  const [bidPrice, setBidPrice]         = useState('');
  const [bidMsg, setBidMsg]             = useState('');
  const [rating, setRating]             = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  if (isLoading) return <FullPageSpinner />;
  if (!task) return null;

  const isMe      = (uid) => user?.id === uid;
  const isClient  = isMe(task.clientId);
  const isFreelancer = isMe(task.freelancerId);
  const isMember  = isClient || isFreelancer;

  const handleBidSubmit = async () => {
    if (!bidPrice || !bidMsg.trim()) return;
    await createBid.mutateAsync({ taskId: task.id, proposedPrice: Number(bidPrice), message: bidMsg });
    setBidOpen(false);
    setBidPrice('');
    setBidMsg('');
  };

  const handleRatingSubmit = async () => {
    try {
      await tasksApi.rate(id, { rating, comment: ratingComment });
      toast.success("Baho qoldirildi. Rahmat!");
      hapticSuccess();
      setRatingOpen(false);
    } catch { toast.error("Baho yuborishda xato"); }
  };

  const renderCTA = () => {
    if (!user) {
      return (
        <div className="p-4">
          <Button fullWidth variant="primary" size="lg">
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
          {isClient && task.status === 'ASSIGNED' && (
            <Button
              fullWidth size="md" variant="secondary"
              isLoading={transitions.startProgress.isPending}
              onClick={() => transitions.startProgress.mutate()}
            >
              ✅ Ishni boshlashni tasdiqlash
            </Button>
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
              isLoading={transitions.requestRevision.isPending}
              onClick={() => transitions.requestRevision.mutate({})}
            >
              <RotateCcw size={14} /> Qayta ishlash
            </Button>
            <Button
              size="md" variant="danger" fullWidth
              isLoading={transitions.dispute.isPending}
              onClick={() => transitions.dispute.mutate({ reason: 'Qabul qilmayman' })}
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

  return (
    <PageLayout showNav={false} scrollable={false}>
      <div className="flex flex-col h-dvh">
        <Header title="Vazifa tafsiloti" showBack />

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
          {/* Status row */}
          <div className="flex items-center gap-2 flex-wrap">
            {task.isUrgent && <UrgentBadge />}
            <StatusBadge status={task.status} />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black font-display text-edu-text leading-tight">
            {task.title}
          </h1>

          {/* Client */}
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
            onValueChange={setBidPrice}
          />
          <TextArea
            label="Xabar"
            placeholder="Tajribangiz va muddatingiz haqida yozing..."
            value={bidMsg}
            onValueChange={setBidMsg}
            maxLength={500}
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
            <StarRating value={rating} onChange={setRating} size={36} />
            <p className="text-xs text-edu-muted mt-2 font-medium">(1 — 5 yulduz)</p>
          </div>
          <TextArea
            label="Sharh (ixtiyoriy)"
            placeholder="Fikringizni yozing..."
            value={ratingComment}
            onValueChange={setRatingComment}
            maxLength={300}
          />
        </div>
      </Modal>
    </PageLayout>
  );
}
