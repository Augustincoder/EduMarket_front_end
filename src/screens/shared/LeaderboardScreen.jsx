// src/screens/LeaderboardScreen.jsx
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/Card';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import { Avatar } from '../../components/ui/Avatar';
import { UserBadge } from '../../components/ui/Badge';
import { DisplayRating } from '../../components/ui/StarRating';
import { ProfileSkeleton } from '../../components/ui/SkeletonCard';
import { useAuthStore } from '../../store/authStore';
import { usersApi } from '../../services/users.service';
import { hapticLight } from '../../lib/telegram';

export default function LeaderboardScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['users', 'leaderboard'],
    queryFn:  () => usersApi.leaderboard().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const users = Array.isArray(data) ? data : (data?.users || []);
  const myRank = users.findIndex((u) => u.id === user?.id);

  const MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <PageLayout showNav={false}>
      <Header title="🏆 TOP Freelancerlar" subtitle="Bu oy" showBack />

      <div className="px-4 py-4 space-y-3">
        {isLoading ? <ProfileSkeleton /> : (
          <>
            {/* Top 1 featured */}
            {users[0] && (
              <Card
                isPressable
                onClick={() => { navigate(`/profile/${users[0].id}`); }}
                className="bg-gradient-to-br from-[#FFD700] to-[#FDB931] border border-[#FFF8B0]/50 shadow-[0_8px_30px_rgba(255,215,0,0.4)] relative overflow-hidden active-bounce"
                radius="2xl"
              >
                {/* Metallic shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/40 pointer-events-none" />
                <CardContent className="p-5 flex flex-col items-center gap-3 text-white">
                  <span className="text-4xl">🥇</span>
                  <Avatar name={users[0].fullname} avatarUrl={users[0].avatarUrl} size="xl" />
                  <div className="text-center">
                    <p className="text-xl font-black font-display">{users[0].fullname}</p>
                    <div className="flex items-center justify-center gap-3 mt-1.5 text-white/90">
                      <span className="text-sm font-bold">
                        {users[0].ratingCount ? `⭐ ${(users[0].ratingSum/users[0].ratingCount).toFixed(1)}` : '—'}
                      </span>
                      <span className="text-sm">{users[0].completedTasksCount ?? 0} ish</span>
                      <span className="text-sm">{Math.round(users[0].completionRate ?? 0)}%</span>
                    </div>
                  </div>
                  <UserBadge badge={users[0].badge} isVip={users[0].isVip} size="xs" />
                </CardContent>
              </Card>
            )}

            {/* 2-10 table */}
            <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
              <CardContent className="p-0">
                {users.slice(1).map((u, i) => {
                  const rank = i + 2;
                  const isCurrentUser = u.id === user?.id;
                  return (
                    <div
                      key={u.id}
                      className={[
                        'flex items-center gap-3 px-4 py-3 border-b border-edu-border/30 last:border-0 active-bounce cursor-pointer transition-colors',
                        isCurrentUser ? 'bg-edu-primary/10' : 'hover:bg-edu-surface/60',
                      ].filter(Boolean).join(' ')}
                      onClick={() => { navigate(`/profile/${u.id}`); }}
                    >
                      <span className="w-7 text-center text-sm font-black text-edu-muted flex-shrink-0">
                        {rank <= 3 ? MEDALS[rank - 1] : `#${rank}`}
                      </span>
                      <Avatar name={u.fullname} avatarUrl={u.avatarUrl} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-edu-text truncate">{u.fullname}</p>
                          {isCurrentUser && <span className="text-xs text-edu-primary font-bold">(Siz)</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-edu-muted mt-0.5">
                          {u.ratingCount ? <span>⭐ {(u.ratingSum/u.ratingCount).toFixed(1)}</span> : null}
                          <span>{u.completedTasksCount ?? 0} ish</span>
                        </div>
                      </div>
                      <UserBadge badge={u.badge} isVip={u.isVip} size="xs" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Sticky my position if not in top */}
            {myRank > 9 && user && (
              <Card className="bg-edu-primary border-0 shadow-btn" radius="xl">
                <CardContent className="flex flex-row items-center gap-3 px-4 py-3 text-white">
                  <span className="text-sm font-black">#{myRank + 1}</span>
                  <Avatar name={user.fullname} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{user.fullname}</p>
                    <p className="text-xs text-white/70">Sizning o'rningiz</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
