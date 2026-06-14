import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatusBadge } from '../../../../components/ui/Badge';
import { TaskTimeline } from './TaskTimeline';
import { DeliveryPreviewCard } from './DeliveryPreviewCard';
import { deadlineCountdown, cn } from '../../../../lib/utils';

export function TaskStatusSection({
  task,
  isDeadlinePassed,
  isUrgentDeadline,
  isClient,
  isFreelancer,
  transitions,
  setAcceptDeliveryOpen,
  setRatingOpen
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest" />
          {task.isUrgent && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[9px] font-bold uppercase tracking-widest border border-red-500/10">
              <Clock size={10} strokeWidth={3} /> Tezkor
            </span>
          )}
        </div>
        <div className={cn(
          "flex items-center gap-1.5 text-[11px] font-bold transition-colors duration-500",
          isDeadlinePassed ? "text-red-500" : isUrgentDeadline ? "text-amber-500 animate-pulse" : "text-gray-400"
        )}>
          <Clock size={12} />
          <span>{isDeadlinePassed ? "Muddati o'tgan" : `${deadlineCountdown(task.deadline)} qoldi`}</span>
        </div>
      </div>

      <div className="bg-edu-surface rounded-xl p-5 shadow-ios border border-edu-border">
        <TaskTimeline status={task.status} />
      </div>
      
      {/* Delivery Preview Card */}
      {task.delivery && (isClient || isFreelancer) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
        >
          <DeliveryPreviewCard 
            delivery={task.delivery} 
            task={task}
            isClient={isClient}
            isFreelancer={isFreelancer}
            isApproving={transitions.approvePreview?.isPending}
            onApprovePreview={() => setAcceptDeliveryOpen(true)}
            onRevealFull={async () => {
              await transitions.revealFiles.mutateAsync();
            }}
            onLeaveReview={() => setRatingOpen(true)}
          />
        </motion.div>
      )}
    </div>
  );
}
