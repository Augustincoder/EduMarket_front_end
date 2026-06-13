import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { onboardingApi } from '../../services/users.service';
import { useAuthStore } from '../../store/authStore';
import { useTelegram } from '../../hooks/useTelegram';
import { useMainButton } from '../../hooks/useMainButton';
import toast from 'react-hot-toast';

import { useCategoryStore } from '../../store/categoryStore';

export default function BecomeFreelancerScreen() {
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const navigate = useNavigate();
  const { HapticFeedback } = useTelegram();

  const [formData, setFormData] = useState({
    freelancerCategories: [],
    freelancerBio: '',
    freelancerExperience: '',
  });
  const [loading, setLoading] = useState(false);

  const toggleCategory = (cat) => {
    HapticFeedback.impactOccurred('light');
    const current = formData.freelancerCategories;
    if (current.includes(cat)) {
      setFormData({ ...formData, freelancerCategories: current.filter(c => c !== cat) });
    } else {
      if (current.length >= 3) return toast.error("Maksimum 3 ta kategoriya tanlash mumkin");
      setFormData({ ...formData, freelancerCategories: [...current, cat] });
    }
  };

  const handleSubmit = async () => {
    if (formData.freelancerCategories.length === 0) {
      return toast.error("Kamida 1 ta kategoriya tanlang");
    }
    
    setLoading(true);
    try {
      HapticFeedback.impactOccurred('medium');
      const res = await onboardingApi.becomeFreelancer(formData);
      updateProfile(res.data.data.user);
      toast.success("Tabriklaymiz! Siz endi mutaxassissiz.");
      navigate('/home', { replace: true });
    } catch (err) {
      toast.error(err.serverMsg || "Xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useMainButton({
    text: 'Mutaxassis bo\'lish',
    onClick: handleSubmit,
    isLoading: loading,
    disabled: formData.freelancerCategories.length === 0,
  }, [formData, loading]);

  return (
    <PageLayout title="Mutaxassis bo'lish">
      <div className="p-4 flex flex-col h-full overflow-y-auto pb-24">
        
        <div className="bg-edu-accent/10 p-5 rounded-xl mb-6 border border-edu-accent/20">
          <h2 className="text-lg font-bold text-edu-accent mb-2">Daromadni boshlang!</h2>
          <p className="text-sm text-edu-text opacity-80">
            Siz mutaxassis sifatida ro'yxatdan o'tib, platformadagi vazifalarni bajarishingiz va pul ishlashingiz mumkin.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-edu-text mb-2 opacity-80">
              Yo'nalishingiz (Maks 3 ta)
            </label>
            <div className="flex flex-wrap gap-2">
              {useCategoryStore.getState().categories.map(catObj => {
                const cat = catObj.value;
                const isSelected = formData.freelancerCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all border active:scale-95 duration-[120ms] ${
                      isSelected 
                        ? 'bg-edu-primary text-white border-edu-primary shadow-btn' 
                        : 'bg-edu-surface text-edu-muted border-edu-border'
                    }`}
                  >
                    {catObj.emoji} {catObj.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-edu-text mb-1 opacity-80">
              Mutaxassis sifatidagi bio
            </label>
            <textarea 
              value={formData.freelancerBio}
              onChange={(e) => setFormData({ ...formData, freelancerBio: e.target.value })}
              className="w-full bg-edu-surface border border-edu-border rounded-xl px-4 py-3 text-edu-text focus:outline-none focus:ring-2 focus:ring-edu-primary min-h-[100px]"
              placeholder="Tajribangiz va nimalar qila olishingiz haqida yozing..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-edu-text mb-1 opacity-80">
              Tajribangiz (yil)
            </label>
            <input 
              type="number"
              value={formData.freelancerExperience}
              onChange={(e) => setFormData({ ...formData, freelancerExperience: e.target.value })}
              className="w-full bg-edu-surface border border-edu-border rounded-xl px-4 py-3 text-edu-text focus:outline-none focus:ring-2 focus:ring-edu-primary"
              placeholder="Masalan, 3"
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
