import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../services/tasks.service';
import { gigsApi } from '../../services/gigs.service';
import { adminApi } from '../../services/admin.service';
import { formatPrice } from '../../lib/constants';
import { toast } from 'react-hot-toast';
import { ShieldAlert, Trash2, Briefcase, Award } from 'lucide-react';

export default function AdminContentModerator() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('TASKS'); // 'TASKS' | 'GIGS'

  // 1. Fetch Tasks
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['admin', 'all-tasks'],
    queryFn: () => tasksApi.getAll({ limit: 100 }).then(r => r.data.data.tasks),
    enabled: activeTab === 'TASKS'
  });
  const tasks = tasksData || [];

  // 2. Fetch Gigs
  const { data: gigsData, isLoading: isGigsLoading } = useQuery({
    queryKey: ['admin', 'all-gigs'],
    queryFn: () => gigsApi.getAll({ limit: 100 }).then(r => r.data.data.gigs),
    enabled: activeTab === 'GIGS'
  });
  const gigs = gigsData || [];

  // 3. Delete Mutations
  const deleteTaskMutation = useMutation({
    mutationFn: (id) => adminApi.deleteTask(id),
    onSuccess: () => {
      toast.success('Topshiriq o\'chirildi (CANCELED holatiga o\'tkazildi)');
      queryClient.invalidateQueries(['admin', 'all-tasks']);
      queryClient.invalidateQueries(['admin', 'stats']);
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const deleteGigMutation = useMutation({
    mutationFn: (id) => adminApi.deleteGig(id),
    onSuccess: () => {
      toast.success('Xizmat (gig) o\'chirildi (faolsizlantirildi)');
      queryClient.invalidateQueries(['admin', 'all-gigs']);
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const handleDeleteTask = (id) => {
    if (window.confirm('Haqiqatdan ham ushbu vazifani o\'chirib bekor qilmoqchimisiz?')) {
      deleteTaskMutation.mutate(id);
    }
  };

  const handleDeleteGig = (id) => {
    if (window.confirm('Haqiqatdan ham ushbu xizmatni o\'chirib faolsizlantirmoqchimisiz?')) {
      deleteGigMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className="flex gap-2 p-1.5 bg-slate-950/40 border border-slate-800/60 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('TASKS')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TASKS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Topshiriqlar (Tasks)
        </button>
        <button
          onClick={() => setActiveTab('GIGS')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'GIGS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Xizmatlar (Gigs)
        </button>
      </div>

      {/* ── Tasks Tab Content ────────────────────────────── */}
      {activeTab === 'TASKS' && (
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl overflow-hidden">
          {isTasksLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yuklanmoqda...</span>
            </div>
          ) : tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-950/20">
                    <th className="py-4 px-6">Topshiriq</th>
                    <th className="py-4 px-6">Kategoriya</th>
                    <th className="py-4 px-6">Narx diapazoni</th>
                    <th className="py-4 px-6">Muddati</th>
                    <th className="py-4 px-6">Holat</th>
                    <th className="py-4 px-6 text-right">Moderatsiya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-900/20 transition-all">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-100">{task.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 max-w-sm truncate">{task.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {task.category}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-200">
                        {formatPrice(task.priceMin)} - {formatPrice(task.priceMax)} so'm
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(task.deadline).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          task.status === 'OPEN' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          task.status === 'CANCELED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end">
                          {task.status !== 'CANCELED' && (
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 bg-red-600/10 hover:bg-red-600/25 text-red-500 rounded-xl transition-all border border-red-500/20"
                              title="Spam deb o'chirish"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-500 text-xs font-semibold">Tizimda topshiriqlar topilmadi</p>
            </div>
          )}
        </div>
      )}

      {/* ── Gigs Tab Content ─────────────────────────────── */}
      {activeTab === 'GIGS' && (
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl overflow-hidden">
          {isGigsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yuklanmoqda...</span>
            </div>
          ) : gigs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-950/20">
                    <th className="py-4 px-6">Gig / Xizmat</th>
                    <th className="py-4 px-6">Bajaruvchi (Freelancer)</th>
                    <th className="py-4 px-6">Narx</th>
                    <th className="py-4 px-6">Yetkazib berish</th>
                    <th className="py-4 px-6">Holat</th>
                    <th className="py-4 px-6 text-right">Moderatsiya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
                  {gigs.map((gig) => (
                    <tr key={gig.id} className="hover:bg-slate-900/20 transition-all">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-100">{gig.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 max-w-sm truncate">{gig.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {gig.freelancer?.fullname || 'Noma\'lum'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-indigo-400">
                        {formatPrice(gig.price)} UZS
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {gig.deliveryDays} kun
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          gig.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {gig.isActive ? 'Faol' : 'Faolsizlantirilgan'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end">
                          {gig.isActive && (
                            <button
                              onClick={() => handleDeleteGig(gig.id)}
                              className="p-2 bg-red-600/10 hover:bg-red-600/25 text-red-500 rounded-xl transition-all border border-red-500/20"
                              title="Spam gig deb o'chirish"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-500 text-xs font-semibold">Tizimda giglar topilmadi</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
