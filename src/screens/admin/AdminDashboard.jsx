import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Crown, 
  AlertOctagon, 
  Gavel, 
  GraduationCap,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats().then(r => r.data.data),
    refetchInterval: 15000 // auto refresh every 15s
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard Stats...</span>
      </div>
    );
  }

  const statCards = [
    { label: 'Jami Users', value: statsData?.users || 0, icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', path: '/admin/users' },
    { label: 'Topshiriqlar', value: statsData?.tasks?.total || 0, icon: Briefcase, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', path: '/admin/moderator' },
    { label: 'VIP Arizalar', value: statsData?.pendingVipRequests || 0, icon: Crown, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', path: '/admin/vip', alert: statsData?.pendingVipRequests > 0 },
    { label: 'Shikoyatlar', value: statsData?.pendingReports || 0, icon: AlertOctagon, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', path: '/admin/complaints', alert: statsData?.pendingReports > 0 },
    { label: 'Ochiq Nizolar', value: statsData?.openDisputes || 0, icon: Gavel, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', path: '/admin/disputes', alert: statsData?.openDisputes > 0 },
    { label: 'Talaba So\'rovlari', value: statsData?.pendingStudentVerifications || 0, icon: GraduationCap, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', path: '/admin/users', alert: statsData?.pendingStudentVerifications > 0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* ── Stat Cards Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              onClick={() => navigate(card.path)}
              className={`p-6 bg-slate-950/40 border rounded-3xl flex flex-col justify-between h-36 cursor-pointer hover:border-slate-700 transition-all active:scale-[0.98] relative overflow-hidden group ${card.color.split(' ')[2]}`}
            >
              {card.alert && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
              
              <div className="flex justify-between items-start">
                <span className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${card.color.split(' ')[0]} ${card.color.split(' ')[1]} ${card.color.split(' ')[2]}`}>
                  <Icon size={20} />
                </span>
                <span className="text-slate-600 group-hover:text-slate-400 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{card.label}</p>
                <p className="text-2xl font-black text-white mt-1.5">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Section (Graph & Active Alerts) ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Neon SVG Chart Widget */}
        <div className="lg:col-span-2 bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between min-h-[350px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Activity size={16} className="text-indigo-400" />
                Tizim Oqimi & Faollik
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Bajarilgan topshiriqlar ulushi: {statsData?.tasks?.total ? Math.round((statsData?.tasks?.completed / statsData?.tasks?.total) * 100) : 0}%</p>
            </div>
            <div className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
              <TrendingUp size={12} />
              Realtime
            </div>
          </div>

          <div className="flex-1 px-2 h-48 py-4 relative w-full">
            {statsData?.chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statsData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => Math.round(value)}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px', color: '#f1f5f9' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    name="Yangi foydalanuvchilar" 
                    stroke="#818cf8" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#818cf8' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tasks" 
                    name="Yangi topshiriqlar" 
                    stroke="#34d399" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorTasks)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#34d399' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Grafik ma'lumotlari yuklanmoqda...
              </div>
            )}
          </div>
        </div>

        {/* Alerts / Tasks requiring quick action */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-4">Tezkor Moderator Harakatlari</h3>
            <div className="space-y-3.5">
              
              {/* VIP Request Alert */}
              <div 
                onClick={() => navigate('/admin/vip')}
                className="p-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Crown size={16} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200">Kutilayotgan VIP To'lovlar</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{statsData?.pendingVipRequests || 0} ta ariza tasdiqlash kutilmoqda</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-600" />
              </div>

              {/* Reports Alert */}
              <div 
                onClick={() => navigate('/admin/complaints')}
                className="p-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <AlertOctagon size={16} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200">Yopilmagan Shikoyatlar</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{statsData?.pendingReports || 0} ta foydalanuvchi shikoyati bor</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-600" />
              </div>

              {/* Disputes Alert */}
              <div 
                onClick={() => navigate('/admin/disputes')}
                className="p-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Gavel size={16} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200">Ochiq Nizolar (Disputes)</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{statsData?.openDisputes || 0} ta shartnoma nizo holatida</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-600" />
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/60 text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            🚨 Har bir amal auditga yoziladi
          </div>
        </div>

      </div>

    </div>
  );
}
