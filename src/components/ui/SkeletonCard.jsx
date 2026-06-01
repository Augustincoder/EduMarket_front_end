// src/components/ui/SkeletonCard.jsx
import { cn } from '../../lib/utils';

function Bone({ className }) {
  return <div className={cn('shimmer rounded-lg', className)} />;
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-edu-surface rounded-2xl p-4 shadow-card space-y-3">
      <div className="flex items-center gap-2">
        <Bone className="w-16 h-5" />
        <Bone className="w-20 h-5" />
      </div>
      <Bone className="w-full h-4" />
      <Bone className="w-3/4 h-4" />
      <div className="flex items-center gap-2">
        <Bone className="w-6 h-6 rounded-full" />
        <Bone className="w-24 h-4" />
        <Bone className="w-12 h-4 ml-auto" />
      </div>
      <div className="flex gap-4">
        <Bone className="w-24 h-4" />
        <Bone className="w-20 h-4" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col items-center gap-3 py-6">
        <Bone className="w-20 h-20 rounded-full" />
        <Bone className="w-36 h-5" />
        <Bone className="w-24 h-4" />
      </div>
      <Bone className="w-full h-24 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => <Bone key={i} className="h-20 rounded-2xl" />)}
      </div>
    </div>
  );
}

export function ChatBubbleSkeleton() {
  return (
    <div className="space-y-3 px-4 py-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={cn('flex gap-2', i % 2 === 0 ? '' : 'flex-row-reverse')}>
          <Bone className="w-8 h-8 rounded-full flex-shrink-0" />
          <Bone className={cn('h-12 rounded-2xl', i % 2 === 0 ? 'w-48' : 'w-40')} />
        </div>
      ))}
    </div>
  );
}

export function GigCardSkeleton() {
  return (
    <div className="bg-edu-surface rounded-2xl p-4 shadow-card space-y-3">
      <div className="flex items-center gap-3">
        <Bone className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Bone className="w-28 h-4" />
          <Bone className="w-16 h-3" />
        </div>
      </div>
      <Bone className="w-full h-4" />
      <Bone className="w-2/3 h-4" />
      <div className="flex items-center justify-between">
        <Bone className="w-20 h-5" />
        <Bone className="w-24 h-8 rounded-xl" />
      </div>
    </div>
  );
}

export default TaskCardSkeleton;
