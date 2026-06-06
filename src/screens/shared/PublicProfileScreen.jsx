// src/screens/PublicProfileScreen.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/Card';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import { Avatar } from '../../components/ui/Avatar';
import { UserBadge } from '../../components/ui/Badge';
import { SkillChip } from '../../components/ui/Chip';
import { DisplayRating } from '../../components/ui/StarRating';
import { ProfileSkeleton } from '../../components/ui/SkeletonCard';
import { usersApi } from '../../services/users.service';

import { Heart } from 'lucide-react';
import { hapticLight } from '../../lib/telegram';
import { useFavorites } from '../../hooks/useFavorites';

export default function PublicProfileScreen() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn:  () => usersApi.getUser(userId).then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

  const { isFavorite, toggleFavorite } = useFavorites();

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) return null;

  const avgRating = profile.ratingCount ? (profile.ratingSum / profile.ratingCount).toFixed(1) : null;
  const isFav = isFavorite(userId);

  return (
    <PageLayout showNav={false}>
      <Header 
        title="Profil" 
        showBack 
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(profile)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
              title="Sevimlilarga qo'shish"
            >
              <Heart size={16} fill={isFav ? "currentColor" : "none"} className={isFav ? "text-red-500" : "text-edu-muted"} />
            </button>
            <button
              onClick={() => navigate(`/report?targetId=${userId}&targetType=USER`)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-edu-bg text-edu-muted hover:bg-edu-border/50 transition-colors border border-edu-border/30"
              title="Shikoyat qilish"
            >
              <span className="text-sm">🚩</span>
            </button>
          </div>
        }
      />
      <div className="px-4 pt-4 space-y-4 pb-24">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 py-6 relative">
          <div className="absolute top-8 w-32 h-32 bg-edu-primary/20 blur-3xl rounded-full" />
          <div className="relative">
            <Avatar name={profile.fullname} avatarUrl={profile.avatarUrl} size="2xl" />
            {profile.isVip && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1 border-2 border-edu-bg shadow-sm">
                <span className="text-white text-[10px]">👑</span>
              </div>
            )}
          </div>
          <div className="text-center relative z-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-[22px] font-black font-display text-edu-text tracking-tight">{profile.fullname}</h1>
              <UserBadge badge={profile.badge} isVip={profile.isVip} />
            </div>
            {avgRating && <div className="mt-1.5"><DisplayRating rating={Number(avgRating)} count={profile.ratingCount} /></div>}
            
            {/* Gamification Stats */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                <span>🔥</span> {profile.streakCount || 0} Kun
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                <span>⚡</span> {profile.xp || 0} XP
              </div>
            </div>
          </div>
        </div>

        {profile.bio && (
          <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
            <CardContent className="p-4">
              <p className="text-sm text-edu-text leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {profile.skills?.length > 0 && (
          <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-edu-muted uppercase tracking-wider mb-2">Ko'nikmalar</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => <SkillChip key={s} label={s} />)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements Section */}
        {profile.achievements?.length > 0 && (
          <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-edu-muted uppercase tracking-wider mb-2">Yutuqlar</p>
              <div className="grid grid-cols-2 gap-3">
                {profile.achievements.map((ach, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-xl">
                    <span className="text-xl">🏆</span>
                    <span className="text-xs font-bold text-edu-text">{ach}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-edu-surface to-edu-surface/60 backdrop-blur-md shadow-sm border border-edu-border/30 relative overflow-hidden" radius="2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-edu-primary/5 to-transparent pointer-events-none" />
          <CardContent className="p-0 relative z-10">
            <div className="grid grid-cols-2 divide-x divide-edu-border/30">
              <div className="p-5 text-center">
                <p className="text-[26px] font-black font-display text-edu-text tracking-tight">{profile.completedTasksCount ?? 0}</p>
                <p className="text-xs font-semibold text-edu-muted mt-1 uppercase tracking-wider">Bajarilgan</p>
              </div>
              <div className="p-5 text-center">
                <p className="text-[26px] font-black font-display text-edu-text tracking-tight">{avgRating ? `⭐ ${avgRating}` : '—'}</p>
                <p className="text-xs font-semibold text-edu-muted mt-1 uppercase tracking-wider">Reyting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Hire Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-edu-surface/90 backdrop-blur-xl border-t border-edu-border/40 pb-safe z-50">
        <button
          onClick={() => {
            hapticLight();
            navigate(`/tasks/create?freelancerId=${userId}`);
          }}
          className="w-full flex items-center justify-center gap-2 bg-edu-primary hover:bg-edu-primary/90 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-edu-primary/25 transition-all active:scale-[0.98]"
        >
          <span>Menga ishlash</span>
        </button>
      </div>
    </PageLayout>
  );
}
