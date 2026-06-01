// src/screens/HomeScreen.jsx
import { useAuth } from '../hooks/useAuth';
import ClientHomeScreen from './ClientHomeScreen';
import FreelancerHomeScreen from './FreelancerHomeScreen';
import { PageLayout } from '../components/layout/PageLayout';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <PageLayout bgClass="bg-mesh-aurora">
      {user?.isFreelancer ? <FreelancerHomeScreen /> : <ClientHomeScreen />}
    </PageLayout>
  );
}
