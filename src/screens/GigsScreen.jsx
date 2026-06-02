// src/screens/GigsScreen.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TextInput } from '../components/forms/TextInput';
import { Button } from '../components/ui/Button';
import { Search, Plus, ShoppingBag, Clock, User } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { PageLayout } from '../components/layout/PageLayout';
import { BottomNav } from '../components/layout/BottomNav';
import { GigCard } from '../components/cards/GigCard';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { gigsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function GigsScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  
  const [search, setSearch] = useState('');
  const [selectedGig, setSelectedGig] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // Tab state: 'MARKET' or 'MY_GIGS'
  const [activeTab, setActiveTab] = useState('MARKET');

  // Fetch Gigs based on tab
  const { data: gigsRes, isLoading, refetch } = useQuery({
    queryKey: ['gigs', search, activeTab],
    queryFn: () => gigsApi.getAll({ 
      query: search,
      freelancerId: activeTab === 'MY_GIGS' ? currentUser?.id : undefined
    }),
  });

  const gigs = gigsRes?.data?.data?.gigs || [];

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
            currentUser?.isFreelancer ? (
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
        {currentUser?.isFreelancer && (
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
        {activeTab === 'MARKET' && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-edu-primary to-edu-primary-d text-white p-5 shadow-btn">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl translate-x-10 -translate-y-10" />
            <div className="relative z-10 max-w-[80%]">
              <h2 className="text-lg font-bold font-display mb-1">Tayyor Xizmatlar</h2>
              <p className="text-xs text-white/90 leading-relaxed">
                Freelancerlar tomonidan taklif etilayotgan tayyor xizmatlarni toping va buyurtma bering.
              </p>
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="relative w-full">
          <TextInput
            value={search}
            onValueChange={setSearch}
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
          <div className="grid grid-cols-1 gap-4">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} onOrder={handleOrderClick} />
            ))}
          </div>
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
