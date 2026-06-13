import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Header } from '../../components/layout/Header';
import { usersApi } from '../../services/users.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { hapticLight, hapticImpact } from '../../lib/telegram';

export default function NotificationSettingsScreen() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [prefs, setPrefs] = useState({
    chatMessage: true,
    newBid: true,
    deadlineReminder: true,
    taskAssigned: true,
    taskStatusChanged: true,
  });

  const { data: me } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => usersApi.getMe().then(r => r.data.data),
  });

  useEffect(() => {
    if (me?.notifPrefs) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrefs(p => ({
        ...p,
        ...me.notifPrefs
      }));
    }
  }, [me?.notifPrefs]);

  const updatePrefs = useMutation({
    mutationFn: (data) => usersApi.updateMe({ notifPrefs: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      toast.success('Sozlamalar saqlandi');
      hapticImpact('medium');
      navigate(-1);
    },
    onError: () => {
      toast.error('Xatolik yuz berdi');
    }
  });

  const handleSave = () => {
    hapticLight();
    updatePrefs.mutate(prefs);
  };

  const handleToggle = (key) => {
    setPrefs(p => {
      const nextVal = !p[key];
      // Live preview: play sound/haptic based on state
      if (nextVal) {
        hapticLight();
        try {
          const audio = new Audio('/sounds/pop.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch(error) {
          console.debug('Audio play prevented by browser', error);
        }
      } else {
        hapticImpact('light');
      }
      return { ...p, [key]: nextVal };
    });
  };

  return (
    <PageLayout>
      <Header title="Bildirishnomalar" showBack />
      <div className="p-4 space-y-4 pb-10">
        <p className="text-sm text-edu-muted mb-4">
          Telegram bot orqali va Ilova ichida keladigan bildirishnomalarni sozlang. Yoqilganda jonli effektlarni his etasiz.
        </p>

        <div className="space-y-3">
          <SettingItem
            title="Yangi xabarlar"
            desc="Chatda yangi xabar kelganda"
            checked={prefs.chatMessage}
            onChange={() => handleToggle('chatMessage')}
          />
          <SettingItem
            title="Yangi takliflar"
            desc="Vazifangizga yangi mutaxassis taklif berganda"
            checked={prefs.newBid}
            onChange={() => handleToggle('newBid')}
          />
          <SettingItem
            title="Muddat tugashi"
            desc="Vazifa muddati tugashiga oz qolganda"
            checked={prefs.deadlineReminder}
            onChange={() => handleToggle('deadlineReminder')}
          />
          <SettingItem
            title="Vazifa belgilanishi"
            desc="Sizga ish topshirilganda"
            checked={prefs.taskAssigned}
            onChange={() => handleToggle('taskAssigned')}
          />
          <SettingItem
            title="Vazifa holati o'zgarishi"
            desc="Vazifa holati yangilanganda (masalan, Yakunlandi)"
            checked={prefs.taskStatusChanged}
            onChange={() => handleToggle('taskStatusChanged')}
          />
        </div>

        <div className="pt-6">
          <Button fullWidth variant="primary" isLoading={updatePrefs.isPending} onClick={handleSave}>
            Saqlash
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}

function SettingItem({ title, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-edu-surface border border-edu-border/50 rounded-2xl active:scale-[0.97] transition-transform duration-[120ms] shadow-sm">
      <div className="flex-1 pr-4">
        <p className="font-bold text-edu-text text-[15px]">{title}</p>
        <p className="text-xs text-edu-muted mt-1 leading-relaxed">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out ${checked ? 'bg-edu-primary' : 'bg-edu-border'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}
