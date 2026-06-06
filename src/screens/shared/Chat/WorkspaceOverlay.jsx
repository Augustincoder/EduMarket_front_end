import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Target, Plus, CheckCircle, Circle, Trash2, Layout, X } from 'lucide-react';
import { useMilestones, useMilestoneMutations } from '../../../hooks/useMilestones';
import { useSocket } from '../../../hooks/useSocket';
import { Button } from '../../../components/ui/Button';

export function WorkspaceOverlay({ taskId, isClient, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const { data: milestones = [], isLoading } = useMilestones(taskId);
  const { create, toggle, remove } = useMilestoneMutations(taskId);
  const [newTitle, setNewTitle] = useState('');
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    
    const handleMilestoneUpdate = () => {
      // Invalidate the cache to fetch latest milestones
      queryClient.invalidateQueries({ queryKey: ['milestones', taskId] });
    };

    socket.on('milestone_updated', handleMilestoneUpdate);
    return () => {
      socket.off('milestone_updated', handleMilestoneUpdate);
    };
  }, [socket, taskId, queryClient]);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await create.mutateAsync({ title: newTitle });
    setNewTitle('');
  };

  const handleToggle = async (id, currentStatus) => {
    // Optimistic update
    queryClient.setQueryData(['milestones', taskId], (old) => 
      old?.map(m => m.id === id ? { ...m, isCompleted: !currentStatus } : m)
    );
    try {
      await toggle.mutateAsync({ milestoneId: id, isCompleted: !currentStatus });
    } catch {
      queryClient.invalidateQueries({ queryKey: ['milestones', taskId] });
    }
  };

  const handleDelete = async (id) => {
    queryClient.setQueryData(['milestones', taskId], (old) => old?.filter(m => m.id !== id));
    try {
      await remove.mutateAsync(id);
    } catch {
      queryClient.invalidateQueries({ queryKey: ['milestones', taskId] });
    }
  };

  const completedCount = milestones.filter(m => m.isCompleted).length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  return (
    <div className="absolute inset-0 z-50 bg-edu-bg/95 backdrop-blur-md animate-in slide-in-from-right-full duration-300 flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-edu-border/30 px-4 flex items-center justify-between bg-edu-surface/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-edu-primary/10 flex items-center justify-center">
            <Layout className="w-4 h-4 text-edu-primary" />
          </div>
          <h2 className="font-bold text-edu-text">Ish maydoni</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-edu-border/20 rounded-full">
          <X className="w-5 h-5 text-edu-muted" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Progress Overview */}
        <div className="bg-edu-surface rounded-2xl p-4 border border-edu-border/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-edu-text flex items-center gap-2">
              <Target className="w-4 h-4 text-edu-primary" />
              Progress
            </h3>
            <span className="text-xs font-black text-edu-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-edu-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-edu-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-edu-muted font-medium mt-2">
            {completedCount} / {milestones.length} vazifalar bajarildi
          </p>
        </div>

        {/* Milestones List */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-edu-muted uppercase tracking-wider pl-1 mb-3">
            Bosqichlar (Milestones)
          </h3>
          
          {isLoading ? (
            <div className="text-center text-sm text-edu-muted py-4">Yuklanmoqda...</div>
          ) : milestones.length === 0 ? (
            <div className="text-center p-6 bg-edu-surface/30 rounded-2xl border border-dashed border-edu-border/50">
              <p className="text-xs text-edu-muted font-medium">Hozircha hech qanday bosqich qo'shilmagan.</p>
            </div>
          ) : (
            milestones.map((m) => (
              <div 
                key={m.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  m.isCompleted ? 'bg-green-500/5 border-green-500/10' : 'bg-edu-surface border-edu-border/30'
                }`}
              >
                <button 
                  onClick={() => handleToggle(m.id, m.isCompleted)}
                  className={`flex-shrink-0 transition-colors ${m.isCompleted ? 'text-green-500' : 'text-edu-muted hover:text-edu-primary'}`}
                >
                  {m.isCompleted ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className={`flex-1 text-sm font-medium ${m.isCompleted ? 'text-edu-muted line-through' : 'text-edu-text'}`}>
                  {m.title}
                </span>
                {isClient && (
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 text-edu-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Milestone (Client Only) */}
        {isClient && (
          <form onSubmit={handleCreate} className="pt-2">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Yangi bosqich nomi..."
                className="flex-1 bg-edu-surface border border-edu-border/30 rounded-xl px-3 text-sm focus:outline-none focus:border-edu-primary"
              />
              <Button type="submit" variant="primary" disabled={!newTitle.trim() || create.isPending} className="px-4">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
