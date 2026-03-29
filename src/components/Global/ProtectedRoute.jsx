import { CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../src/context/AuthContext/AuthContext';

const ProtectedRoute = ({ children, requireOnboarding = true }) => {
  const { user, loading } = useAuth();

  if (loading) return <CircularProgress />;
  if (!user) return <Navigate to="/login" replace />;

  if (requireOnboarding && !user.is_onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!requireOnboarding && user.is_onboarded) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;