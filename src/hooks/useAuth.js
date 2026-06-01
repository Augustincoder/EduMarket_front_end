// src/hooks/useAuth.js
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { authApi, usersApi } from '../services/api';
import { getInitData } from '../lib/telegram';
import toast from 'react-hot-toast';

export function useAuth() {
  const navigate = useNavigate();
  const { user, token, isLoading, setAuth, logout: storeLogout, setLoading, updateProfile } = useAuthStore();
  const chatDisconnect = useChatStore((s) => s.disconnect);

  // Login via Telegram initData
  const login = useCallback(async (referralCode) => {
    setLoading(true);
    try {
      const initData = getInitData();
      const res = await authApi.login({ initData, referralCode });
      const { user: u, token: t } = res.data.data;
      setAuth({ user: u, token: t });
      return { success: true, user: u };
    } catch (err) {
      const msg = err.serverMsg || 'Kirish xatoligi yuz berdi';
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
      updateProfile(res.data.data);
    } catch (_) { /* silent */ }
  }, [updateProfile]);

  // Logout
  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch (_) {}
    chatDisconnect();
    storeLogout();
    navigate('/', { replace: true });
  }, [chatDisconnect, storeLogout, navigate]);

  // Listen for 401 events from axios interceptor
  useEffect(() => {
    const handler = () => {
      storeLogout();
      navigate('/', { replace: true });
      toast.error('Sessiya muddati tugadi. Qayta kirish kerak.');
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [storeLogout, navigate]);

  return { user, token, isLoading, login, logout, refreshUser };
}
