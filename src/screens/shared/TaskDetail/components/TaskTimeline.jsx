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
    <div className="flex flex-col gap-4">
      <ProgressStepper steps={STEPS} current={getStepNum(status)} />
      {isPending && (
        <div className="flex items-center justify-center gap-2 bg-amber-500/5 py-2 rounded-xl border border-amber-500/10">
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest animate-pulse">
            ⏳ Tekshiruv kutilmoqda
          </p>
        </div>
      )}
    </div>
  );
}
