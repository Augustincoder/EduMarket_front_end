// src/app/App.jsx
import { useEffect } from 'react';
import { AppRouter } from './router';
import { Providers } from './providers';
import { WorkspaceOverlay } from '../components/ui/WorkspaceOverlay';
import { NetworkBanner } from '../components/ui/NetworkBanner';
import { useCategoryStore } from '../store/categoryStore';
import { useAuthStore } from '../store/authStore';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const checkTokenStatus = useAuthStore((state) => state.checkTokenStatus);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  useEffect(() => {
    checkTokenStatus();
    fetchCategories();
  }, [checkTokenStatus, fetchCategories]);

  return (
    <Providers>
      <NetworkBanner />
      <AppRouter />
      <WorkspaceOverlay />
      <Analytics />
    </Providers>
  );
}
