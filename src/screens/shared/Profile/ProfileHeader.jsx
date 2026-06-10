import { Avatar } from '../../../../components/ui/Avatar';
import { UserBadge, VipBadge, VerifiedBadge } from '../../../../components/ui/Badge';
import { SkillChip } from '../../../../components/ui/Chip';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Briefcase, Flame, Zap } from 'lucide-react';

export function ProfileHeader({ me, activeRole }) {
  if (activeRole === 'CLIENT') {
    return (
      <>
        {/* Client Profile Card */}
        <Card className="bg-gradient-to-br from-edu-primary/5 via-edu-accent/5 to-transparent border border-edu-border/30 relative overflow-hidden" radius="lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-edu-primary/10 blur-3xl rounded-full pointer-events-none" />
          <CardContent className="p-8 flex flex-col items-center text-center gap-4 relative z-10">
            <div className="relative">
              <Avatar name={me?.fullname} avatarUrl={me?.avatarUrl} size="2xl" className="ring-4 ring-edu-primary/10 shadow-premium-lg animate-fade-in" />
              {me?.isVip && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 border-2 border-edu-surface shadow-premium-sm">
                  <span className="text-white text-[12px] block leading-none">👑</span>
                </div>
              )}
            </div>
            
            <div className="space-y-1.5">
              <h1 className="text-[24px] font-black font-display text-edu-text tracking-tight leading-tight">{me?.fullname}</h1>
              <p className="text-sm font-semibold text-edu-muted tracking-wide opacity-80">@{me?.username || 'username'}</p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <UserBadge badge={me?.badge} size="xs" />
                {me?.isVip && <VipBadge size="xs" />}
                {me?.verificationStatus === 'APPROVED' && <VerifiedBadge size="xs" />}
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-xs font-black text-orange-500 bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">
                  <Flame size={14} /> {me?.streakCount || 0} KUN
                </div>
                <div className="flex items-center gap-2 text-xs font-black text-blue-500 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                  <Zap size={14} /> {me?.xp || 0} XP
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio & Skills */}
        {(me?.bio || me?.skills?.length > 0) && (
          <Card className="bg-edu-surface border border-edu-border/40" radius="xl">
            <CardContent className="p-4 space-y-4">
              {me?.bio && (
                <div>
                  <p className="text-2xs font-bold text-edu-muted uppercase tracking-wider mb-1.5">Mavjud ma'lumotlar (Bio)</p>
                  <p className="text-sm text-edu-text leading-relaxed font-medium">{me.bio}</p>
                </div>
              )}
              {me?.bio && me?.skills?.length > 0 && <hr className="border-edu-border/30" />}
              {me?.skills?.length > 0 && (
                <div>
                  <p className="text-2xs font-bold text-edu-muted uppercase tracking-wider mb-2">Ko'nikmalar (Skills)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {me.skills.map((s) => <SkillChip key={s} label={s} />)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </>
    );
  }

  if (activeRole === 'FREELANCER') {
    return (
      <>
        {/* Freelancer Header card */}
        <Card className="bg-gradient-to-br from-edu-primary/10 via-edu-accent/5 to-transparent border border-edu-border/30 relative overflow-hidden" radius="2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-edu-primary/15 blur-3xl rounded-full pointer-events-none" />
          <CardContent className="p-6 flex flex-col items-center text-center gap-3.5 relative z-10">
            <div className="relative">
              <Avatar name={me?.fullname} avatarUrl={me?.avatarUrl} size="2xl" className="ring-4 ring-edu-primary/20 shadow-md animate-fade-in" />
              {me?.isVip && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1.5 border-2 border-edu-surface shadow-sm">
                  <span className="text-white text-[11px] block leading-none">👑</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h1 className="text-[22px] font-black font-display text-edu-text tracking-tight leading-tight">{me?.fullname}</h1>
              <p className="text-xs font-semibold text-edu-muted tracking-wide">@{me?.username || 'username'}</p>
              
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                <UserBadge badge={me?.badge} size="xs" />
                {me?.isVip && <VipBadge size="xs" />}
                {me?.verificationStatus === 'APPROVED' && <VerifiedBadge size="xs" />}
              </div>
              
              {me?.freelancerCategories?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2.5">
                  {me.freelancerCategories.map(cat => (
                    <span key={cat} className="text-[9px] font-black bg-edu-primary/10 text-edu-primary px-2 py-0.5 rounded-full border border-edu-primary/20 uppercase tracking-wide">
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              {me?.freelancerExperience !== null && (
                <p className="text-xs text-edu-muted mt-1.5 font-bold flex items-center justify-center gap-1">
                  <Briefcase size={14} className="opacity-70" /> {me.freelancerExperience} yillik tajriba
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Freelancer Bio */}
        {me?.freelancerBio && (
          <Card className="bg-edu-surface border border-edu-border/40 shadow-sm" radius="xl">
            <CardContent className="p-4">
              <p className="text-2xs font-bold text-edu-primary uppercase tracking-wider mb-2">Mutaxassis tavsifi (Freelancer Bio)</p>
              <p className="text-sm text-edu-text leading-relaxed font-medium">{me.freelancerBio}</p>
            </CardContent>
          </Card>
        )}
      </>
    );
  }

  return null;
}
