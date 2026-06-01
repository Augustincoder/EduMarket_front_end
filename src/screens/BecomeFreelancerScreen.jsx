import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { onboardingApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useTelegram } from '../hooks/useTelegram';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Dasturlash', 'Dizayn', 'Tarjima', 'SMM', 'Kopirayterlik',
  'Video montaj', 'Buxgalteriya', 'Huquqshunoslik', 'Repetitorlik'
];

export default function BecomeFreelancerScreen() {
  const { updateProfile } = useAuthStore();
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

  return (
    <PageLayout bgClass="bg-slate-50 dark:bg-slate-900" title="Mutaxassis bo'lish">
      <div className="p-4 flex flex-col h-full overflow-y-auto pb-24">
        
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl mb-6">
          <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2">Daromadni boshlang!</h2>
          <p className="text-sm text-indigo-700 dark:text-indigo-400">
            Siz mutaxassis sifatida ro'yxatdan o'tib, platformadagi vazifalarni bajarishingiz va pul ishlashingiz mumkin.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Yo'nalishingiz (Maks 3 ta)
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const isSelected = formData.freelancerCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Mutaxassis sifatidagi bio
            </label>
            <textarea 
              value={formData.freelancerBio}
              onChange={(e) => setFormData({ ...formData, freelancerBio: e.target.value })}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
              placeholder="Tajribangiz va nimalar qila olishingiz haqida yozing..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tajribangiz (yil)
            </label>
            <input 
              type="number"
              value={formData.freelancerExperience}
              onChange={(e) => setFormData({ ...formData, freelancerExperience: e.target.value })}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Masalan, 3"
            />
          </div>
        </div>

        <div className="mt-8">
          <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} loading={loading}>
            Mutaxassis bo'lish
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
