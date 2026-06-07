// src/screens/ProfileScreen.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/Card';
import { 
  Settings, 
  Plus, 
  Trash2, 
  LogOut, 
  Briefcase,
  ArrowRight,
  User,
  Moon, 
  Sun,
  Bell
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { UserBadge, VipBadge, VerifiedBadge } from '../../components/ui/Badge';
import { SkillChip } from '../../components/ui/Chip';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { TextInput } from '../../components/forms/TextInput';
import { TextArea } from '../../components/forms/TextArea';
import { FileUpload } from '../../components/forms/FileUpload';
import { ProfileSkeleton } from '../../components/ui/SkeletonCard';
import { VerificationStatusCard } from '../../components/cards/VerificationStatusCard';
import { usersApi } from '../../services/users.service';
import { portfolioApi, analyticsApi, filesApi } from '../../services/other.service';
import { formatPrice, cn } from '../../lib/utils';
import { hapticSuccess, hapticLight, showConfirm } from '../../lib/telegram';
import toast from 'react-hot-toast';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { calculateLevel, calculateStreak } from '../../lib/gamification';
import EduViewer from '../../components/ui/EduViewer';

const CATEGORIES = [
  'Dasturlash', 'Dizayn', 'Tarjima', 'SMM', 'Kopirayterlik',
  'Video montaj', 'Buxgalteriya', 'Huquqshunoslik', 'Repetitorlik'
];

export default function ProfileScreen() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const activeRole = useAuthStore((s) => s.activeRole);
  const toggleActiveRole = useAuthStore((s) => s.toggleActiveRole);
  const [editOpen, setEditOpen]       = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [editTab, setEditTab]         = useState('client'); // 'client' | 'freelancer'
  const [editForm, setEditForm]       = useState({});
  const [errors, setErrors]           = useState({});

  const [addPortfolioOpen, setAddPortfolioOpen] = useState(false);
  const [portfolioTitle, setPortfolioTitle]     = useState('');
  const [portfolioFiles, setPortfolioFiles]     = useState([]);
  const [portfolioError, setPortfolioError]     = useState('');

  const [viewerFile, setViewerFile] = useState(null);

  const handleViewFile = async (fileId, fileName) => {
    try {
      const res = await filesApi.getUrl(fileId);
      setViewerFile({ url: res.data.data.url, name: fileName || fileId.split('/').pop() });
    } catch {
      toast.error('Faylni ochishda xatolik');
    }
  };

  // Fetch Me Profile
  const { data: me, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn:  () => usersApi.getMe().then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

  // Fetch Client Personal Analytics
  const { data: clientStats } = useQuery({
    queryKey: ['analytics', 'client', me?.id],
    queryFn: () => analyticsApi.getMe({ role: 'CLIENT' }).then(r => r.data.data),
    enabled: !!me,
  });

  // Add Portfolio Mutation
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
    const trimmedTitle = portfolioTitle.trim();
    if (!trimmedTitle) {
      setPortfolioError("Ish nomi kiritilishi majburiy");
      return;
    }
    if (trimmedTitle.length < 5) {
      setPortfolioError("Ish nomi kamida 5 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (trimmedTitle.length > 100) {
      setPortfolioError("Ish nomi maksimal 100 ta belgi bo'lishi kerak");
      return;
    }
    if (portfolioFiles.length === 0) {
      setPortfolioError("Fayl yuklash majburiy");
      return;
    }
    addPortfolio.mutate({
      title: trimmedTitle,
      fileId: portfolioFiles[0].id
    });
    hapticSuccess();
  };

  // Update Profile Mutation
  const updateMe = useMutation({
    mutationFn: (data) => usersApi.updateMe(data),
    onSuccess:  () => { 
      qc.invalidateQueries({ queryKey: ['users','me'] }); 
      toast.success('Profil muvaffaqiyatli yangilandi!'); 
      setEditOpen(false); 
    },
    onError:    (e) => {
      if (e.serverErrors) {
        setErrors(e.serverErrors);
        toast.error('Iltimos, xatoliklarni to\'g\'irlang');
      } else {
        toast.error(e.serverMsg || 'Xatolik yuz berdi');
      }
    },
  });

  // Delete Portfolio Mutation
  const delPortfolio = useMutation({
    mutationFn: (id) => portfolioApi.delete(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['users','me'] }); },
  });

  const openEditProfile = () => {
    setEditForm({
      fullname: me?.fullname || '',
      bio: me?.bio || '',
      skills: me?.skills?.join(', ') || '',
      freelancerBio: me?.freelancerBio || '',
      freelancerExperience: me?.freelancerExperience !== null ? String(me?.freelancerExperience) : '',
      freelancerCategories: me?.freelancerCategories || [],
    });
    setErrors({});
    setEditTab('client');
    setEditOpen(true);
  };

  const toggleCategoryInEdit = (cat) => {
    hapticLight();
    const current = editForm.freelancerCategories || [];
    if (current.includes(cat)) {
      setEditForm({ ...editForm, freelancerCategories: current.filter(c => c !== cat) });
    } else {
      if (current.length >= 3) {
        toast.error("Maksimum 3 ta kategoriya tanlash mumkin");
        return;
      }
      setEditForm({ ...editForm, freelancerCategories: [...current, cat] });
    }
  };

  const handleEditSave = () => {
    setErrors({});
    const updateData = {
      fullname: editForm.fullname,
      bio:      editForm.bio,
      skills:   editForm.skills?.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (me?.isFreelancer) {
      updateData.freelancerBio = editForm.freelancerBio || null;
      updateData.freelancerExperience = editForm.freelancerExperience !== '' ? Number(editForm.freelancerExperience) : null;
      updateData.freelancerCategories = editForm.freelancerCategories || [];
    }

    updateMe.mutate(updateData);
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
              onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); }}
              className="w-9 h-9 rounded-xl bg-edu-bg flex items-center justify-center press-scale hover:bg-edu-border/50 transition-colors border border-edu-border/30"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-indigo-500" />}
            </button>
            <button
              onClick={() => setSettingsMenuOpen(true)}
              className="w-9 h-9 rounded-xl bg-edu-bg flex items-center justify-center press-scale hover:bg-edu-border/50 transition-colors border border-edu-border/30"
            >
              <Settings size={18} className="text-edu-text" />
            </button>
            <button
              onClick={() => {
                hapticLight();
                showConfirm("Tizimdan chiqishni xohlaysizmi?", (ok) => {
                  if (ok) logout();
                });
              }}
              className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center press-scale hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={18} className="text-red-500" />
            </button>
          </div>
        }
      />

      <div className="px-4 pt-4 space-y-5 pb-6">
        
        {/* Workspace Context Switcher Card (Only for freelancers) */}
        {me?.isFreelancer && (
          <Card 
            className={cn(
              "border-2 relative overflow-hidden group cursor-pointer press-scale animate-fade-in shadow-ios",
              activeRole === 'CLIENT' 
                ? "bg-indigo-600/5 border-indigo-600/10 dark:bg-indigo-500/10 dark:border-indigo-500/20" 
                : "bg-edu-primary/5 border-edu-primary/10 dark:bg-edu-primary/10 dark:border-edu-primary/20"
            )}
            onClick={() => { hapticLight(); toggleActiveRole(); }}
            radius="2xl"
          >
            <div className={cn(
              "absolute -right-6 -top-6 w-24 h-24 blur-2xl rounded-full opacity-20 pointer-events-none transition-colors duration-500",
              activeRole === 'CLIENT' ? "bg-indigo-600" : "bg-edu-primary"
            )} />
            
            <CardContent className="p-4 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500",
                  activeRole === 'CLIENT' 
                    ? "bg-indigo-600 text-white shadow-indigo-600/20" 
                    : "bg-edu-primary text-white shadow-edu-primary/20"
                )}>
                  {activeRole === 'CLIENT' ? <Briefcase size={22} /> : <User size={22} />}
                </div>
                <div>
                  <h3 className="text-[13px] font-black text-edu-text leading-tight">
                    {activeRole === 'CLIENT' ? 'Mutaxassis ish joyi' : 'Mijoz ish joyi'}
                  </h3>
                  <p className="text-[10px] text-edu-muted font-bold uppercase tracking-wider mt-0.5">
                    {activeRole === 'CLIENT' ? 'Daromad olishga o\'tish' : 'E\'lon berishga o\'tish'}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-edu-surface border border-edu-border flex items-center justify-center shadow-sm group-hover:translate-x-1 transition-transform">
                <ArrowRight size={14} className="text-edu-muted" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── CLIENT VIEW ────────────────────────────────────────────────────────── */}
        {activeRole === 'CLIENT' && (
          <div className="space-y-4 animate-fade-up">

            {/* Verification Status Card */}
            {me?.verificationStatus !== 'APPROVED' && (
              <VerificationStatusCard 
                status={me?.verificationStatus}
                onClick={() => navigate('/verification')}
              />
            )}

            {/* Client Stats Grid */}

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
                  
                  {/* Badges Container */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    <UserBadge badge={me?.badge} size="xs" />
                    {me?.isVip && <VipBadge size="xs" />}
                    {me?.verificationStatus === 'APPROVED' && <VerifiedBadge size="xs" />}
                  </div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-edu-primary/10 text-edu-primary px-2.5 py-0.5 rounded-full mt-1.5 border border-edu-primary/20">
                    Buyurtmachi profili
                  </span>
                  
                  {/* Gamification Stats */}
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                      <span>🔥</span> {me?.streakCount || 0} Kun
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                      <span>⚡</span> {me?.xp || 0} XP
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

            {/* Client stats */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-edu-surface border border-edu-border/30 rounded-2xl p-3 flex flex-col justify-between min-h-[82px] shadow-sm relative overflow-hidden">
                <span className="text-lg">📝</span>
                <div className="mt-2">
                  <p className="text-lg font-black font-display text-edu-text leading-none">{clientStats?.createdTasks ?? 0}</p>
                  <p className="text-[9px] font-bold text-edu-muted uppercase tracking-wider mt-1 leading-snug">E'lon qilingan</p>
                </div>
              </div>
              <div className="bg-edu-surface border border-edu-border/30 rounded-2xl p-3 flex flex-col justify-between min-h-[82px] shadow-sm relative overflow-hidden">
                <span className="text-lg">💰</span>
                <div className="mt-2">
                  <p className="text-lg font-black font-display text-edu-text leading-none truncate">{formatPrice(clientStats?.totalSpent ?? 0)}</p>
                  <p className="text-[9px] font-bold text-edu-muted uppercase tracking-wider mt-1 leading-snug">Sarflandi</p>
                </div>
              </div>
              <div className="bg-edu-surface border border-edu-border/30 rounded-2xl p-3 flex flex-col justify-between min-h-[82px] shadow-sm relative overflow-hidden">
                <span className="text-lg">⚡</span>
                <div className="mt-2">
                  <p className="text-lg font-black font-display text-edu-text leading-none">
                    {(clientStats?.openTasks ?? 0) + (clientStats?.inProgressTasks ?? 0) + (clientStats?.inReviewTasks ?? 0)}
                  </p>
                  <p className="text-[9px] font-bold text-edu-muted uppercase tracking-wider mt-1 leading-snug">Faol ishlar</p>
                </div>
              </div>
            </div>

            {/* Post task button */}
            <Button
              variant="primary"
              onClick={() => navigate('/tasks/create')}
              className="w-full h-12 rounded-2xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-edu-primary/10"
            >
              Yangi vazifa yaratish <Plus size={16} />
            </Button>

            {/* Become Freelancer Banner */}
            {!me?.isFreelancer && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden mt-2">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                <h3 className="text-lg font-bold mb-1">Mutaxassis bo'lish</h3>
                <p className="text-indigo-100 text-sm mb-4">Platformada vazifalarni bajarish orqali daromad olishni boshlang.</p>
                <Button variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-slate-50" onClick={() => navigate('/become-freelancer')}>
                  Hozir boshlash <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ─── FREELANCER VIEW ────────────────────────────────────────────────────── */}
        {activeRole === 'FREELANCER' && (
          <div className="space-y-4 animate-fade-up">

            {/* Verification Status Card */}
            {me?.verificationStatus !== 'APPROVED' && (
              <VerificationStatusCard 
                status={me?.verificationStatus}
                onClick={() => navigate('/verification')}
              />
            )}

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
                  
                  {/* Badges Container */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    <UserBadge badge={me?.badge} size="xs" />
                    {me?.isVip && <VipBadge size="xs" />}
                    {me?.verificationStatus === 'APPROVED' && <VerifiedBadge size="xs" />}
                  </div>
                  
                  {/* Categories */}
                  {me?.freelancerCategories?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-2.5">
                      {me.freelancerCategories.map(cat => (
                        <span key={cat} className="text-[9px] font-black bg-edu-primary/10 text-edu-primary px-2 py-0.5 rounded-full border border-edu-primary/20 uppercase tracking-wide">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Experience */}
                  {me?.freelancerExperience !== null && (
                    <p className="text-xs text-edu-muted mt-1.5 font-bold flex items-center justify-center gap-1">
                      <span>💼</span> {me.freelancerExperience} yillik tajriba
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gamification: Level & Streak */}
            <div className="bg-edu-surface border border-edu-border/40 shadow-sm rounded-2xl p-4 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none" />
              
              <div className="flex justify-between items-center mb-3 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-edu-muted">Sizning darajangiz</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black text-edu-text">{calculateLevel(me?.completedTasksCount).name}</span>
                    <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-md font-bold">LVL {calculateLevel(me?.completedTasksCount).level}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-wider text-edu-muted">Davomiylik</span>
                  <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900/50">
                    <span className="text-orange-500 font-black text-sm">🔥</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold text-xs">{calculateStreak(me)} kun</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative z-10">
                <div className="flex justify-between text-[9px] font-bold text-edu-muted mb-1.5">
                  <span>Joriy daraja</span>
                  {calculateLevel(me?.completedTasksCount).nextTarget ? (
                    <span>Yangi darajaga: {calculateLevel(me?.completedTasksCount).nextTarget - (me?.completedTasksCount || 0)} ta ish</span>
                  ) : (
                    <span className="text-yellow-500">Eng yuqori daraja!</span>
                  )}
                </div>
                <div className="h-2 w-full bg-edu-border/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${Math.min(100, Math.max(0, calculateLevel(me?.completedTasksCount).progress * 100))}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Freelancer Bio */}
            {me?.freelancerBio && (
              <Card className="bg-edu-surface border border-edu-border/40 shadow-sm" radius="xl">
                <CardContent className="p-4">
                  <p className="text-2xs font-bold text-edu-primary uppercase tracking-wider mb-2">Mutaxassis tavsifi (Freelancer Bio)</p>
                  <p className="text-sm text-edu-text leading-relaxed font-medium">{me.freelancerBio}</p>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Bajarilgan vazifalar', value: me?.completedTasksCount ?? 0, icon: '🏆', color: 'from-green-500/10 to-emerald-500/5 border-green-500/20' },
                { label: 'O\'rtacha reyting', value: avgRating !== '—' ? avgRating : '—', icon: '⭐', color: 'from-amber-500/10 to-yellow-500/5 border-amber-500/20' },
                { label: 'Muvaffaqiyat darajasi', value: me?.completionRate ? `${Math.round(me.completionRate)}%` : '100%', icon: '📈', color: 'from-blue-500/10 to-indigo-500/5 border-blue-500/20' },
                { label: 'Javob tezligi (soat)', value: me?.avgResponseHrs ? `${me.avgResponseHrs}s` : '1s', icon: '⚡', color: 'from-orange-500/10 to-red-500/5 border-orange-500/20' },
              ].map((item, i) => (
                <Card key={i} className={`bg-gradient-to-br ${item.color} border relative overflow-hidden`} radius="xl">
                  <CardContent className="p-4 flex flex-col justify-between h-full min-h-[92px]">
                    <div className="flex justify-between items-start">
                      <span className="text-lg">{item.icon}</span>
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
                  <Card 
                    key={item.id} 
                    className="bg-edu-surface border border-edu-border/40 relative group overflow-hidden cursor-pointer active:scale-[0.98] transition-all" 
                    radius="xl"
                    onClick={() => handleViewFile(item.fileId, item.title)}
                  >
                    <CardContent className="p-3 flex flex-col h-full justify-between">
                      <div className="w-full h-20 bg-gradient-to-br from-edu-primary/5 to-edu-accent/5 rounded-xl flex items-center justify-center mb-2 border border-edu-border/30 relative">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-edu-bg flex items-center justify-center shadow-sm">
                          <Briefcase size={18} className="text-edu-primary" />
                        </div>
                      </div>
                      <p className="text-xs font-bold text-edu-text truncate px-0.5">{item.title}</p>
                      
                      <button
                        className="absolute top-2 right-2 w-6 h-6 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center press-scale hover:bg-red-200 transition-colors border border-red-500/10 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
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

            {/* Offer ready gig button */}
            <Button
              variant="primary"
              onClick={() => navigate('/gigs/create')}
              className="w-full h-12 rounded-2xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-edu-primary/10"
            >
              Yangi tayyor xizmat (Gig) yaratish <Plus size={16} />
            </Button>
          </div>
        )}

        {/* Referral Card -> ReferralsScreen */}
        <Card 
          className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent border border-purple-500/20 shadow-card overflow-hidden relative cursor-pointer press-scale" 
          radius="xl"
          onClick={() => navigate('/referrals')}
        >
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/10 blur-xl rounded-full pointer-events-none" />
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">🎁 Taklif va Bonuslar</p>
              </div>
              <p className="text-[11px] text-edu-muted leading-relaxed max-w-[200px]">
                Do'stlaringizni taklif qiling va ularning har bir buyurtmasidan 5% foyda ko'ring!
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center text-purple-600">
              <ArrowRight size={18} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Menu Sheet */}
      <BottomSheet isOpen={settingsMenuOpen} onClose={() => setSettingsMenuOpen(false)} title="Sozlamalar">
        <div className="space-y-2 py-4">
          <button 
            className="w-full flex items-center gap-3 p-4 bg-edu-surface rounded-xl border border-edu-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={() => { setSettingsMenuOpen(false); openEditProfile(); }}
          >
            <div className="w-8 h-8 rounded-full bg-edu-primary/10 flex items-center justify-center text-edu-primary">
              <User size={18} />
            </div>
            <span className="font-bold text-edu-text">Profilni tahrirlash</span>
          </button>
          
          <button 
            className="w-full flex items-center gap-3 p-4 bg-edu-surface rounded-xl border border-edu-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={() => { setSettingsMenuOpen(false); navigate('/settings/notifications'); }}
          >
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Bell size={18} />
            </div>
            <span className="font-bold text-edu-text">Bildirishnomalar (Push)</span>
          </button>

          <button 
            className="w-full flex items-center gap-3 p-4 bg-edu-surface rounded-xl border border-edu-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={() => { 
              setSettingsMenuOpen(false); 
              toast("Tilni o'zgartirish tez orada qo'shiladi!", { icon: '🌐' });
            }}
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <span className="text-[16px]">🇺🇿</span>
            </div>
            <span className="font-bold text-edu-text">Til (O'zbek)</span>
          </button>
        </div>
      </BottomSheet>

      {/* Edit Profile Sheet */}
      <BottomSheet isOpen={editOpen} onClose={() => setEditOpen(false)} title="Profilni tahrirlash" fullHeight>
        <div className="space-y-4 py-2">
          
          {/* Tab Selection (Only for freelancers) */}
          {me?.isFreelancer && (
            <div className="flex bg-edu-bg p-1 rounded-xl border border-edu-border/30 mb-2">
              <button
                type="button"
                onClick={() => { setEditTab('client'); }}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all press-scale",
                  editTab === 'client' ? "bg-white text-edu-text shadow-sm" : "text-edu-muted"
                )}
              >
                Mijoz ma'lumotlari
              </button>
              <button
                type="button"
                onClick={() => { setEditTab('freelancer'); }}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all press-scale",
                  editTab === 'freelancer' ? "bg-white text-edu-text shadow-sm" : "text-edu-muted"
                )}
              >
                Mutaxassis ma'lumotlari
              </button>
            </div>
          )}

          {/* Client Details fields */}
          {(editTab === 'client' || !me?.isFreelancer) && (
            <div className="space-y-4 animate-fade-in">
              <TextInput 
                label="Ismingiz" 
                value={editForm.fullname || ''} 
                onValueChange={(v) => { setEditForm(f => ({ ...f, fullname: v })); setErrors(e => ({ ...e, fullname: null })); }} 
                error={errors.fullname?.[0]} 
              />
              <TextArea 
                label="Bio" 
                value={editForm.bio || ''} 
                onValueChange={(v) => { setEditForm(f => ({ ...f, bio: v })); setErrors(e => ({ ...e, bio: null })); }} 
                maxLength={1000} 
                error={errors.bio?.[0]} 
              />
              <TextInput 
                label="Ko'nikmalar (vergul bilan)" 
                placeholder="Python, Node.js, Tarjima" 
                value={editForm.skills || ''} 
                onValueChange={(v) => { setEditForm(f => ({ ...f, skills: v })); setErrors(e => ({ ...e, skills: null })); }} 
                error={errors.skills?.[0]} 
              />
            </div>
          )}

          {/* Freelancer Details fields */}
          {editTab === 'freelancer' && me?.isFreelancer && (
            <div className="space-y-4 animate-fade-in">
              <TextArea 
                label="Mutaxassis tavsifi (Freelancer Bio)" 
                value={editForm.freelancerBio || ''} 
                onValueChange={(v) => { setEditForm(f => ({ ...f, freelancerBio: v })); setErrors(e => ({ ...e, freelancerBio: null })); }} 
                maxLength={1000} 
                error={errors.freelancerBio?.[0]} 
              />
              
              <TextInput 
                type="number"
                label="Tajribangiz (yil)" 
                value={editForm.freelancerExperience || ''} 
                onValueChange={(v) => { setEditForm(f => ({ ...f, freelancerExperience: v })); setErrors(e => ({ ...e, freelancerExperience: null })); }} 
                error={errors.freelancerExperience?.[0]} 
              />

              {/* Categories */}
              <div>
                <label className="block text-edu-muted text-sm font-medium mb-2">
                  Mutaxassis yo'nalishlari (Maks 3 ta)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => {
                    const isSelected = editForm.freelancerCategories?.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategoryInEdit(cat)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                            : 'bg-edu-surface text-edu-muted border-edu-border/30 hover:bg-edu-bg'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                {errors.freelancerCategories && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.freelancerCategories?.[0]}
                  </span>
                )}
              </div>
            </div>
          )}

          <Button fullWidth size="lg" variant="primary" isLoading={updateMe.isPending} onClick={handleEditSave} className="mt-2">
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
            maxLength={100}
            currentLength={portfolioTitle.length}
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

      <EduViewer
        isOpen={!!viewerFile}
        onClose={() => setViewerFile(null)}
        file={viewerFile}
      />
    </PageLayout>
  );
}
