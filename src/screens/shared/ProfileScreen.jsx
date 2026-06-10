import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import { Settings, LogOut, Moon, Sun, ArrowRight, Plus, Briefcase, User, Gift } from 'lucide-react';
import { ProfileSkeleton } from '../../components/ui/SkeletonCard';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { VerificationStatusCard } from '../../components/cards/VerificationStatusCard';
import { cn } from '../../lib/utils';
import { hapticLight, showConfirm } from '../../lib/telegram';
import EduViewer from '../../components/ui/EduViewer';
import { filesApi } from '../../services/other.service';
import toast from 'react-hot-toast';

import { SectionErrorBoundary } from '../../components/ui/SectionErrorBoundary';
import { useProfileData } from './Profile/hooks/useProfileData';
import { ProfileHeader } from './Profile/ProfileHeader';
import { ProfileStats } from './Profile/ProfileStats';
import { ProfilePortfolio } from './Profile/ProfilePortfolio';
import { ProfileEditSheet } from './Profile/ProfileEditSheet';
import { ProfileSettings } from './Profile/ProfileSettings';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const toggleActiveRole = useAuthStore((s) => s.toggleActiveRole);
  const logout = useAuthStore((s) => s.logout);

  const { me, clientStats, activeRole, isLoading, clientStatsLoading, updateMe, addPortfolio, delPortfolio, deleteMe } = useProfileData();

  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
              onClick={() => setSettingsOpen(true)}
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
                  <h3 className="text-[13px] font-bold text-edu-text leading-tight">
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

        <div className="space-y-4 animate-fade-up">
          {/* Verification Status Card */}
          {me?.verificationStatus !== 'APPROVED' && (
            <VerificationStatusCard 
              status={me?.verificationStatus}
              onClick={() => navigate('/verification')}
            />
          )}

          <ProfileHeader me={me} activeRole={activeRole} />
          
          <SectionErrorBoundary fallbackTitle="Statistikani yuklashda xatolik">
            <ProfileStats me={me} activeRole={activeRole} clientStats={clientStats} isLoading={clientStatsLoading} />
          </SectionErrorBoundary>

          {activeRole === 'CLIENT' && (
            <>
              {/* Post task button */}
              <button
                onClick={() => navigate('/tasks/create')}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-edu-primary to-edu-accent text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-edu-primary/20 active:scale-[0.98] transition-all"
              >
                <span>Yangi vazifa yaratish</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus size={16} strokeWidth={3} />
                </div>
              </button>

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
            </>
          )}

          {activeRole === 'FREELANCER' && (
            <>
              <SectionErrorBoundary fallbackTitle="Portfolioni yuklashda xatolik">
                <ProfilePortfolio 
                  me={me} 
                  addPortfolio={addPortfolio} 
                  delPortfolio={delPortfolio} 
                  handleViewFile={handleViewFile} 
                />
              </SectionErrorBoundary>
              
              {/* Offer ready gig button */}
              <button
                onClick={() => navigate('/gigs/create')}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
              >
                <span>Tayyor xizmat (Gig) yaratish</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus size={16} strokeWidth={3} />
                </div>
              </button>
            </>
          )}
        </div>

        {/* Referral Card */}
        <Card 
          className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent border border-purple-500/20 shadow-card overflow-hidden relative cursor-pointer press-scale" 
          radius="xl"
          onClick={() => navigate('/referrals')}
        >
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/10 blur-xl rounded-full pointer-events-none" />
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Gift size={14} className="text-purple-700 dark:text-purple-400" />
                <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Taklif va Bonuslar</p>
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

      <ProfileSettings 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        onOpenEdit={() => setEditOpen(true)} 
        deleteMe={deleteMe} 
      />

      <ProfileEditSheet 
        isOpen={editOpen} 
        onClose={() => setEditOpen(false)} 
        me={me} 
        updateMe={updateMe} 
      />

      <EduViewer
        isOpen={!!viewerFile}
        onClose={() => setViewerFile(null)}
        file={viewerFile}
      />
    </PageLayout>
  );
}
