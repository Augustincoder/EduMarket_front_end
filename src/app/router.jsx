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
  { path: '*',                  element: <Navigate to="/" replace />                    },
]);

export function AppRouter() {
  useSocket(); // Automatically connects/disconnects websocket based on token state
  return <RouterProvider router={router} />;
}

export default AppRouter;
