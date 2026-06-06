// src/screens/shared/TaskDetail/components/TaskTimeline.jsx
import { ProgressStepper } from '../../../../components/ui/ProgressStepper';

const STEPS = ['E\'lon', 'Tayinlangan', 'Jarayonda', 'Ko\'rib chiqish', 'Tasdiqlash', 'Yakunlandi'];

export function TaskTimeline({ status }) {
  const getStepNum = (status) => {
    switch (status) {
      case 'OPEN': return 1;
      case 'ASSIGNED': return 2;
      case 'IN_PROGRESS': return 3;
      case 'PREVIEW_PENDING': return 4;
      case 'IN_REVIEW': return 5;
      case 'COMPLETED': return 6;
      default: return 1;
    }
  };

  const isActiveStatus = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PREVIEW_PENDING', 'IN_REVIEW', 'COMPLETED'].includes(status);
  if (!isActiveStatus) return null;

  const isPending = status === 'PREVIEW_PENDING';

  return (
    <div className={`bg-edu-surface/50 border rounded-2xl p-3 flex flex-col gap-2 ${isPending ? 'border-amber-400/40 bg-amber-50/30' : 'border-edu-border/30'}`}>
      <ProgressStepper steps={STEPS} current={getStepNum(status)} />
      {isPending && (
        <p className="text-[10px] text-amber-600 font-bold text-center animate-pulse">
          ⏳ Freelancer himoyalangan ko'rinish yukladi — tekshiring
        </p>
      )}
    </div>
  );
}
