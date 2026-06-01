import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOnboardingStore = create(
  persist(
    (set) => ({
      step: 1,
      formData: {
        fullname: '',
        username: '',
        bio: '',
        skills: [],
        region: '',
        universityId: null,
        university: '',
        faculty: '',
        studyYear: null,
      },
      
      setStep: (step) => set({ step }),
      
      setFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
      })),
      
      reset: () => set({
        step: 1,
        formData: {
          fullname: '',
          username: '',
          bio: '',
          skills: [],
          region: '',
          universityId: null,
          university: '',
          faculty: '',
          studyYear: null,
        }
      })
    }),
    {
      name: 'edu_onboarding',
    }
  )
);

export default useOnboardingStore;
