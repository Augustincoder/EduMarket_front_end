// src/screens/shared/TaskDetail/TaskDetailScreen.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/Card';
import {
  Clock, DollarSign, Paperclip, ChevronDown, ChevronUp,
  MessageSquare, CheckCircle, RotateCcw, AlertTriangle, Star, Sparkles, FileText
} from 'lucide-react';
import { PageLayout } from '../../../components/layout/PageLayout';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusBadge, UrgentBadge, UserBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { TaskDetailSkeleton } from '../../../components/ui/SkeletonCard';
import { useTask } from '../../../hooks/useTasks';
import { useAuthStore } from '../../../store/authStore';
import { useChatStore } from '../../../store/chatStore';
import { useMainButton } from '../../../hooks/useMainButton';
import { formatPrice, formatPriceRange, formatDate, deadlineCountdown, cn } from '../../../lib/utils';
import { fireConfetti } from '../../../lib/gamification';
import { showConfirm } from '../../../lib/telegram';
import toast from 'react-hot-toast';
import { filesApi, portfolioApi, analyticsApi } from '../../../services/other.service';

// Decomposed Components
import { TaskHeader } from './components/TaskHeader';
import { TaskTimeline } from './components/TaskTimeline';
import { BidModal } from './components/BidModal';
import { RatingModal } from './components/RatingModal';
import { RevisionModal } from './components/RevisionModal';
import { DisputeModal } from './components/DisputeModal';
import { PromoteModal } from './components/PromoteModal';

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
    createBid,
    handleBidSubmit,
    handleRatingSubmit,
    handleRevisionSubmit,
    handleDisputeSubmit,
    handlePromoteSubmit,
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
      mainBtnText = 'Tekshirishga topshirish';
      mainBtnClick = async () => {
        await transitions.submitReview.mutateAsync();
        fireConfetti();
        toast.success("Tekshirishga yuborildi!");
      };
      mainBtnLoading = transitions.submitReview.isPending;
    } else if (task.status === 'IN_REVIEW' && isClient) {
      mainBtnText = 'Vazifani qabul qilish';
      mainBtnClick = async () => {
        await transitions.accept.mutateAsync();
        fireConfetti();
        toast.success("Vazifa qabul qilindi!");
      };
      mainBtnLoading = transitions.accept.isPending;
    }
  }

  useMainButton({
    text: mainBtnText,
    onClick: mainBtnClick,
    isLoading: mainBtnLoading,
  }, [task, user, transitions.startProgress.isPending, transitions.submitReview.isPending, transitions.accept.isPending]);

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
        <div className="p-4">
          <Button fullWidth variant="primary" size="lg" onClick={() => navigate('/')}>
            Kirish va taklif bering
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
    <PageLayout showNav={false} scrollable={false}>
      <div className="flex flex-col h-dvh">
        <TaskHeader task={task} user={user} isMember={isMember} />

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {task.isUrgent && <UrgentBadge />}
            <StatusBadge status={task.status} />
          </div>

          <TaskTimeline status={task.status} />

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

          <h1 className="text-2xl font-black font-display text-edu-text leading-tight">
            {task.title}
          </h1>

          <Card
            isPressable
            onClick={() => navigate(`/profile/${task.client?.id}`)}
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

          {task.freelancer && (
            <Card
              isPressable
              onClick={() => navigate(`/profile/${task.freelancer.id}`)}
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
                  <p className="text-xs text-edu-text/90 italic leading-relaxed bg-white/70 dark:bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-edu-border/20">
                    "{task.bids[0].message}"
                  </p>
                )}
              </CardContent>
            </Card>
          )}

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
              {task.attachmentFileIds?.length > 0 && isMember && (
                <>
                  <hr className="border-edu-border/40" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-edu-accent/10 flex items-center justify-center">
                        <Paperclip size={16} className="text-edu-accent" />
                      </div>
                      <p className="text-sm font-bold text-edu-text">
                        Biriktirilgan fayllar ({task.attachmentFileIds.length})
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 pl-11">
                      {task.attachmentFileIds.map((fileId, idx) => (
                        <button
                          key={fileId}
                          onClick={async () => {
                            try {
                              const res = await filesApi.getUrl(fileId);
                              window.open(res.data.data.url, '_blank');
                            } catch {
                              toast.error('Faylni yuklab olishda xato');
                            }
                          }}
                          className="flex items-center gap-2 p-2 rounded-xl bg-edu-bg border border-edu-border/50 text-[11px] font-bold text-edu-primary hover:bg-edu-primary/5 transition-colors active:scale-95 text-left"
                        >
                          <FileText size={14} /> Fayl #{idx + 1} ni yuklab olish
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

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

        <div className={cn(
          "border-t border-edu-border/40 bg-edu-surface/85 backdrop-blur-2xl pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.06)] relative z-20 transition-all duration-300",
          bidOpen ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        )}>
          {renderCTA()}
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
    </PageLayout>
  );
}
