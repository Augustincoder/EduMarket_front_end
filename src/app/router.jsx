// src/app/router.jsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { FullPageSpinner } from '../components/ui/Spinner';
import { useSocket } from '../hooks/useSocket';

// Lazy load all screens
const SplashScreen      = lazy(() => import('../screens/SplashScreen'));
const OnboardingContainer = lazy(() => import('../screens/onboarding/OnboardingContainer'));
const HomeScreen        = lazy(() => import('../screens/HomeScreen'));
const TaskFeedScreen    = lazy(() => import('../screens/TaskFeedScreen'));
const MyTasksScreen     = lazy(() => import('../screens/MyTasksScreen'));
const TaskDetailScreen  = lazy(() => import('../screens/TaskDetailScreen'));
const CreateTaskScreen  = lazy(() => import('../screens/CreateTaskScreen'));
const BidsScreen        = lazy(() => import('../screens/BidsScreen'));
const ChatListScreen    = lazy(() => import('../screens/ChatListScreen'));
const ChatScreen        = lazy(() => import('../screens/ChatScreen'));
const EarningsScreen    = lazy(() => import('../screens/EarningsScreen'));
const ProfileScreen     = lazy(() => import('../screens/ProfileScreen'));
const PublicProfileScreen = lazy(() => import('../screens/PublicProfileScreen'));
const BecomeFreelancerScreen = lazy(() => import('../screens/BecomeFreelancerScreen'));
const ReportScreen      = lazy(() => import('../screens/ReportScreen'));
const GigsScreen        = lazy(() => import('../screens/GigsScreen'));
const CreateGigScreen   = lazy(() => import('../screens/CreateGigScreen'));
const VipScreen         = lazy(() => import('../screens/VipScreen'));
const LeaderboardScreen = lazy(() => import('../screens/LeaderboardScreen'));
const ReferralsScreen   = lazy(() => import('../screens/ReferralsScreen'));

// Lazy load Admin screens
const AdminLoginScreen  = lazy(() => import('../screens/admin/AdminLoginScreen'));
const AdminLayout       = lazy(() => import('../screens/admin/AdminLayout'));
const AdminDashboard    = lazy(() => import('../screens/admin/AdminDashboard'));
const AdminUsers        = lazy(() => import('../screens/admin/AdminUsers'));
const AdminVipRequests  = lazy(() => import('../screens/admin/AdminVipRequests'));
const AdminComplaints   = lazy(() => import('../screens/admin/AdminComplaints'));
const AdminDisputes     = lazy(() => import('../screens/admin/AdminDisputes'));
const AdminFinancialLedger = lazy(() => import('../screens/admin/AdminFinancialLedger'));
const AdminSettings     = lazy(() => import('../screens/admin/AdminSettings'));
const AdminAuditLogs    = lazy(() => import('../screens/admin/AdminAuditLogs'));
const AdminBroadcast    = lazy(() => import('../screens/admin/AdminBroadcast'));
const AdminContentModerator = lazy(() => import('../screens/admin/AdminContentModerator'));

function Screen({ element }) {
  return <Suspense fallback={<FullPageSpinner />}>{element}</Suspense>;
}

const router = createBrowserRouter([
  { path: '/',                  element: <Screen element={<SplashScreen />} />           },
  { path: '/onboarding',        element: <Screen element={<OnboardingContainer />} />    },
  { path: '/home',              element: <Screen element={<HomeScreen />} />             },
  { path: '/tasks',             element: <Screen element={<TaskFeedScreen />} />         },
  { path: '/my-tasks',          element: <Screen element={<MyTasksScreen />} />          },
  { path: '/tasks/create',      element: <Screen element={<CreateTaskScreen />} />       },
  { path: '/tasks/:id',         element: <Screen element={<TaskDetailScreen />} />       },
  { path: '/tasks/:id/bids',    element: <Screen element={<BidsScreen />} />            },
  { path: '/chats',             element: <Screen element={<ChatListScreen />} />        },
  { path: '/tasks/:id/chat',    element: <Screen element={<ChatScreen />} />            },
  { path: '/earnings',          element: <Screen element={<EarningsScreen />} />        },
  { path: '/profile',           element: <Screen element={<ProfileScreen />} />         },
  { path: '/become-freelancer', element: <Screen element={<BecomeFreelancerScreen />} />},
  { path: '/report',            element: <Screen element={<ReportScreen />} />          },
  { path: '/profile/:userId',   element: <Screen element={<PublicProfileScreen />} />   },
  { path: '/gigs',              element: <Screen element={<GigsScreen />} />            },
  { path: '/gigs/create',       element: <Screen element={<CreateGigScreen />} />       },
  { path: '/vip',               element: <Screen element={<VipScreen />} />             },
  { path: '/leaderboard',       element: <Screen element={<LeaderboardScreen />} />     },
  { path: '/referrals',         element: <Screen element={<ReferralsScreen />} />       },
  
  // Admin Routes
  { path: '/adminlog',          element: <Screen element={<AdminLoginScreen />} />       },
  {
    path: '/admin',
    element: <Screen element={<AdminLayout />} />,
    children: [
      { path: 'dashboard', element: <Screen element={<AdminDashboard />} /> },
      { path: 'users',     element: <Screen element={<AdminUsers />} /> },
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
]);

import { ErrorBoundary } from '../components/layout/ErrorBoundary';

export function AppRouter() {
  useSocket(); // Automatically connects/disconnects websocket based on token state
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default AppRouter;
