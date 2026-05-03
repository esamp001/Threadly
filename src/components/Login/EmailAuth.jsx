import EmailIcon from '@mui/icons-material/Email';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import apiRequest from '../../config/api';

/**
 * Email Sign-In Link Authentication Component
 * Handles email input and sends sign-in link for passwordless authentication
 * 
 * Features:
 * - Email validation
 * - Sign-in link request
 * - Loading states and error handling
 * - Completely free authentication
 */

const EmailAuth = ({ onEmailAuthSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  /**
   * Validates email format
   * Basic email validation for common formats
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Sends sign-in link to user's email
   * Calls backend API to generate and send authentication link
   */
  const handleSendMagicLink = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call backend to send sign-in link
      const response = await apiRequest('/api/auth/magic-link', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send sign-in link');
      }

      setSuccess(true);
      setLoading(false);

      // Show success message
      onEmailAuthSuccess({
        message: 'Sign-in link sent! Check your email.',
        email: email
      });

    } catch (error) {
      console.error('Sign-in link error:', error);
      setError(error.message || 'Failed to send sign-in link. Please try again.');
      setLoading(false);
      onError(error.message || 'Failed to send sign-in link. Please try again.');
    }
  };

  /**
   * Resets the form to initial state
   */
  const handleReset = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    setLoading(false);
  };

  if (success) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        </Box>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Check Your Email!
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          We've sent a sign-in link to<br />
          <strong>{email}</strong><br />
          Click the link to sign in automatically.
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
          Didn't receive it? Check your spam folder.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            size="small"
          >
            Try Different Email
          </Button>

          <Button
            variant="text"
            onClick={handleSendMagicLink}
            disabled={loading}
            size="small"
          >
            Resend Link
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
        Enter your email to receive a sign-in link for instant access
      </Typography>

      <TextField
        fullWidth
        label="Email Address"
        placeholder="commander@space.io"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        error={!!error}
        helperText={error}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
        }}
      />

      <Button
        fullWidth
        variant="contained"
        onClick={handleSendMagicLink}
        disabled={loading || !email}
        startIcon={<EmailIcon />}
        sx={{ py: 1.5 }}
      >
        {loading ? 'Sending Link...' : 'Send Sign-In Link'}
      </Button>

      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          display: 'block',
          mt: 2,
          textAlign: 'center'
        }}
      >
        Secure. No password Required. Free forever.
      </Typography>
    </Box>
  );
};

export default EmailAuth;
