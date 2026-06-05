// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:      null,
      token:     null,
      activeRole: 'CLIENT', // 'CLIENT' or 'FREELANCER'
      isLoading: false,

      setAuth: ({ user, token }) => {
        localStorage.setItem('edu_token', token);
        set({ user, token, activeRole: user?.isFreelancer ? 'FREELANCER' : 'CLIENT', isLoading: false });
      },

      updateProfile: (data) =>
        set((s) => ({ user: { ...s.user, ...data } })),

      logout: () => {
        localStorage.removeItem('edu_token');
        set({ user: null, token: null, activeRole: 'CLIENT' });
      },

      setLoading: (v) => set({ isLoading: v }),

      setFreelancerMode: (val) => set((s) => ({ user: { ...s.user, isFreelancer: val }, activeRole: val ? 'FREELANCER' : 'CLIENT' })),
      
      toggleActiveRole: () => set((s) => ({ 
        activeRole: s.activeRole === 'CLIENT' ? (s.user?.isFreelancer ? 'FREELANCER' : 'CLIENT') : 'CLIENT' 
      })),

      completeOnboarding: () => set((s) => ({ user: { ...s.user, isOnboardingComplete: true } })),

      isAuthenticated: () => !!get().token,
      isVip:           () => get().user?.isVip ?? false,
      isClient:        (taskClientId) => get().user?.id === taskClientId,
      isMember:        (task) => {
        const id = get().user?.id;
        return id === task?.clientId || id === task?.freelancerId;
      },
    }),
    {
      name:    'edu_auth',
      partialize: (s) => ({ token: s.token, activeRole: s.activeRole }),
    }
  )
);
