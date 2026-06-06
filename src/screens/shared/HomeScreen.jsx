// src/screens/HomeScreen.jsx
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ClientHomeScreen from '../client/ClientHomeScreen';
import FreelancerHomeScreen from '../freelancer/FreelancerHomeScreen';
import { PageLayout } from '../../components/layout/PageLayout';
import { requestNotificationPermission } from '../../lib/notifications';

import { useAuthStore } from '../../store/authStore';
import { LivePulseFeed } from '../../components/layout/LivePulseFeed';

export default function HomeScreen() {
  const { user } = useAuth();
  const activeRole = useAuthStore((s) => s.activeRole);

  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user]);

  return (
    <PageLayout bgClass="bg-mesh-aurora">
      <LivePulseFeed />
      {activeRole === 'FREELANCER' ? <FreelancerHomeScreen /> : <ClientHomeScreen />}
    </PageLayout>
  );
}
