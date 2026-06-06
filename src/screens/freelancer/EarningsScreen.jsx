import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { PageLayout } from '../../components/layout/PageLayout';
import { Header } from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/Card';
import { analyticsApi } from '../../services/other.service';
import { formatPrice } from '../../lib/constants';
import { Wallet, Info, Calendar, Snowflake, ArrowUpRight, DollarSign } from 'lucide-react';
import { hapticLight } from '../../lib/telegram';

export default function EarningsScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [period, setPeriod] = useState('month'); // 'month' | '3months' | 'year'

  // Fetch stats from analytics API
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics', 'freelancer'],
    queryFn: () => analyticsApi.getMe({ role: 'FREELANCER' }).then(r => r.data.data),
    staleTime: 15 * 1000,
  });

  const recentCompleted = stats?.recentCompleted || [];

  // Filter completed tasks by selected period
  const filteredCompleted = recentCompleted.filter(task => {
    if (!task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    const diffDays = (new Date().getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (period === 'month') return diffDays <= 30;
    if (period === '3months') return diffDays <= 90;
    return diffDays <= 365;
  });

  return (
    <PageLayout showNav={true} bgClass="bg-edu-bg">
      <Header title="Daromadlarim" onBack={() => navigate(-1)} showBack={false} />
      
      <div className="pt-3 pb-24 px-4 h-full flex flex-col space-y-5 overflow-y-auto scrollbar-hide">
        
        {/* ── Balance Card ────────────────────────────── */}
        <div className="bg-gradient-to-br from-edu-accent to-[#7064E2] rounded-3xl p-6 text-white shadow-lg shadow-edu-accent/20 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2 text-white/80">
            <Wallet size={16} />
            <span className="text-[10px] font-black uppercase tracking-wider">Umumiy daromad</span>
          </div>
          <p className="text-3xl font-black font-display mb-5">
            {isLoading ? '...' : formatPrice(stats?.totalEarned || 0)} <span className="text-lg font-medium">UZS</span>
          </p>
          
          <div className="flex gap-4 pt-4 border-t border-white/20 justify-between">
            <div className="flex-1 space-y-0.5">
              <span className="flex items-center gap-1 text-[9px] font-bold text-white/70 uppercase tracking-wider">
                <Calendar size={10} /> Joriy oy
              </span>
              <p className="text-sm font-black">{isLoading ? '...' : formatPrice(stats?.thisMonthEarned || 0)} UZS</p>
            </div>
            <div className="w-[1px] bg-white/20" />
            <div className="flex-1 space-y-0.5 pl-2">
              <span className="flex items-center gap-1 text-[9px] font-bold text-white/70 uppercase tracking-wider">
                <Snowflake size={10} className="text-blue-200 animate-spin-slow" /> Muzlatilgan
              </span>
              <p className="text-sm font-black">{isLoading ? '...' : formatPrice(stats?.frozenEarned || 0)} UZS</p>
            </div>
          </div>
        </div>

        {/* ── VIP status Card ─────────────────────────── */}
        {user?.isVip ? (
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-3xl p-5 text-white shadow-md shadow-amber-500/10 flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">👑</span>
                <h3 className="text-xs font-black uppercase tracking-wider">VIP Status faol</h3>
              </div>
              <p className="text-[10px] text-white/80 font-medium">Muddati: {new Date(user?.vipExpiresAt).toLocaleDateString('uz-UZ')}</p>
            </div>
            <button onClick={() => navigate('/vip')} className="bg-white text-amber-700 font-bold text-2xs px-4 py-2 rounded-xl active:scale-95 transition-transform">
              Boshqarish
            </button>
          </div>
        ) : (
          <div className="bg-edu-surface border border-edu-border/40 rounded-3xl p-5 flex justify-between items-center hover:border-amber-500/30 transition-colors cursor-pointer active-bounce" onClick={() => navigate('/vip')}>
            <div className="space-y-1 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">👑</span>
                <h3 className="text-xs font-black text-edu-text uppercase tracking-wider font-display">VIP rejimga o'ting</h3>
              </div>
              <p className="text-[10px] text-edu-muted font-medium">Buyurtmalarga birinchi bo'lib taklif bering va daromadni 2 barobar oshiring!</p>
            </div>
            <span className="text-amber-500 font-black text-xs shrink-0 flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-xl">
              Sotib olish →
            </span>
          </div>
        )}

        {/* ── Weekly Earnings Chart ───────────────────── */}
        {!isLoading && stats?.weeklyEarnings && stats.weeklyEarnings.length > 0 && (
          <div className="bg-edu-surface border border-edu-border/40 rounded-3xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-edu-text uppercase tracking-wider">Haftalik daromad (so'nggi 7 kun)</h3>
            <div className="flex justify-between items-end h-28 pt-2">
              {stats.weeklyEarnings.map((day, idx) => {
                const maxAmount = Math.max(...stats.weeklyEarnings.map(d => d.amount), 1);
                const percent = Math.min((day.amount / maxAmount) * 100, 100);
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="text-[8px] font-black text-edu-primary h-3">
                      {day.amount > 0 ? `${Math.round(day.amount / 1000)}k` : ''}
                    </div>
                    <div className="w-5 bg-edu-bg rounded-lg h-16 relative overflow-hidden flex items-end border border-edu-border/10">
                      <div 
                        className="w-full bg-gradient-to-t from-edu-primary to-edu-accent rounded-lg transition-all duration-500" 
                        style={{ height: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-edu-muted">{day.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Category Breakdown ───────────────────────── */}
        {!isLoading && stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
          <div className="bg-edu-surface border border-edu-border/40 rounded-3xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-edu-text uppercase tracking-wider font-display">Kategoriyalar bo'yicha</h3>
            <div className="space-y-3">
              {stats.categoryBreakdown.map((cat, idx) => {
                const total = stats.categoryBreakdown.reduce((acc, c) => acc + c.amount, 0);
                const percent = Math.round((cat.amount / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-2xs font-semibold">
                      <span className="text-edu-text">{cat.category}</span>
                      <span className="text-edu-muted">{formatPrice(cat.amount)} so'm ({percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-edu-bg rounded-full overflow-hidden border border-edu-border/10">
                      <div 
                        className="h-full bg-edu-accent rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Frozen Info Alert ───────────────────────── */}
        {stats?.frozenEarned > 0 && (
          <div className="bg-edu-accent/10 border border-edu-accent/20 rounded-2xl p-3.5 flex gap-2.5 items-start">
            <Info size={16} className="text-edu-accent shrink-0 mt-0.5" />
            <p className="text-[11px] text-edu-text opacity-90 leading-normal font-medium">
              Muzlatilgan mablag'lar faol topshiriqlar yakunlangandan keyin asosiy hisobingizga avtomatik ravishda o'tkazib beriladi.
            </p>
          </div>
        )}

        {/* ── Period Selector ─────────────────────────── */}
        <div className="flex bg-edu-surface border border-edu-border/50 p-1 rounded-xl shadow-sm">
          <button 
            onClick={() => { setPeriod('month'); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${period === 'month' ? 'bg-edu-primary text-white shadow-btn' : 'text-edu-muted hover:bg-edu-bg'}`}
          >
            Bu oy
          </button>
          <button 
            onClick={() => { setPeriod('3months'); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${period === '3months' ? 'bg-edu-primary text-white shadow-btn' : 'text-edu-muted hover:bg-edu-bg'}`}
          >
            3 oy
          </button>
          <button 
            onClick={() => { setPeriod('year'); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${period === 'year' ? 'bg-edu-primary text-white shadow-btn' : 'text-edu-muted hover:bg-edu-bg'}`}
          >
            Shu yil
          </button>
        </div>

        {/* ── Transaction History ──────────────────────── */}
        <div className="space-y-3 flex-1 flex flex-col">
          <h2 className="text-sm font-bold text-edu-text uppercase tracking-wider">Bajarilgan ishlar tarixi</h2>
          
          {isLoading ? (
            <div className="space-y-2 animate-pulse flex-1">
              {[1, 2].map(i => (
                <div key={i} className="h-16 bg-edu-surface rounded-2xl border border-edu-border/20" />
              ))}
            </div>
          ) : filteredCompleted.length > 0 ? (
            <div className="space-y-2.5">
              {filteredCompleted.map((task) => (
                <Card 
                  key={task.id}
                  isPressable
                  onClick={() => { navigate(`/tasks/${task.id}`); }}
                  className="bg-edu-surface border border-edu-border/40 hover:border-edu-border active-bounce"
                  radius="2xl"
                >
                  <CardContent className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-xl bg-edu-primary/10 text-edu-primary flex items-center justify-center shrink-0">
                        <DollarSign size={16} />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-edu-text truncate">{task.title}</h4>
                        <p className="text-[10px] text-edu-muted mt-0.5">
                          {task.completedAt ? new Date(task.completedAt).toLocaleDateString('uz-UZ') : ''} · {task.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs font-black text-edu-primary">
                        +{formatPrice(task.agreedPrice || 0)} so'm
                      </span>
                      <ArrowUpRight size={12} className="text-edu-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-edu-muted bg-edu-surface/50 border border-edu-border/20 rounded-3xl">
              <span className="text-3xl mb-2.5">💸</span>
              <p className="text-xs font-bold">Ushbu davr uchun daromad tarixi mavjud emas</p>
            </div>
          )}
        </div>

      </div>
    </PageLayout>
  );
}
