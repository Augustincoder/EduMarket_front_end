// src/components/ui/SkeletonCard.jsx
import { cn } from '../../lib/utils';

function Bone({ className }) {
  return <div className={cn('bg-black/[0.04] dark:bg-white/[0.04] rounded-2xl shimmer relative overflow-hidden', className)} />;
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 shadow-premium-md space-y-5 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2">
          <Bone className="w-16 h-7 rounded-xl" />
          <Bone className="w-24 h-7 rounded-xl" />
        </div>
        <Bone className="w-10 h-10 rounded-[18px]" />
      </div>
      <div className="space-y-3">
        <Bone className="w-full h-6 rounded-xl" />
        <Bone className="w-[80%] h-6 rounded-xl" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-black/[0.02] dark:border-white/[0.05]">
        <div className="flex items-center gap-3">
          <Bone className="w-10 h-10 rounded-[14px]" />
          <div className="space-y-2">
            <Bone className="w-24 h-3.5 rounded-full" />
            <Bone className="w-16 h-2.5 rounded-full opacity-60" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Bone className="w-20 h-6 rounded-xl" />
          <Bone className="w-28 h-3 rounded-full opacity-60" />
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
      <Bone className="w-full h-32 rounded-[24px]" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <Bone key={i} className="h-28 rounded-[28px]" />)}
      </div>
    </div>
  );
}

export function ChatBubbleSkeleton() {
  return (
    <div className="space-y-6 px-4 py-6 animate-in fade-in duration-500">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={cn('flex gap-3', i % 2 === 0 ? '' : 'flex-row-reverse')}>
          <Bone className="w-9 h-9 rounded-full flex-shrink-0" />
          <Bone className={cn('h-14 rounded-[24px]', i % 2 === 0 ? 'w-56 rounded-bl-[4px]' : 'w-48 rounded-br-[4px]')} />
        </div>
      ))}
    </div>
  );
}

export function GigCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 shadow-premium-md space-y-4 animate-in fade-in duration-500">
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
        <Bone className="w-28 h-12 rounded-2xl" />
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
        <Bone className="w-full h-10 rounded-2xl" />
        <Bone className="w-[60%] h-10 rounded-2xl" />
      </div>
      <div className="bg-gray-50 dark:bg-white/5 rounded-[24px] p-6 flex items-center gap-4 border border-black/[0.02] dark:border-white/5">
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

export function ClientHomeSkeleton() {
  return (
    <div className="flex flex-col h-full bg-mesh-aurora p-6 space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center pt-4">
        <div className="space-y-2">
          <Bone className="w-24 h-3 rounded-full opacity-50" />
          <Bone className="w-48 h-10 rounded-xl" />
        </div>
        <Bone className="w-14 h-14 rounded-full" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Bone className="h-40 rounded-[28px]" />
        <Bone className="h-40 rounded-[28px]" />
      </div>

      {/* Stats Widget */}
      <div className="bg-white/50 dark:bg-white/5 rounded-[24px] p-6 space-y-6">
        <div className="flex justify-between">
          <Bone className="w-24 h-4 rounded-full" />
          <Bone className="w-16 h-4 rounded-full opacity-50" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-3">
            <Bone className="w-14 h-14 rounded-full" />
            <Bone className="w-12 h-3 rounded-full opacity-50" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <Bone className="w-14 h-14 rounded-full" />
            <Bone className="w-12 h-3 rounded-full opacity-50" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <Bone className="w-14 h-14 rounded-full" />
            <Bone className="w-12 h-3 rounded-full opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskCardSkeleton;
