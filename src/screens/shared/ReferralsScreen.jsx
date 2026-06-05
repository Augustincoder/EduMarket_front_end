import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../services/users.service';
import PageLayout from '../../components/layout/PageLayout';
import Header from '../../components/layout/Header';
import { Users, Copy, Check, Gift, Coins } from 'lucide-react';
import { useTelegram } from '../../hooks/useTelegram';
import { formatPrice } from '../../lib/constants';

export default function ReferralsScreen() {
  const { copyToClipboard } = useTelegram();
  const [copied, setCopied] = React.useState(false);

  const { data: referralsData, isLoading } = useQuery({
    queryKey: ['myReferrals'],
    queryFn: async () => {
      const res = await usersApi.getMyReferrals();
      return res.data.data;
    }
  });

  const handleCopy = () => {
    if (referralsData?.referralCode) {
      const botName = import.meta.env.VITE_BOT_NAME || 'edumarket_bot';
      const link = `https://t.me/${botName}?start=ref_${referralsData.referralCode}`;
      copyToClipboard(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <PageLayout
      header={
        <Header 
          title="Taklif va Bonuslar" 
          showBack={true}
        />
      }
    >
      <div className="p-4 space-y-6 pb-24">
        
        {/* Banner */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Gift size={100} />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-extrabold mb-2">Do'stlarni taklif qiling!</h2>
            <p className="text-sm text-indigo-100 mb-6">
              Siz taklif qilgan har bir do'stingiz o'zining ilk buyurtmasini yakunlaganda, siz uning foydasidan 5% bonus (Cashback) olasiz!
            </p>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/20">
              <div>
                <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">Sizning taklif havolangiz</p>
                <p className="font-mono text-sm">{referralsData?.referralCode || 'Yuklanmoqda...'}</p>
              </div>
              <button 
                onClick={handleCopy}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                {copied ? <Check size={18} className="text-green-300" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600 mb-3">
              <Users size={24} />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : referralsData?.totalReferrals || 0}
            </p>
            <p className="text-xs font-bold text-slate-500 uppercase mt-1">Taklif qilinganlar</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 mb-3">
              <Coins size={24} />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : formatPrice(referralsData?.referralEarned || 0)}
            </p>
            <p className="text-xs font-bold text-slate-500 uppercase mt-1">Ishlangan Bonus</p>
          </div>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Taklif qilingan do'stlar</h3>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">Yuklanmoqda...</div>
            ) : referralsData?.referredUsers?.length > 0 ? (
              referralsData.referredUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-lg font-bold text-slate-400">
                    {user.fullname?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{user.fullname}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('uz-UZ')} da qo'shildi
                    </p>
                  </div>
                  {user.isFreelancer ? (
                    <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-[10px] font-bold rounded-lg uppercase">
                      Freelancer
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-lg uppercase">
                      Mijoz
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3">
                  <Users size={32} />
                </div>
                <p className="font-bold text-slate-900 dark:text-white mb-1">Hozircha hech kim yo'q</p>
                <p className="text-xs text-slate-500">Yuqoridagi havolani do'stlaringizga yuboring</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
