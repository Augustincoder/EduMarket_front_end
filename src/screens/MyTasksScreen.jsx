import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { useMyTasks } from '../hooks/useTasks';
import { useAuthStore } from '../store/authStore';
import TaskCard from '../components/cards/TaskCard';
import { TaskCardSkeleton } from '../components/ui/SkeletonCard';
import { FilterChip } from '../components/ui/Chip';

export default function MyTasksScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState(user?.isFreelancer ? 'FREELANCER' : 'CLIENT');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const setStatusFilter = (val) => {
    if (val) {
      setSearchParams({ status: val });
    } else {
      setSearchParams({});
    }
  };

  const { data: tasks, isLoading } = useMyTasks(activeTab, statusFilter);

  return (
    <PageLayout bgClass="bg-slate-50 dark:bg-slate-900">
      <div className="pt-4 pb-24 px-4 h-full flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Mening vazifalarim</h1>
        
        {/* Role Tabs */}
        {user?.isFreelancer && (
          <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'FREELANCER' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500'
              }`}
              onClick={() => setActiveTab('FREELANCER')}
            >
              Ijrochi sifatida
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'CLIENT' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500'
              }`}
              onClick={() => setActiveTab('CLIENT')}
            >
              Mijoz sifatida
            </button>
          </div>
        )}

        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
          <FilterChip label="Barchasi" active={!statusFilter} onClick={() => setStatusFilter('')} />
          <FilterChip label="Faol" active={statusFilter === 'OPEN'} onClick={() => setStatusFilter('OPEN')} />
          <FilterChip label="Bajarilmoqda" active={statusFilter === 'IN_PROGRESS'} onClick={() => setStatusFilter('IN_PROGRESS')} />
          <FilterChip label="Tekshiruvda" active={statusFilter === 'IN_REVIEW'} onClick={() => setStatusFilter('IN_REVIEW')} />
          <FilterChip label="Yakunlangan" active={statusFilter === 'COMPLETED'} onClick={() => setStatusFilter('COMPLETED')} />
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <>
              <TaskCardSkeleton />
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </>
          ) : tasks?.length > 0 ? (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-3">📭</span>
              <p>Vazifalar topilmadi</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
