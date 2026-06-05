// src/screens/shared/TaskDetail/components/TaskTimeline.jsx
import { ProgressStepper } from '../../../../components/ui/ProgressStepper';

const STEPS = ['E\'lon', 'Tayinlangan', 'Jarayonda', 'Tekshiruvda', 'Yakunlandi'];

export function TaskTimeline({ status }) {
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

  const isActiveStatus = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'].includes(status);

  if (!isActiveStatus) return null;

  return (
    <div className="bg-edu-surface/50 border border-edu-border/30 rounded-2xl p-3 flex justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
      <ProgressStepper steps={STEPS} current={getStepNum(status)} />
    </div>
  );
}
