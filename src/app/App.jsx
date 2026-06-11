// src/app/App.jsx
import { useEffect } from 'react';
import { AppRouter } from './router';
import { Providers } from './providers';
import { WorkspaceOverlay } from '../components/ui/WorkspaceOverlay';
import { NetworkBanner } from '../components/ui/NetworkBanner';
import { useCategoryStore } from '../store/categoryStore';
import { useAuthStore } from '../store/authStore';
import { Analytics } from '@vercel/analytics/react';

import { useChatStore } from '../store/chatStore';

export default function App() {
  const checkTokenStatus = useAuthStore((state) => state.checkTokenStatus);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    checkTokenStatus();
    fetchCategories();
  }, [checkTokenStatus, fetchCategories]);

  useEffect(() => {
    if (isAuthenticated()) {
      const token = useAuthStore.getState().token;
      if (token) {
        useChatStore.getState().connect(token);
      }
      loadConversations().catch(() => {});
    }
  }, [isAuthenticated, loadConversations]);

  return (
    <Providers>
      <NetworkBanner />
      <AppRouter />
      <WorkspaceOverlay />
      <Analytics />
    </Providers>
  );
}
