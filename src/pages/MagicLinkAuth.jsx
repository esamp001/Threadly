import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiRequest from '../config/api';
import { useAuth } from '../context/AuthContext/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';

/**
 * Magic Link Authentication Page
 * Handles verification of email magic links and automatic login
 * 
 * This page is accessed when user clicks the magic link from their email
 * It automatically verifies the token and logs the user in
 */

const MagicLinkAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyMagicLink = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('No magic link token found');
        setLoading(false);
        return;
      }

      try {
        // Call backend to verify the magic link
        console.log('Sending magic link verification request...');
        const response = await apiRequest('/api/auth/magic-link/verify', {
          method: 'POST',
          body: JSON.stringify({ token })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        let responseData;
        try {
          responseData = await response.json();
          console.log('Response data parsed successfully:', responseData);
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError);
          console.log('Response text:', await response.text());
          throw new Error('Failed to parse server response');
        }

        if (!response.ok) {
          throw new Error(responseData.error || 'An error occurred during verification');
        }

        const { token: sessionToken, userData, isNewUser } = responseData;

        // Log the user in
        login(userData, sessionToken);

        setSuccess(true);
        setLoading(false);

        // Show success message
        showSnackbar('Successfully logged in!', 'success');

        // Redirect after a short delay
        setTimeout(() => {
          if (isNewUser) {
            navigate('/onboarding');
          } else {
            navigate('/home');
          }
        }, 1500);

      } catch (error) {
        console.error('Magic link verification error:', error);
        setError(error.message || 'Invalid or expired magic link');
        setLoading(false);
        showSnackbar(error.message || 'Invalid or expired magic link', 'error');
      }
    };

    verifyMagicLink();
  }, [searchParams, login, navigate, showSnackbar]);

  const handleGoBack = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3
      }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
          Verifying Magic Link...
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          Please wait while we authenticate your account
        </Typography>
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
            Login Successful!
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
            You're now logged in
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Redirecting you to Space...
          </Typography>
          <CircularProgress size={24} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3
      }}>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h4" sx={{ mb: 2, color: 'error.main' }}>
            ❌ Authentication Failed
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
            {error}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            The magic link may have expired or is invalid. Please request a new one.
          </Typography>
          <Button
            variant="contained"
            onClick={handleGoBack}
            sx={{ px: 4 }}
          >
            Back to Login
          </Button>
        </Box>
      </Box>
    );
  }

  return null;
};

export default MagicLinkAuth;
