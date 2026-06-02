// src/screens/GigsScreen.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TextInput } from '../components/forms/TextInput';
import { Button } from '../components/ui/Button';
import { Search, Plus, Clock, TrendingUp } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { PageLayout } from '../components/layout/PageLayout';
import { BottomNav } from '../components/layout/BottomNav';
import { GigCard } from '../components/cards/GigCard';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { gigsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

export default function GigsScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);
  
  const [localSearch, setLocalSearch] = useState('');
  const debouncedSearch = useDebounce(localSearch, 400);
  const [selectedGig, setSelectedGig] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // Tab state: 'MARKET' or 'MY_GIGS' (Only for freelancers)
  const [activeTab, setActiveTab] = useState('MARKET');

  // Infinite Query for Gigs
  const { 
    data: gigsRes, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['gigs', debouncedSearch, activeTab, activeRole],
    queryFn: ({ pageParam = 1 }) => gigsApi.getAll({ 
      query: debouncedSearch,
      page: pageParam,
      limit: 10,
      freelancerId: (activeRole === 'FREELANCER' && activeTab === 'MY_GIGS') ? currentUser?.id : undefined
    }),
    getNextPageParam: (lastPage) => {
      const data = lastPage.data.data;
      if (data.page < data.totalPages) return data.page + 1;
      return undefined;
    }
  });

  const gigs = gigsRes?.pages.flatMap(p => p.data.data.gigs) || [];

  const sentinelRef = useInfiniteScroll(
    useCallback(() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }, [hasNextPage, isFetchingNextPage, fetchNextPage]),
    { enabled: hasNextPage }
  );

  // Order Gig Mutation
  const orderMutation = useMutation({
    mutationFn: (gigId) => gigsApi.order(gigId),
    onSuccess: (res) => {
      toast.success('Xizmat buyurtma qilindi va yangi vazifa ochildi!');
      setIsOrderModalOpen(false);
      setSelectedGig(null);
      
      const newTask = res.data?.data;
      if (newTask?.id) {
        navigate(`/tasks/${newTask.id}`);
      } else {
        navigate('/tasks');
      }
    },
    onError: (err) => {
      toast.error(err.serverMsg || 'Buyurtma berishda xatolik yuz berdi');
    },
  });

  const handleOrderClick = (gig) => {
    setSelectedGig(gig);
    setIsOrderModalOpen(true);
  };

  const confirmOrder = () => {
    if (selectedGig) {
      orderMutation.mutate(selectedGig.id);
    }
  };

  const handleCreateGigClick = () => {
    navigate('/gigs/create');
  };

  return (
    <PageLayout
      header={
        <Header
          title="Xizmatlar"
          rightAction={
            (activeRole === 'FREELANCER' && activeTab === 'MY_GIGS') ? (
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="primary"
                onClick={handleCreateGigClick}
                className="rounded-xl bg-edu-primary/10 text-edu-primary hover:bg-edu-primary/20"
              >
                <Plus className="w-5 h-5" />
              </Button>
            ) : null
          }
        />
      }
      bottomNav={<BottomNav />}
    >
      <div className="flex flex-col gap-4 p-4 pb-nav animate-fade-in">
        
        {/* Role Tabs for Freelancers */}
        {activeRole === 'FREELANCER' && (
          <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl mb-1">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'MARKET' ? 'bg-white dark:bg-slate-700 shadow-sm text-edu-primary' : 'text-slate-500'
              }`}
              onClick={() => setActiveTab('MARKET')}
            >
              Bozor
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'MY_GIGS' ? 'bg-white dark:bg-slate-700 shadow-sm text-edu-primary' : 'text-slate-500'
              }`}
              onClick={() => setActiveTab('MY_GIGS')}
            >
              Mening Xizmatlarim
            </button>
          </div>
        )}

        {/* Banner with modern premium gradient */}
        {(activeRole === 'CLIENT' || activeTab === 'MARKET') && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-edu-primary to-edu-primary-d text-white p-5 shadow-btn">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl translate-x-10 -translate-y-10" />
            <div className="relative z-10 max-w-[80%]">
              <h2 className="text-lg font-bold font-display mb-1">
                {activeRole === 'FREELANCER' ? 'Bozor tahlili va Xizmatlar' : 'Tayyor Xizmatlar'}
              </h2>
              <p className="text-xs text-white/90 leading-relaxed">
                {activeRole === 'FREELANCER' 
                  ? "Boshqalar qanday xizmatlar taklif qilayotganini ko'ring va trendlarni o'rganing."
                  : "Freelancerlar tomonidan taklif etilayotgan tayyor xizmatlarni toping va buyurtma bering."}
              </p>
            </div>
          </div>
        )}

        {/* Analytics for Freelancers in Market */}
        {activeRole === 'FREELANCER' && activeTab === 'MARKET' && (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
            <div className="min-w-[140px] bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex flex-col gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-2xs text-indigo-600 dark:text-indigo-400 font-bold uppercase">Trenddagi toifa</p>
                <p className="text-sm font-black text-indigo-900 dark:text-indigo-100">Dasturlash</p>
              </div>
            </div>
            <div className="min-w-[140px] bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl border border-orange-100 dark:border-orange-800 flex flex-col gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xs text-orange-600 dark:text-orange-400 font-bold uppercase">Eng ko'p qidirilgan</p>
                <p className="text-sm font-black text-orange-900 dark:text-orange-100">Telegram Botlar</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="relative w-full">
          <TextInput
            value={localSearch}
            onValueChange={setLocalSearch}
            placeholder={activeTab === 'MARKET' ? "Xizmatlardan qidirish..." : "O'z xizmatlaringizdan qidirish..."}
            startContent={<Search className="w-4 h-4 text-edu-muted" />}
          />
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          </div>
        ) : gigs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-10 px-4 text-center mt-4">
            <div className="w-24 h-24 mb-4 rounded-full bg-edu-surface flex items-center justify-center shadow-sm border border-edu-border/50">
              <span className="text-4xl animate-bounce">💼</span>
            </div>
            <h3 className="text-lg font-bold text-edu-text mb-2">Xizmatlar topilmadi</h3>
            <p className="text-sm text-edu-muted max-w-[250px] leading-relaxed mb-4">
              {search
                ? "Siz kiritgan so'rov bo'yicha hech qanday xizmat topilmadi."
                : (activeTab === 'MARKET' ? "Hozircha hech qanday xizmat joylashtirilmagan." : "Siz hali hech qanday xizmat yaratmadingiz.")}
            </p>
            {activeTab === 'MY_GIGS' && (
              <Button color="primary" onClick={handleCreateGigClick} className="shadow-btn">
                Xizmat yaratish 🚀
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {gigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} onOrder={handleOrderClick} />
              ))}
            </div>

            <div ref={sentinelRef} className="h-4" />
            {isFetchingNextPage && (
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse mt-4"></div>
            )}
          </>
        )}
      </div>

      {/* Buyurtma Modal */}
      {selectedGig && (
        <Modal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          title="Buyurtmani tasdiqlash"
          footer={
            <div className="flex gap-3 w-full">
              <Button
                variant="flat"
                className="flex-1 rounded-xl h-11 border border-edu-border font-semibold text-edu-muted bg-white"
                onClick={() => setIsOrderModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                color="primary"
                className="flex-1 rounded-xl h-11 text-white bg-edu-primary font-bold shadow-btn"
                onClick={confirmOrder}
                isLoading={orderMutation.isPending}
              >
                Tasdiqlash
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm text-edu-muted">
              Ushbu xizmatni buyurtma qilganingizda, tizimda avtomatik ravishda yangi vazifa yaratiladi va freelancerga biriktiriladi.
            </p>
            <div className="p-3 bg-edu-bg rounded-xl border border-edu-border/50">
              <h4 className="font-bold text-sm text-edu-text mb-1">{selectedGig.title}</h4>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs text-edu-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{selectedGig.deliveryDays} kun yetkazib berish</span>
                </div>
                <span className="font-bold text-md text-edu-primary">
                  {new Intl.NumberFormat('uz-UZ').format(selectedGig.price)} so'm
                </span>
              </div>
            </div>
            {selectedGig.freelancerId === currentUser?.id && (
              <div className="p-2.5 bg-red-500/10 text-red-600 text-xs rounded-xl border border-red-500/20">
                ⚠️ Diqqat: Siz o'z xizmatingizni buyurtma qila olmaysiz.
              </div>
            )}
          </div>
        </Modal>
      )}
    </PageLayout>
  );
}
