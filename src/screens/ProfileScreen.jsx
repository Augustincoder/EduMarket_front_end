// src/screens/ProfileScreen.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../components/ui/Card';
import { Settings, Copy, Plus, Trash2, LogOut, Briefcase, FileText } from 'lucide-react';
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
import { FileUpload } from '../components/forms/FileUpload';
import { ProfileSkeleton } from '../components/ui/SkeletonCard';
import { usersApi, portfolioApi } from '../services/api';
import { copyToClipboard, formatPrice, cn } from '../lib/utils';
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
  const [errors, setErrors]       = useState({});

  const [addPortfolioOpen, setAddPortfolioOpen] = useState(false);
  const [portfolioTitle, setPortfolioTitle]     = useState('');
  const [portfolioFiles, setPortfolioFiles]     = useState([]);
  const [portfolioError, setPortfolioError]     = useState('');

  const addPortfolio = useMutation({
    mutationFn: (data) => portfolioApi.add(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      toast.success("Portfolioga ish muvaffaqiyatli qo'shildi!");
      setAddPortfolioOpen(false);
      setPortfolioTitle('');
      setPortfolioFiles([]);
      setPortfolioError('');
    },
    onError: (err) => {
      toast.error(err.serverMsg || "Ish qo'shishda xatolik yuz berdi");
    }
  });

  const handleAddPortfolioSubmit = () => {
    setPortfolioError('');
    if (!portfolioTitle.trim()) {
      setPortfolioError("Ish nomi kiritilishi majburiy");
      return;
    }
    if (portfolioFiles.length === 0) {
      setPortfolioError("Fayl yuklash majburiy");
      return;
    }
    addPortfolio.mutate({
      title: portfolioTitle,
      fileId: portfolioFiles[0].id
    });
    hapticSuccess();
  };

  const { data: me, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn:  () => usersApi.getMe().then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

  const updateMe = useMutation({
    mutationFn: (data) => usersApi.updateMe(data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['users','me'] }); toast.success('Profil yangilandi!'); setEditOpen(false); },
    onError:    (e) => {
      if (e.serverErrors) {
        setErrors(e.serverErrors);
        toast.error('Iltimos, xatoliklarni to\'g\'irlang');
      } else {
        toast.error(e.serverMsg || 'Xato');
      }
    },
  });

  const delPortfolio = useMutation({
    mutationFn: (id) => portfolioApi.delete(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['users','me'] }); },
  });

  const handleEditSave = () => {
    setErrors({});
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

  const isActiveStatus = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'].includes(me?.status);

  return (
    <PageLayout>
      <Header
        title="Profil"
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditForm({ fullname: me?.fullname, bio: me?.bio, skills: me?.skills?.join(', ') }); setErrors({}); setEditOpen(true); }}
              className="w-9 h-9 rounded-xl bg-edu-bg flex items-center justify-center press-scale hover:bg-edu-border/50 transition-colors border border-edu-border/30"
            >
              <Settings size={18} className="text-edu-text" />
            </button>
            <button
              onClick={() => {
                hapticSuccess();
                logout();
              }}
              className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center press-scale hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={18} className="text-red-500" />
            </button>
          </div>
        }
      />

      <div className="px-4 pt-4 space-y-4 pb-6">
        {/* Avatar & name */}
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
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-[22px] font-black font-display text-edu-text tracking-tight">{me?.fullname}</h1>
                <UserBadge badge={me?.badge} isVip={me?.isVip} size="xs" />
              </div>
              <p className="text-xs font-semibold text-edu-muted tracking-wide">@{me?.username || 'username'}</p>
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
                  <p className="text-sm text-edu-text leading-relaxed">{me.bio}</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Bajarilgan vazifalar', value: me?.completedTasksCount ?? 0, icon: '🏆', color: 'from-green-500/10 to-emerald-500/5 border-green-500/20', textColor: 'text-green-600' },
            { label: 'O\'rtacha reyting', value: avgRating !== '—' ? avgRating : '—', icon: '⭐', color: 'from-amber-500/10 to-yellow-500/5 border-amber-500/20', textColor: 'text-amber-600' },
            { label: 'Muvaffaqiyat darajasi', value: me?.completionRate ? `${Math.round(me.completionRate)}%` : '100%', icon: '📈', color: 'from-blue-500/10 to-indigo-500/5 border-blue-500/20', textColor: 'text-blue-600' },
            { label: 'Javob tezligi (soat)', value: me?.avgResponseHrs ? `${me.avgResponseHrs}s` : '1s', icon: '⚡', color: 'from-orange-500/10 to-red-500/5 border-orange-500/20', textColor: 'text-orange-600' },
          ].map((item, i) => (
            <Card key={i} className={`bg-gradient-to-br ${item.color} border relative overflow-hidden`} radius="xl">
              <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-white/5 dark:bg-black/5 rounded-full pointer-events-none" />
              <CardContent className="p-4 flex flex-col justify-between h-full min-h-[92px]">
                <div className="flex justify-between items-start">
                  <span className="text-lg">{item.icon}</span>
                  {i === 1 && avgRating !== '—' && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-800 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold border border-amber-500/30">FAOL</span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black font-display text-edu-text leading-none">{item.value}</p>
                  <p className="text-[9px] font-bold text-edu-muted uppercase tracking-wider mt-1.5 leading-snug">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Portfolio */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-black text-edu-text">Portfolio ishlari</p>
            <span className="text-xs font-semibold text-edu-muted">
              {me?.portfolioItems?.length ?? 0}/{portfolioLimit}
              {!me?.isVip && <span className="text-edu-vip font-bold"> (VIP: 20)</span>}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {me?.portfolioItems?.map((item) => (
              <Card key={item.id} className="bg-edu-surface border border-edu-border/40 relative group overflow-hidden" radius="xl">
                <CardContent className="p-3 flex flex-col h-full justify-between">
                  <div className="w-full h-20 bg-gradient-to-br from-edu-primary/5 to-edu-accent/5 rounded-xl flex items-center justify-center mb-2 border border-edu-border/30 relative">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-edu-bg flex items-center justify-center shadow-sm">
                      <Briefcase size={18} className="text-edu-primary" />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-edu-text truncate px-0.5">{item.title}</p>
                  
                  <button
                    className="absolute top-2 right-2 w-6 h-6 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center press-scale hover:bg-red-200 transition-colors"
                    onClick={() => {
                      if (window.confirm("Bu ishni portfoliodan o'chirmoqchimisiz?")) {
                        delPortfolio.mutate(item.id);
                      }
                    }}
                  >
                    <Trash2 size={11} className="text-red-500" />
                  </button>
                </CardContent>
              </Card>
            ))}
            
            {(me?.portfolioItems?.length ?? 0) < portfolioLimit && (
              <button
                onClick={() => { setPortfolioTitle(''); setPortfolioFiles([]); setPortfolioError(''); setAddPortfolioOpen(true); }}
                className="bg-edu-surface/50 border-2 border-dashed border-edu-border/60 hover:border-edu-primary/60 hover:bg-edu-primary/5 transition-all duration-300 rounded-2xl flex flex-col items-center justify-center p-4 min-h-[128px] group press-scale"
              >
                <div className="w-8 h-8 rounded-full bg-edu-bg group-hover:bg-edu-primary/10 flex items-center justify-center transition-all duration-300">
                  <Plus size={18} className="text-edu-muted group-hover:text-edu-primary" />
                </div>
                <span className="text-xs font-bold text-edu-muted group-hover:text-edu-primary mt-2">Ish qo'shish</span>
              </button>
            )}
          </div>
        </div>

        {/* Referral Card */}
        <Card className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent border border-purple-500/20 shadow-card overflow-hidden relative" radius="xl">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/10 blur-xl rounded-full pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">🎁 Hamkorlik dasturi (Referral)</p>
              <span className="text-[10px] text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full font-bold">Ulashish</span>
            </div>
            <p className="text-xs text-edu-muted mb-3 leading-relaxed">
              Do'stlaringizni taklif qiling va ularning har bir buyurtmasidan bonuslarni qo'lga kiriting!
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white/60 dark:bg-black/30 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-edu-text border border-edu-border/30 truncate">
                {me?.referralCode || '--------'}
              </code>
              <Button
                size="md" variant="secondary"
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-none shrink-0"
                icon={<Copy size={14} />}
                onClick={() => { copyToClipboard(me?.referralCode || ''); toast.success('Havola nusxalandi!'); }}
              >
                Nusxa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings Card */}
        <Card className="bg-edu-surface/50 border border-edu-border/30" radius="xl">
          <CardContent className="p-3">
            <p className="text-xs font-bold text-edu-muted uppercase tracking-wider mb-2.5 px-1">Mavzu sozlamalari</p>
            <div className="flex bg-edu-bg p-1 rounded-xl border border-edu-border/30">
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
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all press-scale text-2xs font-bold",
                      active 
                        ? "bg-edu-primary shadow-btn text-white" 
                        : "text-edu-muted hover:bg-edu-surface/80"
                    )}
                  >
                    <Icon size={16} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Sheet */}
      <BottomSheet isOpen={editOpen} onClose={() => setEditOpen(false)} title="Profilni tahrirlash" fullHeight>
        <div className="space-y-4 py-2">
          <TextInput label="Ismingiz" value={editForm.fullname || ''} onValueChange={(v) => { setEditForm(f => ({ ...f, fullname: v })); setErrors(e => ({ ...e, fullname: null })); }} error={errors.fullname?.[0]} />
          <TextArea label="Bio" value={editForm.bio || ''} onValueChange={(v) => { setEditForm(f => ({ ...f, bio: v })); setErrors(e => ({ ...e, bio: null })); }} maxLength={200} error={errors.bio?.[0]} />
          <TextInput label="Ko'nikmalar (vergul bilan)" placeholder="Python, Node.js, Tarjima" value={editForm.skills || ''} onValueChange={(v) => { setEditForm(f => ({ ...f, skills: v })); setErrors(e => ({ ...e, skills: null })); }} error={errors.skills?.[0]} />
          <Button fullWidth size="lg" variant="primary" isLoading={updateMe.isPending} onClick={handleEditSave}>
            Saqlash
          </Button>
        </div>
      </BottomSheet>

      {/* Add Portfolio Item Sheet */}
      <BottomSheet isOpen={addPortfolioOpen} onClose={() => setAddPortfolioOpen(false)} title="Portfolioga ish qo'shish" fullHeight>
        <div className="space-y-4 py-2">
          <TextInput
            label="Ish nomi (Sarlavha) *"
            placeholder="Masalan: Web-dizayn loyihasi"
            value={portfolioTitle}
            onValueChange={(v) => { setPortfolioTitle(v); setPortfolioError(''); }}
          />
          
          <FileUpload
            label="Ish faylini yuklang (Rasm yoki hujjat) *"
            maxFiles={1}
            value={portfolioFiles}
            onChange={(files) => { setPortfolioFiles(files); setPortfolioError(''); }}
          />

          {portfolioError && (
            <p className="text-xs font-bold text-red-500 px-1 animate-pulse">
              ⚠️ {portfolioError}
            </p>
          )}

          <Button
            fullWidth
            size="lg"
            variant="primary"
            isLoading={addPortfolio.isPending}
            onClick={handleAddPortfolioSubmit}
          >
            Portfolioga qo'shish
          </Button>
        </div>
      </BottomSheet>
    </PageLayout>
  );
}
