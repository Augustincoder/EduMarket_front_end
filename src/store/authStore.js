// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/auth.service';
import { usersApi } from '../services/users.service';

// Only the minimal fields the route guards need are persisted between sessions.
// The full profile is re-fetched on boot via checkTokenStatus().
const pickGuardFields = (user) =>
  user
    ? {
        id: user.id,
        role: user.role,
        isFreelancer: user.isFreelancer,
        isVip: user.isVip,
        isOnboardingComplete: user.isOnboardingComplete,
        completedTasksCount: user.completedTasksCount,
      }
    : null;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:      null,
      token:     null,
      activeRole: 'CLIENT', // 'CLIENT' or 'FREELANCER'
      isSwitching: false,
      isLoading: false,

      setAuth: ({ user, token }) => {
        set({ user, token, activeRole: user?.isFreelancer ? 'FREELANCER' : 'CLIENT', isLoading: false });
      },

      updateProfile: (data) =>
        set((s) => ({ user: { ...s.user, ...data } })),

      // Validates the persisted session on app boot and refreshes the profile.
      // A 401 is handled globally by the axios interceptor (auth:logout event).
      checkTokenStatus: async () => {
        if (!get().token) return;
        try {
          const res = await usersApi.getMe();
          const fresh = res.data.data;
          set((s) => ({ user: { ...s.user, ...fresh } }));
        } catch {
          // Network errors: keep the persisted session; a 401 triggers global logout.
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout failed:', error);
        } finally {
          set({ user: null, token: null, activeRole: 'CLIENT', isLoading: false });
        }
      },

      setLoading: (v) => set({ isLoading: v }),

      setFreelancerMode: (val) => set((s) => ({ user: { ...s.user, isFreelancer: val }, activeRole: val ? 'FREELANCER' : 'CLIENT' })),

      toggleActiveRole: () => {
        set((s) => ({
          activeRole: s.activeRole === 'CLIENT' ? (s.user?.isFreelancer ? 'FREELANCER' : 'CLIENT') : 'CLIENT',
        }));
      },

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
      name: 'edu_auth',
      partialize: (s) => ({
        token: s.token,
        activeRole: s.activeRole,
        user: pickGuardFields(s.user),
      }),
    }
  )
);
