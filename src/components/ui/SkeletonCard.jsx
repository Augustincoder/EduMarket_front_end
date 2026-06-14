// src/components/ui/SkeletonCard.jsx
import { cn } from '../../lib/utils';

function Bone({ className }) {
  return <div className={cn('bg-black/5 dark:bg-white/10 rounded-md', className)} />;
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-edu-surface rounded-xl p-4 mb-3 shadow-sm border border-edu-border/30 animate-pulse flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bone className="w-20 h-7 rounded-full" />
        </div>
        <Bone className="w-8 h-8 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <Bone className="w-full h-5 rounded-md" />
        <Bone className="w-[70%] h-5 rounded-md" />
        <Bone className="w-32 h-6 rounded-md mt-1" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-edu-border/50 mt-1">
        <div className="flex items-center gap-2">
          <Bone className="w-6 h-6 rounded-full" />
          <Bone className="w-20 h-3 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Bone className="w-12 h-3 rounded-md" />
          <Bone className="w-16 h-3 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4 py-8">
        <Bone className="w-24 h-24 rounded-full" />
        <div className="space-y-2 flex flex-col items-center">
          <Bone className="w-48 h-6 rounded-full" />
          <Bone className="w-32 h-4 rounded-full opacity-60" />
        </div>
      </div>
      <Bone className="w-full h-32 rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <Bone key={i} className="h-28 rounded-lg" />)}
      </div>
    </div>
  );
}

export function ChatBubbleSkeleton() {
  return (
    <div className="space-y-6 px-4 py-6 animate-in fade-in duration-500">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={cn('flex gap-3', i % 2 === 0 ? '' : 'flex-row-reverse')}>
          <Bone className="w-10 h-10 rounded-full flex-shrink-0" />
          <Bone className={cn('h-14 rounded-md', i % 2 === 0 ? 'w-56 rounded-bl-[4px]' : 'w-48 rounded-br-[4px]')} />
        </div>
      ))}
    </div>
  );
}

export function GigCardSkeleton() {
  return (
    <div className="bg-edu-surface rounded-xl p-6 shadow-md space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Bone className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Bone className="w-32 h-4 rounded-full" />
          <Bone className="w-20 h-3 rounded-full opacity-60" />
        </div>
      </div>
      <div className="space-y-2">
        <Bone className="w-full h-4 rounded-full" />
        <Bone className="w-[70%] h-4 rounded-full opacity-60" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Bone className="w-24 h-6 rounded-xl" />
        <Bone className="w-28 h-12 rounded-lg" />
      </div>
    </div>
  );
}

export function TaskDetailSkeleton() {
  return (
    <div className="space-y-8 p-6 animate-in fade-in duration-500">
      <div className="flex gap-3">
        <Bone className="w-24 h-7 rounded-full" />
        <Bone className="w-32 h-7 rounded-full" />
      </div>
      <div className="space-y-3">
        <Bone className="w-full h-10 rounded-lg" />
        <Bone className="w-[60%] h-10 rounded-lg" />
      </div>
      <div className="bg-edu-bg rounded-xl p-6 flex items-center gap-4 border border-black/[0.02] dark:border-white/5">
        <Bone className="w-16 h-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Bone className="w-48 h-5 rounded-full" />
          <Bone className="w-24 h-3 rounded-full opacity-60" />
        </div>
        <Bone className="w-14 h-6 rounded-full" />
      </div>
    </div>
  );
}

export function TaskStatusSkeleton() {
  return (
    <div className="mb-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-3 px-1">
        <Bone className="w-24 h-4 rounded-full" />
        <Bone className="w-16 h-4 rounded-full opacity-50" />
      </div>
      <div className="flex overflow-x-hidden gap-3 pb-2 px-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex-shrink-0 w-[140px] h-[80px] flex items-center gap-3 bg-edu-surface rounded-lg p-3 border border-edu-border shadow-sm">
            <Bone className="w-12 h-12 rounded-md" />
            <div className="flex flex-col gap-2">
              <Bone className="w-8 h-5 rounded-sm" />
              <Bone className="w-16 h-3 rounded-full opacity-60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="mb-6 px-1 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-3">
        <Bone className="w-32 h-4 rounded-full" />
        <Bone className="w-16 h-4 rounded-full opacity-50" />
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-edu-surface rounded-lg p-3 flex items-center gap-3 border border-edu-border shadow-sm">
            <Bone className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Bone className="w-32 h-4 rounded-full" />
              <Bone className="w-24 h-3 rounded-full opacity-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="mb-8 px-1 animate-in fade-in duration-500">
      <h3 className="text-[12px] font-bold text-edu-muted uppercase tracking-[0.05em] mb-3">
        <Bone className="w-28 h-4 rounded-full" />
      </h3>
      <div className="bg-edu-surface rounded-2xl border border-edu-border p-4 flex items-center gap-3 shadow-sm">
        <Bone className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Bone className="w-24 h-4 rounded-full" />
            <Bone className="w-12 h-3 rounded-full opacity-50" />
          </div>
          <Bone className="w-[80%] h-3 rounded-full opacity-50" />
        </div>
      </div>
    </div>
  );
}

export default TaskCardSkeleton;
