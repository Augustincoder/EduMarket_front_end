import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { TaskMetadata } from '../../../../components/cards/TaskMetadata';
import { formatPriceRange, cn } from '../../../../lib/utils';

export function TaskTitleDescription({ task, isMember, handleViewFile }) {
  const [descExpanded, setDescExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="px-1 space-y-1">
        <h1 className="text-2xl font-bold font-display text-edu-text leading-[1.3] tracking-tight">
          {task.title}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-500">
            {formatPriceRange(task.priceMin, task.priceMax)}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          <span className="text-[12px] font-bold text-gray-400 capitalize">{task.category}</span>
        </div>
        <TaskMetadata category={task.category} metadata={task.metadata} />
      </div>

      <div className="bg-edu-surface rounded-xl p-6 shadow-ios border border-edu-border space-y-5">
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-edu-muted uppercase tracking-[0.15em]">Vazifa tavsifi</p>
          <div className="relative">
            <p className={cn(
              'text-[14px] text-gray-700 dark:text-gray-300 leading-[1.6] font-medium transition-all duration-300',
              !descExpanded && 'line-clamp-6'
            )}>
              {task.description}
            </p>
            {task.description?.length > 250 && (
              <button
                className="text-[12px] text-edu-primary font-bold mt-2 flex items-center gap-1 active:scale-95 bg-edu-surface pr-2"
                onClick={() => setDescExpanded((v) => !v)}
              >
                {descExpanded ? 'Yopish' : 'To\'liq oqish'}
                {descExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        </div>

        {task.attachmentFileIds?.length > 0 && isMember && (
          <div className="pt-5 border-t border-gray-100 dark:border-white/5 space-y-3">
            <p className="text-[10px] font-bold text-edu-muted uppercase tracking-[0.15em]">Hujjatlar</p>
            <div className="grid grid-cols-1 gap-2">
              {task.attachmentFileIds.map((fileId, idx) => (
                <button
                  key={fileId}
                  onClick={() => handleViewFile(fileId)}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-black/[0.02] dark:border-white/[0.02] text-[12px] font-bold text-gray-700 dark:text-gray-300 active:scale-[0.98] transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-edu-primary/10 flex items-center justify-center text-edu-primary shrink-0">
                    <FileText size={16} />
                  </div>
                  <span className="truncate flex-1 text-left">Fayl #{idx + 1} ni ko'rish</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
