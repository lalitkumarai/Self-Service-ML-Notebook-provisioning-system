import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import PageLoader from './PageLoader';

const PrivateRoute = ({ adminOnly = false }) => {
  const { user, loading } = useAuth();

  // Show branded loading screen while auth state resolves
  if (loading) {
    return <PageLoader message="Authenticating…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
