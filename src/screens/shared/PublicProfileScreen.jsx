// src/screens/PublicProfileScreen.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/Card';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import { Avatar } from '../../components/ui/Avatar';
import { UserBadge, VerifiedBadge } from '../../components/ui/Badge';
import { SkillChip } from '../../components/ui/Chip';
import { ProfileSkeleton } from '../../components/ui/SkeletonCard';
import { ReputationRadarChart } from '../../components/profile/ReputationRadarChart';
import { usersApi } from '../../services/users.service';
import { filesApi } from '../../services/other.service';
import { gigsApi } from '../../services/gigs.service';

import { Heart, Zap, Trophy, Star, Clock, ChevronRight, FileText, MessageCircle } from 'lucide-react';
import { hapticLight, hapticSuccess } from '../../lib/telegram';
import { useFavorites } from '../../hooks/useFavorites';
import EduViewer from '../../components/ui/EduViewer';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { formatPrice } from '../../lib/utils';

export default function PublicProfileScreen() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn:  () => usersApi.getUser(userId).then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

  const { data: dnaData } = useQuery({
    queryKey: ['users', userId, 'reputation'],
    queryFn: () => usersApi.getUserReputationDNA(userId).then((r) => r.data.data),
    enabled: !!profile,
  });

  const { data: gigsData } = useQuery({
    queryKey: ['gigs', 'user', userId],
    queryFn: () => gigsApi.getAll({ freelancerId: userId }).then(r => r.data.data),
    enabled: !!profile,
  });

  const gigs = gigsData?.gigs || [];

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
    <PageLayout showNav={false} bgClass="bg-edu-bg">
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
            <div className="absolute inset-0 bg-edu-primary/20 blur-xl rounded-full scale-150 animate-pulse-subtle" />
            <Avatar name={profile.fullname} avatarUrl={profile.avatarUrl} size="2xl" className="ring-4 ring-edu-surface shadow-lg relative z-10" />
            {profile.isVip && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1.5 border-2 border-edu-surface shadow-sm z-20">
                <span className="text-white text-[11px] block leading-none">👑</span>
              </div>
            )}
          </div>

          <div className="space-y-1 relative z-10">
            <h1 className="text-3xl font-bold font-display text-edu-text leading-tight tracking-tight">
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
            { label: 'Bajarilgan', value: profile.completedTasksCount ?? 0, icon: <Trophy size={18} className="text-emerald-500" /> },
            { label: 'Reyting', value: avgRating ? avgRating : '—', icon: <Star size={18} className="text-amber-500" /> },
            { label: 'Streak', value: profile.streakCount || 0, icon: <Zap size={18} className="text-orange-500" />, suffix: ' kun' },
          ].map((stat, i) => (
            <div key={i} className="bg-edu-surface border border-edu-border rounded-xl p-3 flex flex-col justify-between min-h-[82px] shadow-sm relative overflow-hidden">
               <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-black/20 flex items-center justify-center">
                {stat.icon}
              </div>
              <div className="mt-2">
                <p className="text-lg font-bold font-display text-edu-text leading-none truncate">
                  {stat.value}{stat.suffix}
                </p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1 leading-snug">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── REPUTATION PASSPORT ── */}
        {dnaData && <ReputationRadarChart dna={dnaData} />}

        {/* ── ABOUT & SKILLS (CV STYLE) ── */}
        <Card className="bg-edu-surface shadow-ios border border-edu-border" radius="xl">
          <CardContent className="p-6 space-y-6">
            {profile.bio && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Mavjud ma'lumotlar (Bio)</p>
                <p className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{profile.bio}</p>
              </div>
            )}

            {profile.skills?.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Ko'nikmalar (Skills)</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s) => (
                    <SkillChip key={s} label={s} />
                  ))}
                </div>
              </div>
            )}

            {profile.achievements?.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Yutuqlar</p>
                <div className="grid grid-cols-1 gap-2">
                  {profile.achievements.map((ach, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10">
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
              <h3 className="text-[16px] font-bold text-edu-text tracking-tight">Portfolio ishlari</h3>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{profile.portfolioItems.length} ta loyiha</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {profile.portfolioItems.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => { hapticLight(); handleViewFile(item.fileId, item.title); }}
                  className="bg-edu-surface border border-edu-border rounded-xl p-3 flex flex-col gap-3 active:scale-[0.98] transition-all text-left shadow-ios"
                >
                  <div className="aspect-square w-full rounded-xl bg-gray-50 dark:bg-black/20 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <FileText size={22} />
                    </div>
                    {/* Placeholder for real image preview if we had thumbnails */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                  </div>
                  <div className="px-1 space-y-0.5">
                    <p className="text-[13px] font-bold text-edu-text truncate">{item.title}</p>
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
              <h3 className="text-[16px] font-bold text-edu-text tracking-tight">Xizmatlar (Gigs)</h3>
            </div>
            
            <div className="space-y-3">
              {gigs.map((gig) => (
                <div 
                  key={gig.id}
                  onClick={() => navigate(`/gigs/${gig.id}`)}
                  className="bg-edu-surface border border-edu-border rounded-xl p-5 shadow-ios active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="space-y-1">
                      <h4 className="text-[15px] font-bold text-edu-text leading-tight line-clamp-1 group-hover:text-edu-primary transition-colors">
                        {gig.title}
                      </h4>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={12} /> {gig.deliveryDays} kun yetkazib berish
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-bold text-emerald-600 dark:text-emerald-500">{formatPrice(gig.price)}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">UZS</p>
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
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] p-4 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-black/[0.05] dark:border-white/[0.05] pb-safe z-50">
        <div className="flex gap-3">
          <button
            onClick={() => { hapticLight(); navigate(`/tasks/${userId}/chat`); }}
            className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0 active:scale-90 transition-all border border-black/[0.02] dark:border-white/[0.05]"
          >
            <MessageCircle size={22} />
          </button>
          <button
            onClick={() => {
              hapticSuccess();
              navigate(`/tasks/create?freelancerId=${userId}`);
            }}
            className="flex-1 h-14 rounded-xl bg-gradient-to-r from-edu-primary to-edu-accent text-white font-bold text-[15px] shadow-lg shadow-edu-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all uppercase tracking-widest"
          >
            <span>Menga ishlash taklif qiling</span>
            <ChevronRight size={18} />
          </button>
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
