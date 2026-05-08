import { Box, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import BugReportFab from './BugReportFab';
import { useAuth } from '../../../src/context/AuthContext/AuthContext';

const ProtectedRoute = ({ children, requireOnboarding = true }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
  if (!user) return <Navigate to="/login" replace />;

  if (requireOnboarding && !user.is_onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!requireOnboarding && user.is_onboarded) {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      {children}
      <BugReportFab />
    </>
  );
};

export default ProtectedRoute;
