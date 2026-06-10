import { create } from 'zustand';

export const useCreateTaskStore = create((set) => ({
  step: 0,
  category: '',
  title: '',
  description: '',
  priceMin: '',
  priceMax: '',
  isUrgent: false,
  deadline: '',
  files: [],
  targeting: 'public', // public, verified, vip, direct
  targetFreelancerId: null,
  nlpSeverity: 'none',
  meta: {}, // Category-specific metadata
  errors: {},

  setStep: (step) => set({ step, errors: {} }),
  nextStep: () => set((state) => ({ step: state.step + 1, errors: {} })),
  prevStep: () => set((state) => ({ step: Math.max(0, state.step - 1), errors: {} })),

  updateField: (field, value) => set((state) => ({
    [field]: value,
    errors: { ...state.errors, [field]: null }, // clear error when field updates
  })),

  updateMeta: (key, val) => set((state) => ({
    meta: { ...state.meta, [key]: val }
  })),

  setErrors: (errors) => set({ errors }),
  setNlpSeverity: (severity) => set({ nlpSeverity: severity }),

  resetStore: () => set({
    step: 0,
    category: '',
    title: '',
    description: '',
    priceMin: '',
    priceMax: '',
    isUrgent: false,
    deadline: '',
    files: [],
    targeting: 'public',
    targetFreelancerId: null,
    nlpSeverity: 'none',
    meta: {},
    errors: {},
  })
}));
