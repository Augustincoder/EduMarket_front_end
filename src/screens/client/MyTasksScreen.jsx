import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Header } from '../../components/layout/Header';
import { useMyTasks } from '../../hooks/useTasks';
import { useAuthStore } from '../../store/authStore';
import TaskCard from '../../components/cards/TaskCard';
import { TaskCardSkeleton } from '../../components/ui/SkeletonCard';
import { FilterChip } from '../../components/ui/Chip';
import { hapticLight } from '../../lib/telegram';
import { Briefcase, User, SearchX } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MyTasksScreen() {
  const activeRole = useAuthStore((s) => s.activeRole);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const setStatusFilter = (val) => {
    if (val) {
      setSearchParams({ status: val });
    } else {
      setSearchParams({});
    }
  };

  const { data: tasks, isLoading } = useMyTasks(activeRole, statusFilter);

  return (
    <PageLayout scrollable={false}>
      <Header 
        title={activeRole === 'FREELANCER' ? "Mening ishlarim" : "Mening e'lonlarim"} 
        subtitle={activeRole === 'FREELANCER' ? "Ijrochi ish joyi" : "Mijoz ish joyi"}
      />
      <div className="flex-1 overflow-y-auto pt-3 pb-nav px-3 space-y-4 scrollbar-hide">
        
        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1.5 shrink-0 animate-fade-in">
          <FilterChip label="Barchasi" active={!statusFilter} onClick={() => setStatusFilter('')} />
          <FilterChip label="Faol" active={statusFilter === 'OPEN'} onClick={() => setStatusFilter('OPEN')} />
          <FilterChip label="Tayinlangan" active={statusFilter === 'ASSIGNED'} onClick={() => setStatusFilter('ASSIGNED')} />
          <FilterChip label="Bajarilmoqda" active={statusFilter === 'IN_PROGRESS'} onClick={() => setStatusFilter('IN_PROGRESS')} />
          <FilterChip label="Tekshiruvda" active={statusFilter === 'IN_REVIEW'} onClick={() => setStatusFilter('IN_REVIEW')} />
          <FilterChip label="Yakunlangan" active={statusFilter === 'COMPLETED'} onClick={() => setStatusFilter('COMPLETED')} />
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-4 scrollbar-hide">
          {isLoading ? (
            <div className="space-y-3 animate-fade-up">
              <TaskCardSkeleton />
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </div>
          ) : tasks?.length > 0 ? (
            <div className="space-y-3 animate-slide-up">
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
              <div className="w-24 h-24 mb-5 rounded-[32px] bg-edu-surface flex items-center justify-center shadow-sm border border-edu-border/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-edu-primary/10 to-transparent" />
                <SearchX size={40} className="text-edu-muted relative z-10" />
              </div>
              <h3 className="text-xl font-black font-display text-edu-text mb-2">Vazifalar topilmadi</h3>
              <p className="text-sm font-medium text-edu-muted max-w-[260px] leading-relaxed">
                {statusFilter 
                  ? "Tanlangan holat bo'yicha vazifalar mavjud emas." 
                  : (activeRole === 'CLIENT' 
                      ? "Siz hali o'z vazifalaringizni platformaga joylashtirmadingiz." 
                      : "Sizga hali vazifa tayinlanmagan yoki ishtirok etmayapsiz.")}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
