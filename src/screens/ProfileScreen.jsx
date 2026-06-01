// src/screens/ProfileScreen.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../components/ui/Card';
import { Settings, Copy, Plus, Trash2, LogOut } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { PageLayout } from '../components/layout/PageLayout';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { UserBadge } from '../components/ui/Badge';
import { SkillChip } from '../components/ui/Chip';
import { BottomSheet } from '../components/ui/BottomSheet';
import { DisplayRating } from '../components/ui/StarRating';
import { TextInput } from '../components/forms/TextInput';
import { TextArea } from '../components/forms/TextArea';
import { ProfileSkeleton } from '../components/ui/SkeletonCard';
import { usersApi, portfolioApi } from '../services/api';
import { copyToClipboard, formatPrice } from '../lib/utils';
import { hapticSuccess, hapticLight } from '../lib/telegram';
import toast from 'react-hot-toast';
import { useThemeStore } from '../store/themeStore';
import { Moon, Sun, Monitor } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

export default function ProfileScreen() {
  const qc = useQueryClient();
  const { logout } = useAuth();
  const [editOpen, setEditOpen]   = useState(false);
  const [editForm, setEditForm]   = useState({});

  const { data: me, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn:  () => usersApi.getMe().then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

  const updateMe = useMutation({
    mutationFn: (data) => usersApi.updateMe(data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['users','me'] }); toast.success('Profil yangilandi!'); setEditOpen(false); },
    onError:    (e) => toast.error(e.serverMsg || 'Xato'),
  });

  const delPortfolio = useMutation({
    mutationFn: (id) => portfolioApi.delete(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['users','me'] }); },
  });

  const handleEditSave = () => {
    updateMe.mutate({
      fullname: editForm.fullname,
      bio:      editForm.bio,
      skills:   editForm.skills?.split(',').map(s => s.trim()).filter(Boolean),
    });
    hapticSuccess();
  };

  const { theme, setTheme } = useThemeStore();

  if (isLoading) return <ProfileSkeleton />;

  const avgRating = me?.ratingCount ? (me.ratingSum / me.ratingCount).toFixed(1) : '—';
  const portfolioLimit = me?.isVip ? 20 : 2;

  return (
    <PageLayout>
      <Header
        title="Profil"
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditForm({ fullname: me?.fullname, bio: me?.bio, skills: me?.skills?.join(', ') }); setEditOpen(true); }}
              className="w-9 h-9 rounded-xl bg-edu-bg flex items-center justify-center press-scale"
            >
              <Settings size={18} className="text-edu-muted" />
            </button>
            <button
              onClick={() => {
                hapticSuccess();
                logout();
              }}
              className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center press-scale"
            >
              <LogOut size={18} className="text-red-500" />
            </button>
          </div>
        }
      />

      <div className="px-4 pt-4 space-y-4 pb-2">
        {/* Avatar & name */}
        <div className="flex flex-col items-center gap-4 py-6 relative">
          {/* Glow Behind Avatar */}
          <div className="absolute top-8 w-32 h-32 bg-edu-primary/20 blur-3xl rounded-full" />
          
          <div className="relative">
            <Avatar name={me?.fullname} avatarUrl={me?.avatarUrl} size="2xl" />
            {me?.isVip && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1 border-2 border-edu-bg shadow-sm">
                <span className="text-white text-[10px]">👑</span>
              </div>
            )}
          </div>
          
          <div className="text-center relative z-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-[22px] font-black font-display text-edu-text tracking-tight">{me?.fullname}</h1>
              <UserBadge badge={me?.badge} isVip={me?.isVip} />
            </div>
            <p className="text-sm font-medium text-edu-muted tracking-wide">@{me?.username || 'username'}</p>
          </div>
        </div>

        {/* Bio */}
        {me?.bio && (
          <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-edu-muted uppercase tracking-wider mb-2">Bio</p>
              <p className="text-sm text-edu-text leading-relaxed">{me.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {me?.skills?.length > 0 && (
          <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-edu-muted uppercase tracking-wider mb-2">Ko'nikmalar</p>
              <div className="flex flex-wrap gap-2">
                {me.skills.map((s) => <SkillChip key={s} label={s} />)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <Card className="bg-gradient-to-br from-edu-surface to-edu-surface/60 backdrop-blur-md shadow-sm border border-edu-border/30 relative overflow-hidden" radius="2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-edu-primary/5 to-transparent pointer-events-none" />
          <CardContent className="p-0 relative z-10">
            <div className="grid grid-cols-2 divide-x divide-edu-border/30">
              {[
                { label: 'Bajarilgan', value: me?.completedTasksCount ?? 0, icon: '✅' },
                { label: 'Reyting', value: `⭐ ${avgRating}`, icon: null },
                { label: 'Yakunlash', value: me?.completionRate ? `${Math.round(me.completionRate)}%` : '—', icon: '📈' },
                { label: 'Javob tezligi', value: me?.avgResponseHrs ? `${me.avgResponseHrs}s` : '—', icon: '⚡' },
              ].map((item, i) => (
                <div key={i} className={['p-5 text-center', i >= 2 ? 'border-t border-edu-border/30' : ''].join(' ')}>
                  <p className="text-[26px] font-black font-display text-edu-text tracking-tight">{item.value}</p>
                  <p className="text-xs font-semibold text-edu-muted mt-1 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-edu-text">Portfolio</p>
            <span className="text-xs text-edu-muted">
              {me?.portfolioItems?.length ?? 0}/{portfolioLimit}
              {!me?.isVip && <span className="text-edu-vip"> (VIP: 20)</span>}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {me?.portfolioItems?.map((item) => (
              <Card key={item.id} className="bg-edu-surface border border-edu-border/40 relative" radius="xl">
                <CardContent className="p-3">
                  <div className="w-full h-20 bg-edu-bg rounded-lg flex items-center justify-center mb-2">
                    <span className="text-2xl">📄</span>
                  </div>
                  <p className="text-xs font-medium text-edu-text truncate">{item.title}</p>
                  <button
                    className="absolute top-2 right-2 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center press-scale"
                    onClick={() => delPortfolio.mutate(item.id)}
                  >
                    <Trash2 size={10} className="text-red-500" />
                  </button>
                </CardContent>
              </Card>
            ))}
            {(me?.portfolioItems?.length ?? 0) < portfolioLimit && (
              <Card className="bg-edu-bg border-2 border-dashed border-edu-border" radius="xl">
                <CardContent className="flex items-center justify-center h-full min-h-[100px]">
                  <div className="flex flex-col items-center gap-1 text-edu-muted">
                    <Plus size={20} />
                    <span className="text-xs">Ish qo'shish</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Referral */}
        <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-edu-muted uppercase tracking-wider mb-3">🎁 Referral</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-edu-bg rounded-xl px-3 py-2 text-sm font-mono font-bold text-edu-text border border-edu-border">
                {me?.referralCode || '--------'}
              </code>
              <Button
                size="sm" variant="secondary"
                icon={<Copy size={14} />}
                onClick={() => { copyToClipboard(me?.referralCode || ''); toast.success('Nusxalandi!'); }}
              >
                Nusxa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme Toggles */}
        <div className="pt-2">
          <p className="text-sm font-bold text-edu-text mb-2 px-1">Dizayn mavzusi</p>
          <div className="flex bg-edu-surface p-1 rounded-2xl border border-edu-border/40 shadow-card">
            {[
              { id: 'light', label: 'Yorug\'', icon: Sun },
              { id: 'dark', label: 'Qorong\'u', icon: Moon },
              { id: 'system', label: 'Tizim', icon: Monitor },
            ].map((t) => {
              const Icon = t.icon;
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { hapticLight(); setTheme(t.id); }}
                  className={["flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all press-scale", active ? "bg-edu-primary shadow-btn text-white" : "text-edu-muted hover:bg-edu-bg"].join(' ')}
                >
                  <Icon size={18} />
                  <span className="text-xs font-semibold">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Bottom Sheet */}
      <BottomSheet isOpen={editOpen} onClose={() => setEditOpen(false)} title="Profilni tahrirlash" fullHeight>
        <div className="space-y-4 py-2">
          <TextInput label="Ismingiz" value={editForm.fullname || ''} onValueChange={(v) => setEditForm(f => ({ ...f, fullname: v }))} />
          <TextArea label="Bio" value={editForm.bio || ''} onValueChange={(v) => setEditForm(f => ({ ...f, bio: v }))} maxLength={200} />
          <TextInput label="Ko'nikmalar (vergul bilan)" placeholder="Python, Node.js, Tarjima" value={editForm.skills || ''} onValueChange={(v) => setEditForm(f => ({ ...f, skills: v }))} />
          <Button fullWidth size="lg" variant="primary" isLoading={updateMe.isPending} onClick={handleEditSave}>
            Saqlash
          </Button>
        </div>
      </BottomSheet>
    </PageLayout>
  );
}
