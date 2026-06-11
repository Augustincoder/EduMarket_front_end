// src/hooks/useAuth.js
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import useOnboardingStore from '../store/onboardingStore';
import { useUiStore } from '../store/uiStore';
import { authApi } from '../services/auth.service';
import { usersApi } from '../services/users.service';
import { getInitData } from '../lib/telegram';
import { identifyUser } from '../lib/observability';
import i18n from '../lib/i18n';
import toast from 'react-hot-toast';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setAuth = useAuthStore((s) => s.setAuth);
  const storeLogout = useAuthStore((s) => s.logout);
  const setLoading = useAuthStore((s) => s.setLoading);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const chatDisconnect = useChatStore((s) => s.disconnect);

  // Login via Telegram initData
  const login = useCallback(async (referralCode) => {
    setLoading(true);
    try {
      const initData = getInitData();
      const res = await authApi.login({ initData, referralCode });
      const { user: u, token: t } = res.data.data;
      setAuth({ user: u, token: t });
      identifyUser(u);
      return { success: true, user: u };
    } catch (err) {
      const msg = err.serverMsg || i18n.t('system.auth.loginError');
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading]);

  // Refresh user profile
  const refreshUser = useCallback(async () => {
    try {
      const res = await usersApi.getMe();
      const u = res.data.data;
      updateProfile(u);
      identifyUser(u);
      return u;
    } catch {
      return null;
    }
  }, [updateProfile]);

  // Helper to reset all caches and stores on logout
  const resetAllCachesAndStores = useCallback(() => {
    chatDisconnect();
    storeLogout();
    queryClient.clear();
    useOnboardingStore.getState().reset();

    const uiState = useUiStore.getState();
    uiState.resetFilters();
    uiState.closeSheet();
    uiState.closeSearch();
  }, [chatDisconnect, storeLogout, queryClient]);

  // Logout
  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    resetAllCachesAndStores();
    navigate('/', { replace: true });
  }, [resetAllCachesAndStores, navigate]);

  // Listen for 401 events from axios interceptor
  useEffect(() => {
    const handler = () => {
      resetAllCachesAndStores();
      navigate('/', { replace: true });
      toast.error(i18n.t('system.auth.sessionExpired'));
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [resetAllCachesAndStores, navigate]);

  return { user, token, isLoading, login, logout, refreshUser };
}
