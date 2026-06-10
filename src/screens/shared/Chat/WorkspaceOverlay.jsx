import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Target, Plus, CheckCircle, Trash2, LayoutDashboard, X, Info, Rocket, ShieldCheck, ListTodo } from 'lucide-react';
import { useMilestones, useMilestoneMutations } from '../../../hooks/useMilestones';
import { useSocket } from '../../../hooks/useSocket';
import { hapticLight, hapticSuccess } from '../../../lib/telegram';
import { cn } from '../../../lib/utils';

export function WorkspaceOverlay({ taskId, isClient, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const { data: milestones = [], isLoading } = useMilestones(taskId);
  const { create, toggle, remove } = useMilestoneMutations(taskId);
  const [newTitle, setNewTitle] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    
    const handleMilestoneUpdate = () => {
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
    hapticSuccess();
    await create.mutateAsync({ title: newTitle });
    setNewTitle('');
  };

  const handleToggle = async (id, currentStatus) => {
    hapticLight();
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
    hapticLight();
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
    <div className="absolute inset-0 z-50 bg-edu-bg dark:bg-black animate-in slide-in-from-right-full duration-300 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-black/[0.03] dark:border-white/[0.05] px-6 flex items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-edu-primary/10 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-edu-primary" />
          </div>
          <div>
            <h2 className="font-bold text-edu-text leading-tight tracking-tight">Ish maydoni</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bosqichlar nazorati</p>
          </div>
        </div>
        <button 
          onClick={() => { hapticLight(); onClose(); }} 
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 active:scale-90 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
        
        {/* Progress Overview Card */}
        <div className="bg-edu-surface rounded-[28px] p-5 shadow-ios border border-edu-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-edu-primary/5 blur-2xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-edu-primary/10 flex items-center justify-center text-edu-primary">
                <Target size={16} />
              </div>
              <h3 className="text-[14px] font-bold text-edu-text tracking-tight">Umumiy progress</h3>
            </div>
            <span className="text-[16px] font-bold text-edu-primary">{Math.round(progress)}%</span>
          </div>
          
          <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden relative z-10">
            <div 
              className="h-full bg-gradient-to-r from-edu-primary to-edu-accent transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between mt-3 px-1 relative z-10">
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              {completedCount} ta bajarildi
            </p>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              {milestones.length} ta umumiy
            </p>
          </div>
        </div>

        {/* Milestones List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.15em]">
              Loyiha bosqichlari
            </h3>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
              <div className="w-8 h-8 border-3 border-edu-primary/30 border-t-edu-primary rounded-full animate-spin" />
              <p className="text-[13px] font-bold text-gray-400">Yuklanmoqda...</p>
            </div>
          ) : milestones.length === 0 ? (
            /* empty state with guide */
            <div className="bg-edu-surface rounded-[24px] p-8 border border-dashed border-gray-200 dark:border-white/10 text-center space-y-6">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 mx-auto">
                <Rocket size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-[17px] font-bold text-edu-text">Ish maydoni bo'sh</h4>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  Bu yerda vazifani kichik bosqichlarga bo'lib, loyiha holatini birgalikda kuzatishingiz mumkin.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { icon: <ListTodo size={14} />, text: 'Vazifani qismlarga bo\'ling' },
                  { icon: <ShieldCheck size={14} />, text: 'Nazoratni ta\'minlang' },
                  { icon: <Info size={14} />, text: 'Shaffof ish jarayoni' },
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-edu-bg rounded-2xl text-[12px] font-bold text-gray-600 dark:text-gray-400">
                    <span className="text-edu-primary">{tip.icon}</span>
                    {tip.text}
                  </div>
                ))}
              </div>

              {!isClient && (
                <div className="pt-2 px-2">
                  <p className="text-[11px] text-amber-600 dark:text-amber-500 font-bold bg-amber-500/5 p-3 rounded-2xl border border-amber-500/10">
                    💡 Faqat mijoz yangi bosqichlarni qo'shishi mumkin. Siz esa ularni bajarilgan deb belgilaysiz.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {milestones.map((m) => (
                <div 
                  key={m.id} 
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-[22px] border transition-all duration-300",
                    m.isCompleted 
                      ? "bg-emerald-500/5 border-emerald-500/10" 
                      : "bg-edu-surface border-black/[0.02] dark:border-white/[0.03] shadow-sm"
                  )}
                >
                  <button 
                    onClick={() => handleToggle(m.id, m.isCompleted)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 active:scale-75",
                      m.isCompleted 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "border-gray-200 dark:border-white/10"
                    )}
                  >
                    {m.isCompleted && <CheckCircle size={14} strokeWidth={3} />}
                  </button>
                  <span className={cn(
                    "flex-1 text-[14px] font-bold transition-all",
                    m.isCompleted ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-200"
                  )}>
                    {m.title}
                  </span>
                  {isClient && (
                    <button 
                      onClick={() => handleDelete(m.id)} 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Milestone: Premium Input (Client Only) */}
        {isClient && (
          <div className="pt-4 pb-12">
            <form onSubmit={handleCreate} className="relative group">
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Yangi bosqich nomi (masalan: Dizayn tayyor)..."
                className="w-full h-14 bg-edu-surface border border-edu-border rounded-2xl pl-5 pr-14 text-[14px] font-bold outline-none focus:ring-2 focus:ring-edu-primary/10 transition-all shadow-ios"
              />
              <button 
                type="submit" 
                disabled={!newTitle.trim() || create.isPending}
                className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-edu-primary text-white flex items-center justify-center shadow-lg shadow-edu-primary/20 disabled:opacity-30 disabled:shadow-none transition-all active:scale-90"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
