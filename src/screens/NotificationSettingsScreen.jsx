// src/screens/NotificationSettingsScreen.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Header } from '../components/layout/Header';
import { usersApi } from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';

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

  const { data: me, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => usersApi.getMe().then(r => r.data.data),
  });

  useEffect(() => {
    if (me?.notifPrefs) {
      setPrefs({
        ...prefs,
        ...me.notifPrefs
      });
    }
  }, [me]);

  const updatePrefs = useMutation({
    mutationFn: (data) => usersApi.updateMe({ notifPrefs: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      toast.success('Sozlamalar saqlandi');
      navigate(-1);
    },
    onError: () => {
      toast.error('Xatolik yuz berdi');
    }
  });

  const handleSave = () => {
    updatePrefs.mutate(prefs);
  };

  const handleToggle = (key) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  return (
    <PageLayout>
      <Header title="Bildirishnomalar" showBack />
      <div className="p-4 space-y-4">
        <p className="text-sm text-edu-muted mb-4">
          Telegram bot orqali keladigan bildirishnomalarni sozlang.
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 bg-edu-surface border border-edu-border rounded-xl">
            <div>
              <p className="font-bold text-edu-text text-sm">Yangi xabarlar</p>
              <p className="text-xs text-edu-muted">Chatda yangi xabar kelganda</p>
            </div>
            <Toggle checked={prefs.chatMessage} onChange={() => handleToggle('chatMessage')} />
          </div>

          <div className="flex items-center justify-between p-4 bg-edu-surface border border-edu-border rounded-xl">
            <div>
              <p className="font-bold text-edu-text text-sm">Yangi takliflar</p>
              <p className="text-xs text-edu-muted">Vazifangizga yangi mutaxassis taklif berganda</p>
            </div>
            <Toggle checked={prefs.newBid} onChange={() => handleToggle('newBid')} />
          </div>

          <div className="flex items-center justify-between p-4 bg-edu-surface border border-edu-border rounded-xl">
            <div>
              <p className="font-bold text-edu-text text-sm">Muddat tugashi</p>
              <p className="text-xs text-edu-muted">Vazifa muddati tugashiga oz qolganda</p>
            </div>
            <Toggle checked={prefs.deadlineReminder} onChange={() => handleToggle('deadlineReminder')} />
          </div>

          <div className="flex items-center justify-between p-4 bg-edu-surface border border-edu-border rounded-xl">
            <div>
              <p className="font-bold text-edu-text text-sm">Vazifa belgilanishi</p>
              <p className="text-xs text-edu-muted">Sizga ish topshirilganda</p>
            </div>
            <Toggle checked={prefs.taskAssigned} onChange={() => handleToggle('taskAssigned')} />
          </div>

          <div className="flex items-center justify-between p-4 bg-edu-surface border border-edu-border rounded-xl">
            <div>
              <p className="font-bold text-edu-text text-sm">Vazifa holati o'zgarishi</p>
              <p className="text-xs text-edu-muted">Vazifa holati yangilanganda (masalan, Yakunlandi)</p>
            </div>
            <Toggle checked={prefs.taskStatusChanged} onChange={() => handleToggle('taskStatusChanged')} />
          </div>
        </div>

        <div className="pt-4">
          <Button fullWidth variant="primary" isLoading={updatePrefs.isPending} onClick={handleSave}>
            Saqlash
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-edu-primary' : 'bg-edu-border'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}
