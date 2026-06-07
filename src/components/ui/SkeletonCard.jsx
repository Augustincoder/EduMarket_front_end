// src/components/ui/SkeletonCard.jsx
import { cn } from '../../lib/utils';

function Bone({ className }) {
  return <div className={cn('bg-black/[0.05] dark:bg-white/[0.05] animate-pulse rounded-xl', className)} />;
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-5 shadow-ios space-y-4 border border-black/[0.03] dark:border-white/[0.03]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-1.5">
          <Bone className="w-16 h-6 rounded-lg" />
          <Bone className="w-20 h-6 rounded-lg" />
        </div>
        <Bone className="w-9 h-9 rounded-2xl" />
      </div>
      <div className="space-y-3">
        <Bone className="w-full h-5 rounded-lg" />
        <Bone className="w-[70%] h-5 rounded-lg" />
        <Bone className="w-32 h-6 rounded-lg" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-black/[0.03] dark:border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <Bone className="w-8 h-8 rounded-2xl" />
          <div className="space-y-1.5">
            <Bone className="w-20 h-3" />
            <Bone className="w-12 h-2" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Bone className="w-16 h-5 rounded-lg" />
          <Bone className="w-24 h-3 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-4 animate-fade-in">
      <div className="flex flex-col items-center gap-4 py-8">
        <Bone className="w-24 h-24 rounded-full" />
        <div className="space-y-2 flex flex-col items-center">
          <Bone className="w-48 h-6" />
          <Bone className="w-32 h-4" />
        </div>
      </div>
      <Bone className="w-full h-32 squircle" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <Bone key={i} className="h-24 squircle" />)}
      </div>
    </div>
  );
}

export function ChatBubbleSkeleton() {
  return (
    <div className="space-y-4 px-4 py-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={cn('flex gap-2.5', i % 2 === 0 ? '' : 'flex-row-reverse')}>
          <Bone className="w-8 h-8 rounded-full flex-shrink-0" />
          <Bone className={cn('h-14 rounded-[22px]', i % 2 === 0 ? 'w-56 rounded-bl-[4px]' : 'w-48 rounded-br-[4px]')} />
        </div>
      ))}
    </div>
  );
}

export function GigCardSkeleton() {
  return (
    <div className="bg-edu-surface squircle p-5 shadow-ios space-y-4">
      <div className="flex items-center gap-3">
        <Bone className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Bone className="w-32 h-4" />
          <Bone className="w-20 h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <Bone className="w-full h-4" />
        <Bone className="w-[70%] h-4" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Bone className="w-24 h-6 rounded-lg" />
        <Bone className="w-28 h-10 rounded-xl" />
      </div>
    </div>
  );
}

export function TaskDetailSkeleton() {
  return (
    <div className="space-y-6 p-4 animate-fade-in">
      {/* Status row */}
      <div className="flex gap-2">
        <Bone className="w-20 h-6 rounded-full" />
        <Bone className="w-28 h-6 rounded-full" />
      </div>
      {/* Title */}
      <div className="space-y-3">
        <Bone className="w-full h-8 rounded-xl" />
        <Bone className="w-[60%] h-8 rounded-xl" />
      </div>
      {/* Client card */}
      <div className="bg-edu-surface squircle p-4 border border-edu-border/20 flex items-center gap-4">
        <Bone className="w-14 h-14 rounded-full" />
        <div className="space-y-2 flex-1">
          <Bone className="w-40 h-4" />
          <Bone className="w-20 h-3" />
        </div>
        <Bone className="w-12 h-5 rounded-full" />
      </div>
      {/* Meta card */}
      <div className="bg-edu-surface squircle p-5 border border-edu-border/20 space-y-5">
        <div className="flex items-center gap-4">
          <Bone className="w-10 h-10 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Bone className="w-24 h-3" />
            <Bone className="w-36 h-4" />
          </div>
        </div>
        <div className="h-px bg-edu-border/10" />
        <div className="flex items-center gap-4">
          <Bone className="w-10 h-10 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Bone className="w-24 h-3" />
            <Bone className="w-48 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientHomeSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pt-4">
        <div className="space-y-2">
          <Bone className="w-20 h-3" />
          <Bone className="w-32 h-8" />
        </div>
        <Bone className="w-12 h-12 rounded-full" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Bone className="h-36 squircle" />
        <Bone className="h-36 squircle" />
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <Bone className="w-24 h-4" />
        <div className="grid grid-cols-3 gap-3">
          <Bone className="h-28 squircle" />
          <Bone className="h-28 squircle" />
          <Bone className="h-28 squircle" />
        </div>
      </div>
    </div>
  );
}

export default TaskCardSkeleton;
