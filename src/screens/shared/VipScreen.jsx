// src/screens/VipScreen.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Copy, CheckCircle } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/forms/TextInput';
import { FileUpload } from '../../components/forms/FileUpload';
import { useAuthStore } from '../../store/authStore';
import { useMainButton } from '../../hooks/useMainButton';
import { vipApi } from '../../services/other.service';
import { VIP_PACKAGES, VIP_BENEFITS } from '../../lib/constants';
import { copyToClipboard, cn } from '../../lib/utils';
import { hapticSuccess } from '../../lib/telegram';
import { trackEvent } from '../../lib/observability';
import toast from 'react-hot-toast';

const CARD_NUMBER = import.meta.env.VITE_VIP_CARD_NUMBER || '0000 0000 0000 0000';

export default function VipScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [selected, setSelected]   = useState('30_DAY');
  const [payMode, setPayMode]      = useState('AUTOMATED'); // 'AUTOMATED' | 'MANUAL'
  const [phone, setPhone]          = useState('');
  const [files, setFiles]          = useState([]);
  const [loading, setLoading]      = useState(false);
  const [submitted, setSubmitted]  = useState(false);
  const [copied, setCopied]        = useState(false);
  const [errors, setErrors]        = useState({});

  const handleCopyCard = () => {
    copyToClipboard(CARD_NUMBER);
    setCopied(true);
    toast.success('Karta raqami nusxalandi!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    setErrors({});
    if (!phone.trim() || !files.length) {
      toast.error("Telefon raqam va to'lov skrinshotini kiriting");
      return;
    }
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^\+?998\d{9}$/.test(cleanPhone)) {
      setErrors({ phoneNumber: ['Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak'] });
      toast.error("Telefon raqami noto'g'ri shaklda kiritilgan");
      return;
    }
    setLoading(true);
    try {
      await vipApi.buy({
        packageType:      selected,
        screenshotFileId: files[0].id,
        phoneNumber:      cleanPhone,
      });
      hapticSuccess();
      trackEvent('VIP Requested', { packageType: selected });
      setSubmitted(true);
    } catch (err) {
      if (err.serverErrors) {
        setErrors(err.serverErrors);
        toast.error('Iltimos, xatoliklarni to\'g\'irlang');
      } else {
        toast.error(err.serverMsg || "VIP so'rovida xato");
      }
    } finally {
      setLoading(false);
    }
  };

  useMainButton({
    text: submitted ? '' : (payMode === 'AUTOMATED' ? 'To\'lovga o\'tish 💳' : 'VIP so\'rovi yuborish'),
    onClick: handleSubmit,
    isLoading: loading,
    disabled: (payMode === 'MANUAL' && (!phone.trim() || !files.length)),
    color: '#BA7517', // edu-vip color
  }, [phone, files, loading, submitted, payMode]);

  if (submitted) {
    return (
      <PageLayout showNav={false}>
        <Header showBack />
        <div className="flex flex-col items-center justify-center h-[70dvh] px-6 text-center gap-5">
          <div className="w-20 h-20 rounded-full bg-edu-primary/10 flex items-center justify-center animate-fade-up">
            <CheckCircle size={40} className="text-edu-primary" />
          </div>
          <div className="animate-fade-up">
            <h2 className="text-2xl font-black font-display text-edu-text">So'rov qabul qilindi!</h2>
            <p className="text-edu-muted mt-2 leading-relaxed">
              Admin 24 soat ichida tekshiradi va VIP aktivatsiya qiladi. Bot orqali xabar keladi.
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={() => navigate('/home', { replace: true })}>
            Bosh sahifa
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showNav={false}>
      <Header title="VIP a'zolik" showBack />
      <div className="px-4 py-4 space-y-5 pb-nav">

        {/* Current status */}
        <Card className="bg-gradient-to-br from-[#FFD700] to-[#FDB931] border border-[#FFF8B0]/50 shadow-[0_8px_30px_rgba(255,215,0,0.4)] relative overflow-hidden" radius="2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/40 pointer-events-none animate-pulse-slow" />
          <CardContent className="p-5 text-white relative z-10">
            <p className="text-sm text-white/80 font-medium uppercase tracking-widest mb-1">Joriy status</p>
            <p className="text-[28px] font-black font-display tracking-tight drop-shadow-md">{user?.badge || 'ISHONCHLI'}</p>
            <p className="text-sm font-semibold text-white/90 mt-1">VIP olsangiz → VIP a'zo bo'lasiz</p>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-edu-text mb-3">👑 VIP afzalliklari</p>
            <div className="space-y-2.5">
              {VIP_BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-sm text-edu-text">{b.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Package selection */}
        <div>
          <p className="text-sm font-bold text-edu-text mb-3">📦 Paket tanlang</p>
          <div className="grid grid-cols-2 gap-3">
            {VIP_PACKAGES.map((pkg) => (
              <Card
                key={pkg.key}
                isPressable
                onClick={() => setSelected(pkg.key)}
                className={[
                  'border-2 transition-all duration-300 active-bounce relative overflow-hidden',
                  selected === pkg.key
                    ? 'border-yellow-400 bg-gradient-to-b from-yellow-500/10 to-orange-500/5 shadow-[0_4px_20px_rgba(250,204,21,0.15)]'
                    : 'border-edu-border/50 bg-edu-surface hover:border-edu-border',
                ].join(' ')}
                radius="2xl"
              >
                <CardContent className="p-4 text-center">
                  {pkg.tag && (
                    <span className="inline-block bg-edu-vip text-white text-2xs font-bold px-2 py-0.5 rounded-full mb-2">
                      {pkg.tag}
                    </span>
                  )}
                  <p className="text-base font-black font-display text-edu-text">{pkg.label}</p>
                  <p className="text-lg font-black text-edu-vip mt-1">{pkg.priceFormatted}</p>
                  <p className="text-xs text-edu-muted">so'm</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Mode Selector */}
        <div className="flex bg-edu-surface border border-edu-border/50 p-1 rounded-2xl shadow-sm">
          <button 
            onClick={() => setPayMode('AUTOMATED')}
            className={cn("flex-1 py-2.5 text-xs font-bold rounded-xl transition-all", payMode === 'AUTOMATED' ? "bg-edu-primary text-white shadow-btn" : "text-edu-muted")}
          >
            ⚡ Avtomatik to'lov
          </button>
          <button 
            onClick={() => setPayMode('MANUAL')}
            className={cn("flex-1 py-2.5 text-xs font-bold rounded-xl transition-all", payMode === 'MANUAL' ? "bg-edu-primary text-white shadow-btn" : "text-edu-muted")}
          >
            🏢 Karta orqali
          </button>
        </div>

        {payMode === 'AUTOMATED' ? (
          <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
            <CardContent className="p-4 space-y-4">
              <p className="text-sm font-bold text-edu-text">To'lov tizimini tanlang</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center gap-2 p-4 border border-edu-border/40 rounded-2xl hover:border-blue-500 transition-all active:scale-95 group">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md">
                    <img src="https://click.uz/wp-content/themes/click/img/logo-dark.png" alt="Click" className="max-w-[80%]" />
                  </div>
                  <span className="text-xs font-bold text-edu-muted group-hover:text-edu-text">Click</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 border border-edu-border/40 rounded-2xl hover:border-blue-500 transition-all active:scale-95 group">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md">
                    <img src="https://cdn.payme.uz/logo/payme_color.svg" alt="Payme" className="max-w-[80%]" />
                  </div>
                  <span className="text-xs font-bold text-edu-muted group-hover:text-edu-text">Payme</span>
                </button>
              </div>
              <p className="text-2xs text-edu-muted text-center italic">To'lovdan so'ng VIP darhol yoqiladi ⚡</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Payment method */}
            <Card className="bg-edu-surface shadow-card border border-edu-border/40" radius="xl">
              <CardContent className="p-4">
                <p className="text-sm font-bold text-edu-text mb-3">💳 To'lov usuli</p>
                <p className="text-xs text-edu-muted mb-2">Admin kartasiga o'tkazma:</p>
                <button
                  onClick={handleCopyCard}
                  className={[
                    'w-full flex items-center justify-between bg-edu-bg rounded-[16px] px-4 py-3.5 border transition-all active-bounce shadow-sm',
                    copied ? 'border-edu-primary bg-edu-primary/5' : 'border-edu-border',
                  ].join(' ')}
                >
                  <span className="font-mono font-bold text-edu-text text-base tracking-widest">
                    {CARD_NUMBER}
                  </span>
                  {copied
                    ? <CheckCircle size={18} className="text-edu-primary" />
                    : <Copy size={18} className="text-edu-muted" />
                  }
                </button>
                <p className="text-xs text-edu-muted mt-2 text-center">
                  To'lovdan so'ng skrinshotni yuklang
                </p>
              </CardContent>
            </Card>

            {/* Phone + Screenshot */}
            <TextInput
              label="📱 Telefon raqam *"
              placeholder="+998 90 123 45 67"
              value={phone}
              onValueChange={(v) => { setPhone(v); setErrors((e) => ({ ...e, phoneNumber: null })); }}
              type="tel"
              error={errors.phoneNumber?.[0]}
            />

            <FileUpload
              value={files}
              onChange={setFiles}
              maxFiles={1}
              label="📸 To'lov skrinshotini yuklang *"
            />
          </>
        )}
      </div>
    </PageLayout>
  );
}
