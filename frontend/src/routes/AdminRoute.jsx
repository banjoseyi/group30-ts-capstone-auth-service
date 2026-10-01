import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute
 *
 * - While auth is bootstrapping → show loading.
 * - If not authenticated → redirect to /login.
 * - If authenticated but not admin → redirect to /dashboard (UX guard only).
 * - Otherwise → render the admin child route.
 *
 * Note: the backend independently enforces admin access.
 * This frontend check is for navigation UX only.
 */
export default function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
