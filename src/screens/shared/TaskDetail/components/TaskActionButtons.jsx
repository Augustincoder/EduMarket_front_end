import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../components/ui/Button';
import { MessageSquare, Zap, RotateCcw, AlertTriangle, CheckCircle, Star } from 'lucide-react';
import { hapticLight } from '../../../../lib/telegram';

export function TaskActionButtons({
  task,
  user,
  isClient,
  isFreelancer,
  isMember,
  transitions,
  setBidOpen,
  setPromoteOpen,
  setStartWorkOpen,
  setDeliverySubmitOpen,
  setRatingOpen,
  setRevisionOpen,
  setRevisionNote,
  setRevisionErrors,
  setDisputeOpen,
  setDisputeReason,
  setDisputeErrors,
  handleCancelTask,
  isFreelancerGhosting,
  hoursToAutoAccept
}) {
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button fullWidth variant="primary" size="lg" onClick={() => navigate('/')} className="rounded-2xl h-14 font-bold shadow-ios-primary">
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
            onClick={() => navigate(`/tasks/${task.id}/bids`)}
            className="flex-1 rounded-xl shadow-ios-primary h-14 text-[15px] font-bold"
          >
            Takliflarni ko'rish {task._count?.bids > 0 && `(${task._count.bids})`}
          </Button>
          <button
            onClick={() => { setPromoteOpen(true); hapticLight(); }}
            className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 active:scale-90 transition-all border border-amber-500/10 shadow-sm"
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
            className="rounded-xl h-14 text-[15px] font-bold shadow-ios-primary"
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
        <div className="flex flex-col gap-3 w-full animate-fade-in">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 shadow-sm mb-2">
            <h4 className="text-blue-700 font-bold text-[13px] mb-1">Mijoz taklifingizni qabul qildi! 🎉</h4>
            <p className="text-[11px] text-blue-600/80 font-medium">Shartlar bilan yana bir bor tanishib chiqing va ishni boshlang.</p>
          </div>
          <Button
            fullWidth size="lg" variant="primary"
            onClick={() => setStartWorkOpen(true)}
            className="rounded-xl h-14 text-[15px] font-bold shadow-ios-primary"
          >
            Ishni boshlash 🚀
          </Button>
          <Button
            fullWidth size="md" variant="ghost"
            icon={<MessageSquare size={16} />}
            onClick={() => navigate(`/tasks/${task.id}/chat`)}
            className="rounded-xl h-12 text-edu-primary font-bold"
          >
            Chatga o'tish
          </Button>
        </div>
      );
    } else if (isClient) {
      return (
        <div className="flex flex-col gap-3 w-full">
          {isFreelancerGhosting ? (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl">
              <p className="text-red-600 dark:text-red-400 text-[12px] font-bold text-center">
                Freelancer 48 soatdan beri aloqaga chiqmadi. Boshqasini topish uchun vazifani bekor qilishingiz mumkin.
              </p>
              <Button
                fullWidth size="md" variant="danger"
                className="mt-3 rounded-xl h-11"
                onClick={handleCancelTask}
                isLoading={transitions.cancel.isPending}
              >
                Bekor qilish
              </Button>
            </div>
          ) : (
            <div className="text-[13px] text-center text-gray-400 bg-edu-bg p-4 rounded-2xl border border-black/[0.03] font-bold">
              ⏳ Ijrochi ishni boshlashini kutilmoqda...
            </div>
          )}
          <Button
            fullWidth size="md" variant="outline"
            icon={<MessageSquare size={16} />}
            onClick={() => navigate(`/tasks/${task.id}/chat`)}
            className="rounded-2xl h-12 border-edu-border font-bold"
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
            className="rounded-2xl h-14 text-[15px] font-bold shadow-ios-primary"
          >
            Natijani yuborish 📤
          </Button>
          <Button
            fullWidth size="md" variant="ghost"
            icon={<MessageSquare size={16} />}
            onClick={() => navigate(`/tasks/${task.id}/chat`)}
            className="rounded-xl h-12 text-edu-primary font-bold"
          >
            Chatga o'tish
          </Button>
        </div>
      );
    } else if (isClient) {
      return (
        <div className="flex flex-col gap-3 w-full">
          <div className="text-[13px] text-center text-edu-primary bg-edu-primary/5 p-4 rounded-2xl border border-edu-primary/10 font-bold">
            ⚙️ Ijrochi vazifa ustida ishlamoqda
          </div>
          <Button
            fullWidth size="md" variant="outline"
            icon={<MessageSquare size={16} />}
            onClick={() => navigate(`/tasks/${task.id}/chat`)}
            className="rounded-2xl h-12 border-edu-border font-bold"
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
            className="rounded-2xl h-14 text-[15px] font-bold shadow-ios-primary"
          >
            Vazifani baholash ⭐
          </Button>
          <Button
            fullWidth size="md" variant="outline"
            icon={<MessageSquare size={16} />}
            onClick={() => navigate(`/tasks/${task.id}/chat`)}
            className="rounded-2xl h-12 border-edu-border font-bold"
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
            {hoursToAutoAccept > 0 && (
              <div className="mt-2 text-[11px] text-amber-600/70 font-medium">
                Avtomatik qabul qilinishiga {hoursToAutoAccept.toFixed(1)} soat qoldi
              </div>
            )}
          </div>
          <Button
            fullWidth size="md" variant="outline"
            icon={<MessageSquare size={16} />}
            onClick={() => navigate(`/tasks/${task.id}/chat`)}
            className="rounded-2xl h-12 border-edu-border font-bold"
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
            className="rounded-2xl h-14 text-[15px] font-bold shadow-ios-primary"
          >
            Vazifani qabul qilish ✅
          </Button>
          <div className="flex gap-2">
            <Button
              size="md" variant="secondary" className="flex-1 rounded-xl h-11 text-[13px] font-bold"
              onClick={() => { setRevisionNote(''); setRevisionErrors({}); setRevisionOpen(true); }}
              disabled={task?.delivery?.revisionCount >= 3}
              title={task?.delivery?.revisionCount >= 3 ? "Maksimal qayta ishlash so'rovlari (3 marta) ishlatildi" : "Qayta ishlashga yuborish"}
            >
              <RotateCcw size={14} className="mr-1" /> {task?.delivery?.revisionCount >= 3 ? 'Limit tugadi' : 'Qayta ishlash'}
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
            {hoursToAutoAccept > 0 && (
              <div className="mt-2 text-[11px] text-amber-600/70 font-medium">
                Avtomatik qabul qilinishiga {hoursToAutoAccept.toFixed(1)} soat qoldi
              </div>
            )}
          </div>
          <Button
            fullWidth size="md" variant="outline"
            icon={<MessageSquare size={16} />}
            onClick={() => navigate(`/tasks/${task.id}/chat`)}
            className="rounded-2xl h-12 border-edu-border font-bold"
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
      <div className="flex flex-col gap-3 w-full animate-fade-in">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md relative z-10">
            <CheckCircle size={24} />
          </div>
          <h4 className="text-emerald-700 dark:text-emerald-500 font-bold text-[15px] mb-1 relative z-10">Topshiriq muvaffaqiyatli yakunlandi! 🎉</h4>
          <p className="text-[12px] text-emerald-600/80 dark:text-emerald-400/80 font-medium relative z-10">Hamkorligingiz uchun rahmat. Iltimos, o'z tajribangizni baholang.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary" className="flex-1 rounded-[18px] h-12 text-[13px] font-bold shadow-ios-primary"
            icon={<Star size={16} />}
            onClick={() => setRatingOpen(true)}
          >
            Baho qoldirish
          </Button>
          <Button
            variant="secondary" className="flex-1 rounded-[18px] h-12 text-[13px] font-bold border border-edu-border shadow-sm"
            icon={<MessageSquare size={16} />}
            onClick={() => navigate(`/tasks/${task.id}/chat`)}
          >
            Chat
          </Button>
        </div>
      </div>
    );
  }

  // 7. Task is DISPUTED
  if (task.status === 'DISPUTED' && isMember) {
    return (
      <div className="flex flex-col gap-3 w-full animate-fade-in">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-2xl rounded-full pointer-events-none" />
          <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md relative z-10">
            <AlertTriangle size={24} />
          </div>
          <h4 className="text-red-700 dark:text-red-400 font-bold text-[15px] mb-1 relative z-10">Topshiriq muzlatilgan (Nizo) ⚖️</h4>
          <p className="text-[12px] text-red-600/80 dark:text-red-300/80 font-medium relative z-10">
            Ushbu topshirish jarayoni ma'muriyat tomonidan ko'rib chiqilmoqda. Barcha harakatlar muzlatilgan. Pulingiz va fayllar himoyada.
          </p>
        </div>
        <Button
          fullWidth size="md" variant="outline"
          icon={<MessageSquare size={16} />}
          onClick={() => navigate(`/tasks/${task.id}/chat`)}
          className="rounded-2xl h-12 border-edu-border font-bold"
        >
          Chatda muloqotni davom ettirish
        </Button>
      </div>
    );
  }

  return null;
}
