import { useState } from 'react';
import useOnboardingStore from '../../../store/onboardingStore';
import { useTelegram } from '../../../hooks/useTelegram';
import { Button } from '../../../components/ui/Button';

const SKILLS_LIST = [
  'Matematika', 'Fizika', 'Dasturlash', 'Ingliz tili', 'Rus tili',
  'Tarix', 'Kimyo', 'Biologiya', 'Dizayn', 'Kopirayterlik',
  'Tarjima', 'SMM', 'Buxgalteriya', 'Huquq'
];

export default function OnboardingStep2() {
  const formData = useOnboardingStore((s) => s.formData);
  const setFormData = useOnboardingStore((s) => s.setFormData);
  const setStep = useOnboardingStore((s) => s.setStep);
  const { HapticFeedback } = useTelegram();

  const toggleSkill = (skill) => {
    HapticFeedback.impactOccurred('light');
    const current = formData.skills || [];
    if (current.includes(skill)) {
      setFormData({ skills: current.filter(s => s !== skill) });
    } else {
      if (current.length >= 5) return; // Max 5 skills
      setFormData({ skills: [...current, skill] });
    }
  };

  const handleNext = () => {
    HapticFeedback.impactOccurred('light');
    setStep(3);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Qobiliyatlar</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Siz qaysi sohalarda yordam bera olasiz? (Maksimum 5 ta)</p>

        <div className="flex flex-wrap gap-3">
          {SKILLS_LIST.map((skill) => {
            const isSelected = formData.skills?.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 pb-6 flex gap-3">
        <Button variant="outline" className="w-1/3" onClick={() => setStep(1)}>Orqaga</Button>
        <Button variant="primary" className="w-2/3" onClick={handleNext}>Keyingisi</Button>
      </div>
    </div>
  );
}
