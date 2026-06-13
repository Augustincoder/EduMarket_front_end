// src/app/router.jsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { FullPageSpinner } from '../components/ui/Spinner';
import { useSocket } from '../hooks/useSocket';
import { RoleGuard } from '../components/layout/RoleGuard';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { registerRouter } from './navigation';

import SplashScreen from '../screens/auth/SplashScreen';
import HomeScreen from '../screens/shared/HomeScreen';
import OnboardingContainer from '../screens/auth/onboarding/OnboardingContainer';
import TaskFeedScreen from '../screens/freelancer/TaskFeedScreen';
import MyTasksScreen from '../screens/client/MyTasksScreen';
import ChatListScreen from '../screens/shared/ChatListScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

// Lazy load remaining screens
const TaskDetailScreen  = lazy(() => import('../screens/shared/TaskDetail/TaskDetailScreen'));
const CreateTaskScreen  = lazy(() => import('../screens/client/CreateTaskScreen'));
const BidsScreen        = lazy(() => import('../screens/shared/BidsScreen'));
const ChatScreen        = lazy(() => import('../screens/shared/ChatScreen'));
const EarningsScreen    = lazy(() => import('../screens/freelancer/EarningsScreen'));
const PublicProfileScreen = lazy(() => import('../screens/shared/PublicProfileScreen'));
const BecomeFreelancerScreen = lazy(() => import('../screens/freelancer/BecomeFreelancerScreen'));
const ReportScreen      = lazy(() => import('../screens/shared/ReportScreen'));
const GigsScreen        = lazy(() => import('../screens/shared/GigsScreen'));
const CreateGigScreen   = lazy(() => import('../screens/shared/CreateGigScreen'));
const VipScreen         = lazy(() => import('../screens/shared/VipScreen'));
const LeaderboardScreen = lazy(() => import('../screens/shared/LeaderboardScreen'));
const ReferralsScreen   = lazy(() => import('../screens/shared/ReferralsScreen'));
const NotificationSettingsScreen = lazy(() => import('../screens/shared/NotificationSettingsScreen'));
const NotificationInboxScreen = lazy(() => import('../screens/shared/NotificationInboxScreen'));
const VerificationScreen = lazy(() => import('../screens/shared/VerificationScreen'));
const LearningCompassScreen = lazy(() => import('../screens/freelancer/LearningCompassScreen'));

// Lazy load Admin screens
const AdminLoginScreen  = lazy(() => import('../screens/admin/AdminLoginScreen'));
const AdminLayout       = lazy(() => import('../screens/admin/AdminLayout'));
const AdminDashboard    = lazy(() => import('../screens/admin/AdminDashboard'));
const AdminCategories   = lazy(() => import('../screens/admin/AdminCategories'));
const AdminUsers        = lazy(() => import('../screens/admin/AdminUsers'));
const AdminVipRequests  = lazy(() => import('../screens/admin/AdminVipRequests'));
const AdminComplaints   = lazy(() => import('../screens/admin/AdminComplaints'));
const AdminDisputes     = lazy(() => import('../screens/admin/AdminDisputes'));
const AdminFinancialLedger = lazy(() => import('../screens/admin/AdminFinancialLedger'));
const AdminSettings     = lazy(() => import('../screens/admin/AdminSettings'));
const AdminAuditLogs    = lazy(() => import('../screens/admin/AdminAuditLogs'));
const AdminBroadcast    = lazy(() => import('../screens/admin/AdminBroadcast'));
const AdminContentModerator = lazy(() => import('../screens/admin/AdminContentModerator'));
const AdminVerificationScreen = lazy(() => import('../screens/admin/AdminVerificationScreen'));

function Screen({ element }) {
  return <Suspense fallback={<FullPageSpinner />}>{element}</Suspense>;
}

export function AppRouter() {
  useSocket(); // Automatically connects/disconnects websocket based on token state
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

import { RouteErrorBoundary } from '../components/layout/ErrorBoundary';

const routes = [
  { path: '/',                  element: <SplashScreen />                                },
  { path: '/onboarding',        element: <ProtectedRoute><OnboardingContainer /></ProtectedRoute> },
  { path: '/home',              element: <ProtectedRoute><HomeScreen /></ProtectedRoute> },
  { path: '/tasks',             element: <ProtectedRoute><TaskFeedScreen /></ProtectedRoute> },
  { path: '/my-tasks',          element: <ProtectedRoute><MyTasksScreen /></ProtectedRoute> },
  { path: '/tasks/create',      element: <Screen element={<ProtectedRoute><CreateTaskScreen /></ProtectedRoute>} /> },
  { path: '/tasks/:id',         element: <Screen element={<ProtectedRoute><TaskDetailScreen /></ProtectedRoute>} /> },
  { path: '/tasks/:id/bids',    element: <Screen element={<ProtectedRoute><BidsScreen /></ProtectedRoute>} /> },
  { path: '/chats',             element: <ProtectedRoute><ChatListScreen /></ProtectedRoute> },
  { path: '/chat/:chatRoomId',  element: <Screen element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} /> },
  { path: '/earnings',          element: <Screen element={<RoleGuard require="FREELANCER"><EarningsScreen /></RoleGuard>} /> },
  { path: '/profile',           element: <ProtectedRoute><ProfileScreen /></ProtectedRoute> },
  { path: '/become-freelancer', element: <Screen element={<ProtectedRoute><BecomeFreelancerScreen /></ProtectedRoute>} />},
  { path: '/report',            element: <Screen element={<ProtectedRoute><ReportScreen /></ProtectedRoute>} />          },
  { path: '/profile/:userId',   element: <Screen element={<ProtectedRoute><PublicProfileScreen /></ProtectedRoute>} />   },
  { path: '/gigs',              element: <Screen element={<ProtectedRoute><GigsScreen /></ProtectedRoute>} />            },
  { path: '/gigs/create',       element: <Screen element={<ProtectedRoute><CreateGigScreen /></ProtectedRoute>} />       },
  { path: '/vip',               element: <Screen element={<ProtectedRoute><VipScreen /></ProtectedRoute>} />             },
  { path: '/leaderboard',       element: <Screen element={<ProtectedRoute><LeaderboardScreen /></ProtectedRoute>} />     },
  { path: '/referrals',         element: <Screen element={<ProtectedRoute><ReferralsScreen /></ProtectedRoute>} />       },
  { path: '/notifications',     element: <Screen element={<ProtectedRoute><NotificationInboxScreen /></ProtectedRoute>} /> },
  { path: '/settings/notifications', element: <Screen element={<ProtectedRoute><NotificationSettingsScreen /></ProtectedRoute>} /> },
  { path: '/verification',      element: <Screen element={<ProtectedRoute><VerificationScreen /></ProtectedRoute>} /> },
  { path: '/learning-compass',  element: <Screen element={<ProtectedRoute><LearningCompassScreen /></ProtectedRoute>} /> },
  
  // Admin Routes
  { path: '/adminlog',          element: <Screen element={<AdminLoginScreen />} />       },
  {
    path: '/admin',
    element: <RoleGuard require="ADMIN"><Screen element={<AdminLayout />} /></RoleGuard>,
    children: [
      { path: 'dashboard', element: <Screen element={<AdminDashboard />} /> },
      { path: 'categories', element: <Screen element={<AdminCategories />} /> },
      { path: 'users',     element: <Screen element={<AdminUsers />} /> },
      { path: 'verification', element: <Screen element={<AdminVerificationScreen />} /> },
      { path: 'vip',       element: <Screen element={<AdminVipRequests />} /> },
      { path: 'complaints',element: <Screen element={<AdminComplaints />} /> },
      { path: 'disputes',  element: <Screen element={<AdminDisputes />} /> },
      { path: 'financial', element: <Screen element={<AdminFinancialLedger />} /> },
      { path: 'settings',  element: <Screen element={<AdminSettings />} /> },
      { path: 'audit',     element: <Screen element={<AdminAuditLogs />} /> },
      { path: 'broadcast', element: <Screen element={<AdminBroadcast />} /> },
      { path: 'moderator', element: <Screen element={<AdminContentModerator />} /> },
      { path: '*',         element: <Navigate to="dashboard" replace /> }
    ]
  },
  
  { path: '*',                  element: <Navigate to="/" replace />                    },
].map(route => ({
  ...route,
  errorElement: <RouteErrorBoundary />
}));

const router = createBrowserRouter(routes);
registerRouter(router);

export default AppRouter;
