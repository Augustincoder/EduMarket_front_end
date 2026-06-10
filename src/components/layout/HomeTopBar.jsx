import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Avatar } from '../ui/Avatar';
import { BottomSheet } from '../ui/BottomSheet';
import { Bell, User, ChevronRight } from 'lucide-react';
import { hapticLight } from '../../lib/telegram';

export function HomeTopBar({ greeting }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const unreadNotifications = useNotificationStore((s) => s.unreadCount);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    hapticLight();
    setIsOpen(true);
  };

  const navigateTo = (path) => {
    hapticLight();
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4 mb-8 pt-4">
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold text-edu-muted uppercase tracking-[0.12em] opacity-80">{greeting}</p>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-edu-text tracking-tight truncate">
            {user?.fullname}
          </h1>
        </div>
        
        <div className="relative shrink-0 active-spring cursor-pointer" onClick={handleOpen}>
          <div className="relative">
            <Avatar name={user?.fullname} avatarUrl={user?.avatarUrl} size="lg" className="ring-4 ring-edu-surface shadow-ios" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-edu-urgent text-white text-[10px] font-bold min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border-2 border-edu-surface shadow-sm animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </div>
          {user?.isVip && (
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-edu-vip to-amber-600 rounded-full p-1 border-2 border-edu-surface text-[10px] shadow-sm">👑</span>
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Menyu"
      >
        <div className="flex flex-col gap-3 py-2 px-1">
          {/* User Profile Summary Header */}
          <div className="flex items-center gap-4 bg-edu-surface p-4 rounded-[20px] border border-edu-border/50 shadow-sm mb-2">
            <Avatar name={user?.fullname} avatarUrl={user?.avatarUrl} size="md" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-edu-text truncate">{user?.fullname}</h3>
              <p className="text-[11px] text-edu-muted font-bold truncate">@{user?.username}</p>
            </div>
            {user?.isVip && (
              <span className="bg-edu-vip/10 text-amber-500 text-[10px] font-bold px-2 py-1 rounded-lg border border-edu-vip/20">
                VIP
              </span>
            )}
          </div>

          <button
            onClick={() => navigateTo('/notifications')}
            className="flex items-center gap-4 bg-edu-surface border border-edu-border/50 p-4 rounded-[20px] active-spring hover:border-edu-primary/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-edu-primary/10 text-edu-primary flex items-center justify-center relative shrink-0">
              <Bell size={24} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-edu-urgent text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-edu-surface">
                  {unreadNotifications}
                </span>
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-[15px] font-bold text-edu-text mb-0.5 truncate">Bildirishnomalar</h4>
              <p className="text-[11px] font-bold text-edu-muted truncate">Sizga kelgan so'nggi xabarlar</p>
            </div>
            <ChevronRight size={20} className="text-edu-muted/50 shrink-0" />
          </button>

          <button
            onClick={() => navigateTo('/profile')}
            className="flex items-center gap-4 bg-edu-surface border border-edu-border/50 p-4 rounded-[20px] active-spring hover:border-edu-primary/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-edu-accent/10 text-edu-accent flex items-center justify-center shrink-0">
              <User size={24} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-[15px] font-bold text-edu-text mb-0.5 truncate">Mening Profilim</h4>
              <p className="text-[11px] font-bold text-edu-muted truncate">Shaxsiy ma'lumotlar va sozlamalar</p>
            </div>
            <ChevronRight size={20} className="text-edu-muted/50 shrink-0" />
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

export default HomeTopBar;
