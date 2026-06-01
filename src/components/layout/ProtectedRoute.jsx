// src/components/layout/ProtectedRoute.jsx
import { Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute({ children, require: req = 'auth', task }) {
  const { user, token } = useAuthStore();

  // Not logged in at all
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // VIP or completed tasks >= 3
  if (req === 'vip_or_experienced') {
    const hasAccess = user.isVip || (user.completedTasksCount ?? 0) >= 3;
    if (!hasAccess) return <Navigate to="/vip" replace />;
  }

  // Client only (task owner)
  if (req === 'client_only' && task) {
    if (user.id !== task.clientId) return <Navigate to={`/tasks/${task.id}`} replace />;
  }

  // Member only (client OR freelancer)
  if (req === 'member_only' && task) {
    const isMember = user.id === task.clientId || user.id === task.freelancerId;
    if (!isMember) return <Navigate to={`/tasks/${task.id}`} replace />;
  }

  return children;
}

export default ProtectedRoute;
