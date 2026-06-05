// src/screens/GigsScreen.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TextInput } from '../../components/forms/TextInput';
import { Button } from '../../components/ui/Button';
import { Search, Plus, Clock, TrendingUp } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { PageLayout } from '../../components/layout/PageLayout';
import { BottomNav } from '../../components/layout/BottomNav';
import { GigCard } from '../../components/cards/GigCard';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { gigsApi } from '../../services/gigs.service';
import { useAuthStore } from '../../store/authStore';
import { useDebounce } from '../../hooks/useDebounce';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { GigCardSkeleton } from '../../components/ui/SkeletonCard';
import { formatPrice } from '../../lib/utils';
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
          right={
            (activeRole === 'FREELANCER' && activeTab === 'MY_GIGS') ? (
              <button
                onClick={handleCreateGigClick}
                className="w-10 h-10 rounded-full bg-edu-primary/10 flex items-center justify-center text-edu-primary active-spring"
              >
                <Plus size={20} />
              </button>
            ) : null
          }
        />
      }
      bottomNav={<BottomNav />}
    >
      <div className="flex flex-col gap-5 p-4 pb-nav animate-fade-in">
        
        {/* Role Tabs for Freelancers */}
        {activeRole === 'FREELANCER' && (
          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-[18px] border border-edu-border/30 mb-1">
            <button
              className={`flex-1 py-2 text-[13px] font-bold rounded-[14px] transition-all active-spring ${
                activeTab === 'MARKET' ? 'bg-edu-surface shadow-ios text-edu-primary' : 'text-edu-muted'
              }`}
              onClick={() => setActiveTab('MARKET')}
            >
              Bozor
            </button>
            <button
              className={`flex-1 py-2 text-[13px] font-bold rounded-[14px] transition-all active-spring ${
                activeTab === 'MY_GIGS' ? 'bg-edu-surface shadow-ios text-edu-primary' : 'text-edu-muted'
              }`}
              onClick={() => setActiveTab('MY_GIGS')}
            >
              Mening Xizmatlarim
            </button>
          </div>
        )}

        {/* Banner with modern premium gradient */}
        {(activeRole === 'CLIENT' || activeTab === 'MARKET') && (
          <div className="relative overflow-hidden squircle bg-gradient-to-br from-edu-primary to-edu-primary-d text-white p-6 shadow-btn border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-10 -translate-y-10" />
            <div className="relative z-10 max-w-[85%]">
              <h2 className="text-xl font-black font-display mb-1 tracking-ios-display">
                {activeRole === 'FREELANCER' ? 'Bozor tahlili' : 'Tayyor Xizmatlar'}
              </h2>
              <p className="text-[13px] text-white/90 leading-relaxed font-medium tracking-ios-text">
                {activeRole === 'FREELANCER' 
                  ? "Boshqalar qanday xizmatlar taklif qilayotganini ko'ring va trendlarni o'rganing."
                  : "Mutaxassislar tomonidan taklif etilayotgan xizmatlarni toping va buyurtma bering."}
              </p>
            </div>
          </div>
        )}

        {/* Analytics for Freelancers in Market */}
        {activeRole === 'FREELANCER' && activeTab === 'MARKET' && (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
            <div className="min-w-[140px] bg-edu-surface-2 p-4 squircle border border-edu-border/30 flex flex-col gap-2">
              <TrendingUp className="w-5 h-5 text-edu-accent" />
              <div>
                <p className="text-[10px] text-edu-muted font-black uppercase tracking-widest">Trenddagi toifa</p>
                <p className="text-[15px] font-black text-edu-text tracking-ios-display">Dasturlash</p>
              </div>
            </div>
            <div className="min-w-[140px] bg-edu-surface-2 p-4 squircle border border-edu-border/30 flex flex-col gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-[10px] text-edu-muted font-black uppercase tracking-widest">Eng ko'p qidirilgan</p>
                <p className="text-[15px] font-black text-edu-text tracking-ios-display">Botlar</p>
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
            containerClassName="h-12 rounded-2xl bg-edu-surface shadow-ios"
          />
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <GigCardSkeleton />
            <GigCardSkeleton />
          </div>
        ) : gigs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-16 px-4 text-center mt-4">
            <div className="w-24 h-24 mb-5 rounded-full bg-edu-surface flex items-center justify-center shadow-ios border border-edu-border/30">
              <span className="text-5xl animate-bounce">💼</span>
            </div>
            <h3 className="text-xl font-black text-edu-text mb-2 font-display">Xizmatlar topilmadi</h3>
            <p className="text-sm text-edu-muted max-w-[260px] leading-relaxed mb-6 font-medium">
              {localSearch
                ? "Siz kiritgan so'rov bo'yicha hech qanday xizmat topilmadi."
                : (activeTab === 'MARKET' ? "Hozircha hech qanday xizmat joylashtirilmagan." : "Siz hali hech qanday xizmat yaratmadingiz.")}
            </p>
            {activeTab === 'MY_GIGS' && (
              <Button variant="primary" size="lg" onClick={handleCreateGigClick} className="shadow-btn px-10">
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
              <div className="py-4 flex justify-center">
                <Spinner size="md" />
              </div>
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
            <div className="flex gap-3 w-full pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsOrderModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                variant="primary"
                className="flex-1 shadow-btn"
                onClick={confirmOrder}
                isLoading={orderMutation.isPending}
              >
                Tasdiqlash
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <p className="text-[14px] text-edu-muted leading-relaxed font-medium">
              Ushbu xizmatni buyurtma qilganingizda, tizimda avtomatik ravishda yangi vazifa yaratiladi va mutaxassisga biriktiriladi.
            </p>
            <div className="p-4 bg-edu-surface-2 rounded-2xl border border-edu-border/40 shadow-inner">
              <h4 className="font-bold text-[15px] text-edu-text mb-2 font-display leading-tight">{selectedGig.title}</h4>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-edu-border/10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-edu-muted">
                  <Clock className="w-4 h-4 text-edu-primary" />
                  <span>{selectedGig.deliveryDays} kun yetkazib berish</span>
                </div>
                <span className="font-black text-lg text-edu-primary tracking-ios-display">
                  {formatPrice(selectedGig.price)} so'm
                </span>
              </div>
            </div>
            {selectedGig.freelancerId === currentUser?.id && (
              <div className="p-3 bg-red-500/10 text-red-600 text-xs rounded-xl border border-red-500/20 font-bold flex items-center gap-2">
                <span>⚠️</span> Siz o'z xizmatingizni buyurtma qila olmaysiz.
              </div>
            )}
          </div>
        </Modal>
      )}
    </PageLayout>
  );
}
