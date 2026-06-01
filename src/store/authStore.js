// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:      null,
      token:     null,
      isLoading: false,

      setAuth: ({ user, token }) => {
        localStorage.setItem('edu_token', token);
        set({ user, token, isLoading: false });
      },

      updateProfile: (data) =>
        set((s) => ({ user: { ...s.user, ...data } })),

      logout: () => {
        localStorage.removeItem('edu_token');
        set({ user: null, token: null });
      },

      setLoading: (v) => set({ isLoading: v }),

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
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);
