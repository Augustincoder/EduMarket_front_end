// src/screens/PublicProfileScreen.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/Card';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import { Avatar } from '../../components/ui/Avatar';
import { UserBadge, VipBadge, VerifiedBadge } from '../../components/ui/Badge';
import { ProfileSkeleton } from '../../components/ui/SkeletonCard';
import { ReputationPassportCard } from '../../components/cards/ReputationPassportCard';
import { usersApi } from '../../services/users.service';
import { filesApi } from '../../services/other.service';
import { tasksApi } from '../../services/tasks.service';

import { Heart, Zap, Trophy, Star, Clock, ChevronRight, FileText, MessageCircle } from 'lucide-react';
import { hapticLight, hapticSuccess } from '../../lib/telegram';
import { useFavorites } from '../../hooks/useFavorites';
import EduViewer from '../../components/ui/EduViewer';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { formatPrice, cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

export default function PublicProfileScreen() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn:  () => usersApi.getUser(userId).then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

  const { data: gigs } = useQuery({
    queryKey: ['gigs', 'user', userId],
    queryFn: () => tasksApi.getUserGigs(userId).then(r => r.data.data),
    enabled: !!profile,
  });

  const { isFavorite, toggleFavorite } = useFavorites();
  const [viewerFile, setViewerFile] = useState(null);

  const handleViewFile = async (fileId, fileName) => {
    try {
      const res = await filesApi.getUrl(fileId);
      setViewerFile({ url: res.data.data.url, name: fileName || fileId.split('/').pop() });
    } catch {
      toast.error('Faylni ochishda xatolik');
    }
  };

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) return null;

  const avgRating = profile.ratingCount ? (profile.ratingSum / profile.ratingCount).toFixed(1) : null;
  const isFav = isFavorite(userId);

  return (
    <PageLayout showNav={false} bgClass="bg-[#F2F2F7] dark:bg-black">
      <Header 
        title="Mutaxassis profili" 
        showBack 
        right={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { hapticLight(); toggleFavorite(profile); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-white/5 shadow-sm transition-all active:scale-90"
            >
              <Heart size={15} fill={isFav ? "#FF3B30" : "none"} className={isFav ? "text-[#FF3B30]" : "text-gray-400"} />
            </button>
            <button
              onClick={() => navigate(`/report?targetId=${userId}&targetType=USER`)}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-white/5 shadow-sm text-gray-400 active:scale-90 transition-all"
            >
              <span className="text-[14px]">🚩</span>
            </button>
          </div>
        }
      />

      <div className="px-4 pt-6 space-y-6 pb-32">
        {/* ── HERO SECTION ── */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-edu-primary/20 blur-3xl rounded-full scale-150 animate-pulse-subtle" />
            <Avatar name={profile.fullname} avatarUrl={profile.avatarUrl} size="2xl" className="ring-4 ring-white dark:ring-[#1C1C1E] shadow-xl relative z-10" />
            {profile.isVip && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-1.5 border-4 border-white dark:border-[#1C1C1E] shadow-lg z-20">
                <VipBadge size="xs" hideLabel />
              </div>
            )}
          </div>

          <div className="space-y-1 relative z-10">
            <h1 className="text-[24px] font-black font-display text-gray-900 dark:text-white leading-tight tracking-tight">
              {profile.fullname}
            </h1>
            <p className="text-[13px] font-bold text-gray-400 tracking-wide uppercase">@{profile.username || 'username'}</p>
            
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              <UserBadge badge={profile.badge} size="xs" />
              {profile.verificationStatus === 'APPROVED' && <VerifiedBadge size="xs" />}
            </div>
          </div>
        </div>

        {/* ── QUICK STATS ROW ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Bajarilgan', value: profile.completedTasksCount ?? 0, icon: <Trophy size={14} className="text-emerald-500" />, bg: 'bg-emerald-500/5' },
            { label: 'Reyting', value: avgRating ? avgRating : '—', icon: <Star size={14} className="text-amber-500" />, bg: 'bg-amber-500/5' },
            { label: 'Streak', value: `${profile.streakCount || 0} kun`, icon: <Zap size={14} className="text-orange-500" />, bg: 'bg-orange-500/5' },
          ].map((stat, i) => (
            <div key={i} className={cn("p-3.5 rounded-[24px] flex flex-col items-center gap-1.5 border border-black/[0.03] dark:border-white/[0.03] bg-white dark:bg-[#1C1C1E] shadow-ios")}>
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-1", stat.bg)}>
                {stat.icon}
              </div>
              <p className="text-[15px] font-black text-gray-900 dark:text-white leading-none">{stat.value}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── REPUTATION PASSPORT ── */}
        <ReputationPassportCard profile={profile} />

        {/* ── ABOUT & SKILLS (CV STYLE) ── */}
        <Card className="bg-white dark:bg-[#1C1C1E] shadow-ios border border-black/[0.03] dark:border-white/[0.03]" radius="2xl">
          <CardContent className="p-6 space-y-6">
            {profile.bio && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">O'zi haqida</p>
                <p className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{profile.bio}</p>
              </div>
            )}

            {profile.skills?.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ko'nikmalar</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span key={s} className="px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/[0.02] dark:border-white/[0.02] text-[12px] font-black text-gray-700 dark:text-gray-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.achievements?.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Yutuqlar</p>
                <div className="grid grid-cols-1 gap-2">
                  {profile.achievements.map((ach, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                        <Trophy size={16} />
                      </div>
                      <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">{ach}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── PORTFOLIO SECTION (REAL PREVIEWS) ── */}
        {profile.portfolioItems?.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[16px] font-black text-gray-900 dark:text-white tracking-tight">Portfolio ishlari</h3>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{profile.portfolioItems.length} ta loyiha</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {profile.portfolioItems.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => { hapticLight(); handleViewFile(item.fileId, item.title); }}
                  className="bg-white dark:bg-[#1C1C1E] border border-black/[0.03] dark:border-white/[0.03] rounded-[24px] p-3 flex flex-col gap-3 active:scale-[0.98] transition-all text-left shadow-ios"
                >
                  <div className="aspect-square w-full rounded-2xl bg-gray-50 dark:bg-black/20 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <FileText size={22} />
                    </div>
                    {/* Placeholder for real image preview if we had thumbnails */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                  </div>
                  <div className="px-1 space-y-0.5">
                    <p className="text-[13px] font-black text-gray-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      Ko'rish <ChevronRight size={10} />
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── GIGS SECTION (SERVICES) ── */}
        {gigs?.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[16px] font-black text-gray-900 dark:text-white tracking-tight">Xizmatlar (Gigs)</h3>
            </div>
            
            <div className="space-y-3">
              {gigs.map((gig) => (
                <div 
                  key={gig.id}
                  onClick={() => navigate(`/gigs/${gig.id}`)}
                  className="bg-white dark:bg-[#1C1C1E] border border-black/[0.03] dark:border-white/[0.03] rounded-[28px] p-5 shadow-ios active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="space-y-1">
                      <h4 className="text-[15px] font-black text-gray-900 dark:text-white leading-tight line-clamp-1 group-hover:text-edu-primary transition-colors">
                        {gig.title}
                      </h4>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={12} /> {gig.deliveryDays} kun yetkazib berish
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-black text-emerald-600 dark:text-[#30D158]">{formatPrice(gig.price)}</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase">UZS</p>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">
                    {gig.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── STICKY CALL TO ACTION ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] p-4 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-t border-black/[0.05] dark:border-white/[0.05] pb-safe z-50 animate-slide-up">
        <div className="flex gap-3">
          <button
            onClick={() => { hapticLight(); navigate(`/tasks/${userId}/chat`); }}
            className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0 active:scale-90 transition-all border border-black/[0.02] dark:border-white/[0.05]"
          >
            <MessageCircle size={22} />
          </button>
          <Button
            variant="primary"
            onClick={() => {
              hapticSuccess();
              navigate(`/tasks/create?freelancerId=${userId}`);
            }}
            className="flex-1 h-14 rounded-2xl font-black text-[15px] shadow-ios-primary uppercase tracking-widest"
          >
            <span>Menga ishlash taklif qiling</span>
          </Button>
        </div>
      </div>

      <EduViewer
        isOpen={!!viewerFile}
        onClose={() => setViewerFile(null)}
        file={viewerFile}
      />
    </PageLayout>
  );
}
