import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import useOnboardingStore from '../../../store/onboardingStore';
import { useTelegram } from '../../../hooks/useTelegram';
import { Button } from '../../../components/ui/Button';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { onboardingApi } from '../../../services/users.service';
import { useAuthStore } from '../../../store/authStore';
import Spinner from '../../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function OnboardingStep3() {
  const formData = useOnboardingStore((s) => s.formData);
  const setFormData = useOnboardingStore((s) => s.setFormData);
  const setStep = useOnboardingStore((s) => s.setStep);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { HapticFeedback } = useTelegram();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch universities list from backend
  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['universities'],
    queryFn: () => onboardingApi.getUniversities().then((res) => res.data.data),
    staleTime: Infinity, // List of universities is static/changes very rarely
  });

  // Filter universities based on search query
  const filteredUniversities = useMemo(() => {
    if (!searchQuery.trim()) {
      return universities.slice(0, 30); // Show first 30 by default when query is empty
    }
    const query = searchQuery.toLowerCase();
    return universities
      .filter((u) => u.name.toLowerCase().includes(query))
      .slice(0, 30); // Limit to top 30 matches for rendering performance
  }, [universities, searchQuery]);

  const handleFinish = async () => {
    HapticFeedback.impactOccurred('medium');
    setLoading(true);
    try {
      const res = await onboardingApi.complete(formData);
      updateProfile({ ...res.data.data.user, isOnboardingComplete: true });
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      navigate('/home', { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.serverMsg || "Xatolik yuz berdi");
      HapticFeedback.notificationOccurred('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUniversity = (unv) => {
    HapticFeedback.impactOccurred('light');
    setFormData({
      universityId: unv.id,
      university: unv.name,
    });
    setIsSheetOpen(false);
    setSearchQuery('');
  };

  const handleClearUniversity = (e) => {
    e.stopPropagation();
    HapticFeedback.impactOccurred('light');
    setFormData({
      universityId: null,
      university: '',
    });
  };

  return (
    <div className="flex flex-col h-full bg-edu-bg p-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-edu-text mb-2">Ta'lim</h1>
        <p className="text-edu-muted mb-6">Talaba ekanligingizni bildiruvchi ma'lumotlar (Ixtiyoriy)</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-edu-text-2 mb-1">Viloyat / Hudud</label>
            <input 
              type="text"
              value={formData.region || ''}
              onChange={(e) => setFormData({ region: e.target.value })}
              className="w-full bg-edu-surface border border-edu-border rounded-xl px-4 py-3 text-edu-text focus:outline-none focus:ring-2 focus:ring-edu-primary/20 focus:border-edu-primary shadow-sm transition-colors"
              placeholder="Masalan, Toshkent sh."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-edu-text-2 mb-1">Oliy ta'lim muassasasi</label>
            <div 
              onClick={() => {
                HapticFeedback.impactOccurred('light');
                setIsSheetOpen(true);
              }}
              className="w-full bg-edu-surface border border-edu-border rounded-xl px-4 py-3 text-edu-text focus:outline-none focus:ring-2 focus:ring-edu-primary/20 focus:border-edu-primary flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] shadow-sm"
            >
              <span className={`truncate ${formData.university ? 'text-edu-text' : 'text-edu-muted'}`}>
                {formData.university || "Universitetni tanlang"}
              </span>
              <div className="flex items-center gap-2">
                {formData.university && (
                  <button 
                    onClick={handleClearUniversity}
                    className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <X size={16} className="text-edu-muted hover:text-edu-text" />
                  </button>
                )}
                <ChevronDown size={18} className="text-edu-muted" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-edu-text-2 mb-1">Fakultet</label>
            <input 
              type="text"
              value={formData.faculty || ''}
              onChange={(e) => setFormData({ faculty: e.target.value })}
              className="w-full bg-edu-surface border border-edu-border rounded-xl px-4 py-3 text-edu-text focus:outline-none focus:ring-2 focus:ring-edu-primary/20 focus:border-edu-primary shadow-sm transition-colors"
              placeholder="Masalan, Amaliy matematika"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-edu-text-2 mb-1">O'qish bosqichi (Kurs)</label>
            <select 
              value={formData.studyYear || ''}
              onChange={(e) => setFormData({ studyYear: e.target.value })}
              className="w-full bg-edu-surface border border-edu-border rounded-xl px-4 py-3 text-edu-text focus:outline-none focus:ring-2 focus:ring-edu-primary/20 focus:border-edu-primary shadow-sm transition-colors"
            >
              <option value="">Tanlang</option>
              <option value="1">1-kurs</option>
              <option value="2">2-kurs</option>
              <option value="3">3-kurs</option>
              <option value="4">4-kurs</option>
              <option value="5">Magistratura</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 pb-6 flex gap-3">
        <Button variant="outline" className="w-1/3 rounded-xl h-12 font-bold border-edu-border" onClick={() => setStep(2)} disabled={loading}>Orqaga</Button>
        <Button variant="primary" className="w-2/3 rounded-xl h-12 font-bold shadow-btn" onClick={handleFinish} isLoading={loading}>Yakunlash</Button>
      </div>

      {/* University Selection Bottom Sheet */}
      <BottomSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        title="Universitetni tanlang"
        fullHeight={true}
      >
        <div className="flex flex-col h-full space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-edu-muted" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Universitet nomini yozing..."
              className="w-full bg-edu-surface-2 border-0 rounded-xl pl-10 pr-4 py-3.5 text-sm text-edu-text placeholder-edu-muted focus:outline-none focus:ring-2 focus:ring-edu-primary/20 focus:border-edu-primary"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-edu-border text-edu-muted hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* List content */}
          <div className="flex-1 overflow-y-auto min-h-[300px] pb-8 pr-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Spinner size="lg" />
                <p className="text-sm text-edu-muted">Yuklanmoqda...</p>
              </div>
            ) : filteredUniversities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-edu-muted">Universitet topilmadi</p>
              </div>
            ) : (
              <div className="divide-y divide-edu-border-2">
                {filteredUniversities.map((unv) => {
                  const isSelected = formData.universityId === unv.id;
                  return (
                    <button
                      key={unv.id}
                      onClick={() => handleSelectUniversity(unv)}
                      className="w-full text-left py-4 px-2 flex items-center justify-between text-sm text-edu-text hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <span className={`pr-4 ${isSelected ? 'font-semibold text-edu-primary' : ''}`}>
                        {unv.name}
                      </span>
                      {isSelected && (
                        <Check size={18} className="text-edu-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
