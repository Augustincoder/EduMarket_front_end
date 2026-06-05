// src/components/layout/RoleGuard.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Guard component to restrict access based on user role or other criteria.
 * @param {string} require - 'auth' | 'ADMIN' | 'FREELANCER' | 'CLIENT' | 'VIP'
 */
export function RoleGuard({ children, require = 'auth' }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (require === 'ADMIN' && user.role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  if (require === 'FREELANCER' && !user.isFreelancer) {
    return <Navigate to="/become-freelancer" replace />;
  }

  if (require === 'VIP' && !user.isVip) {
    return <Navigate to="/vip" replace />;
  }

  return children;
}

export default RoleGuard;
