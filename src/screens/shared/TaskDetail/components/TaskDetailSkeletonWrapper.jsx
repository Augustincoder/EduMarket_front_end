import { AlertTriangle } from 'lucide-react';
import { PageLayout } from '../../../../components/layout/PageLayout';
import { TaskHeader } from './TaskHeader';
import { TaskDetailSkeleton } from '../../../../components/ui/SkeletonCard';
import { Button } from '../../../../components/ui/Button';

export function TaskDetailSkeletonWrapper({ isLoading, error }) {
  if (isLoading) {
    return (
      <PageLayout showNav={false} scrollable={false}>
        <div className="flex flex-col h-dvh bg-edu-bg">
          <TaskHeader title="Yuklanmoqda..." showBack />
          <div className="flex-1 overflow-y-auto">
            <TaskDetailSkeleton />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout showNav={false} scrollable={false}>
        <div className="flex flex-col h-dvh bg-edu-bg">
          <TaskHeader title="Xatolik" showBack />
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
            <div className="w-full bg-edu-surface border border-red-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-edu-text mb-1">Vazifani yuklashda xatolik</h3>
              <p className="text-[11px] text-edu-muted font-medium mb-4 max-w-[200px]">Server bilan ulanishda xatolik yoki vazifa mavjud emas. Iltimos qayta urinib ko'ring.</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="rounded-xl h-9 text-xs font-bold border-edu-border">
                Qayta yuklash
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return null;
}
