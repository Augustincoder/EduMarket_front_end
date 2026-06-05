// src/screens/HomeScreen.jsx
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ClientHomeScreen from '../client/ClientHomeScreen';
import FreelancerHomeScreen from '../freelancer/FreelancerHomeScreen';
import { PageLayout } from '../../components/layout/PageLayout';
import { requestNotificationPermission } from '../../lib/notifications';

export default function HomeScreen() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user]);

  return (
    <PageLayout bgClass="bg-mesh-aurora">
      {user?.isFreelancer ? <FreelancerHomeScreen /> : <ClientHomeScreen />}
    </PageLayout>
  );
}
