// src/app/providers.jsx
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { initNotifications } from '../lib/notifications';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

const handleGlobalError = (error) => {
  if (error?.statusCode === 401) return; // handled by interceptor
  const msg = error?.serverMsg || error?.response?.data?.message || error?.message || 'Tizimda xatolik yuz berdi';
  // Use msg as id to prevent duplicate toasts if local onError also fires
  toast.error(msg, { id: msg });
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleGlobalError,
  }),
  mutationCache: new MutationCache({
    onError: handleGlobalError,
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function Providers({ children }) {
  const theme = useThemeStore((s) => s.theme);
  const activeRole = useAuthStore((s) => s.activeRole);

  useEffect(() => {
    initKeepAlive();
    initNotifications();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'workspace-client', 'workspace-freelancer');

    if (activeRole === 'FREELANCER') {
      root.classList.add('workspace-freelancer');
    } else {
      root.classList.add('workspace-client');
    }

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (useThemeStore.getState().theme === 'system') {
          root.classList.remove('light', 'dark');
          root.classList.add(e.matches ? 'dark' : 'light');
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.classList.add(theme);
    }
  }, [theme, activeRole]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background:   'var(--edu-surface)',
            color:        'var(--edu-text)',
            borderRadius: '14px',
            border:       '1px solid var(--edu-border)',
            boxShadow:    '0 4px 24px rgba(0,0,0,0.12)',
            fontSize:     '14px',
            fontFamily:   'var(--font-body)',
            fontWeight:   500,
            maxWidth:     '380px',
            padding:      '12px 16px',
          },
          success: {
            iconTheme: { primary: 'var(--edu-primary)', secondary: 'var(--edu-surface)' },
            style: { borderLeft: '3px solid var(--edu-primary)' },
          },
          error: {
            iconTheme: { primary: 'var(--edu-urgent)', secondary: 'var(--edu-surface)' },
            style: { borderLeft: '3px solid var(--edu-urgent)' },
            duration: 5000,
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default Providers;
