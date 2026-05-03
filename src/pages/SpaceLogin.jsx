// import React from 'react'
import GoogleIcon from '@mui/icons-material/Google';
import LinkIcon from '@mui/icons-material/Link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Box, Button, Grid, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Modal from '@mui/material/Modal';
import { signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Space from "../assets/space-astro.svg";
import CustomButton from '../components/HomeComponents/CustomButton';
import EmailAuth from '../components/Login/EmailAuth';
import LoginTextField from '../components/Login/LoginTextField';
import apiRequest from '../config/api';
import { useAuth } from '../context/AuthContext/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { auth, googleProvider } from '../firebase';

const SpaceLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  // States
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Helper Function
  const onChangeTextField = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const response = await apiRequest(`/api/auth/google`, {
        method: 'POST',
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { token, userData, isNewUser } = await response.json();

      login(userData, token);

      // Conditional redirect based on whether it's a first-time user
      if (isNewUser) {
        navigate('/onboarding');
      } else {
        navigate('/home');
      }

    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleEmailAuthSuccess = (data) => {
    showSnackbar(data.message, 'success');
    setShowEmailAuth(false);
  };

  const handleEmailAuthError = (error) => {
    showSnackbar(error, 'error');
  };

  const handleSpaceLogin = async () => {
    try {
      // Validate form data
      if (!formData.email || !formData.password) {
        showSnackbar('Please fill in all fields', 'error');
        return;
      }

      // Call your login API
      const response = await apiRequest(`/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { token, userData, isNewUser } = await response.json();

      login(userData, token);

      // Conditional redirect based on whether it's a first-time user
      if (isNewUser) {
        navigate('/onboarding');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Login error:', error);
      showSnackbar('Login failed. Please try again.', 'error');
    }
  };

  return (
    <Grid container sx={{ height: '100vh', bgcolor: 'background.default' }}>
      {/* Left Illustration Section */}
      <Grid
        item
        size={{ xs: 12, sm: 6 }}
        sx={{
          position: 'relative',
          order: { xs: 2, sm: 1 },
          overflow: 'hidden',
          bgcolor: 'background.default',
          display: { xs: 'none', sm: 'block' }
        }}
      >
        {/* Background Image */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0
          }}
        >
          <img
            src={Space}
            alt="Space Illustration"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.6,
              mixBlendMode: 'luminosity'
            }}
          />
        </Box>

        {/* Green Nebula Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'primary.main',
            opacity: 0.2,
            mixBlendMode: 'overlay'
          }}
        />

        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, transparent 70%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0.8) 100%)',
            zIndex: 10
          }}
        />

        {/* Content */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 20,
            p: 6,
            maxWidth: 480
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontWeight: 300,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              mb: 2,
              color: 'text.primary',
              opacity: 0.9
            }}
          >
            Explore the Universe
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 300,
              lineHeight: 1.6,
              color: 'text.secondary'
            }}
          >
            Join the most adventurous community in the cosmos.{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              Discover, connect, and explore together.
            </Box>
          </Typography>
        </Box>
      </Grid>

      {/* Right Login Form Section */}
      <Grid
        item
        size={{ xs: 12, sm: 6 }}
        sx={{
          order: { xs: 1, sm: 2 },
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 3, sm: 6, md: 8 }
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 'bold',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'text.primary',
                mb: 1
              }}
            >
              SPAC<Box component="span" sx={{ color: 'primary.main' }}>E</Box>
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                letterSpacing: '0.05em'
              }}
            >
              Join the conversation in your favorite Spaces
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Email Field */}
            <LoginTextField
              value={formData.email}
              onChange={(e) => onChangeTextField('email', e.target.value)}
              label="Email"
              placeholder="commander@space.io"
              type="email"
            />


            {/* Password Field */}
            <LoginTextField
              value={formData.password}
              onChange={(e) => onChangeTextField('password', e.target.value)}
              label="Password"
              placeholder="•••••••"
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: 2 }}>
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ padding: 0.5 }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Submit Button */}
            <CustomButton
              children="Log In"
              fetchOnclick={handleSpaceLogin}
            />
          </Box>

          {/* Social Login */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
              <Box sx={{ flex: 1, borderTop: '1px solid rgba(255, 255, 255, 0.3)' }} />
              <Typography
                variant="caption"
                sx={{
                  mx: 2,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 'bold'
                }}
              >
                Or continue with
              </Typography>
              <Box sx={{ flex: 1, borderTop: '1px solid rgba(255, 255, 255, 0.3)' }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {/* Google */}
              <Button
                onClick={handleGoogleLogin}
                variant="outlined"
                sx={{
                  flex: 1, // This makes the button take up equal space
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme => theme.palette.divider}`,
                  color: 'text.primary',
                  py: 1.5,
                  borderRadius: '28px',
                  '&:hover': {
                    border: `1px solid ${theme => theme.palette.text.primary}`,
                    bgcolor: 'background.paper'
                  }
                }}
                startIcon={<GoogleIcon />}
              >
                Google
              </Button>
              {/* Email */}
              <Button
                onClick={() => setShowEmailAuth(true)}
                variant="outlined"
                sx={{
                  flex: 1, // This makes the button take up equal space
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme => theme.palette.divider}`,
                  color: 'text.primary',
                  py: 1.5,
                  borderRadius: '28px',
                  '&:hover': {
                    border: `1px solid ${theme => theme.palette.text.primary}`,
                    bgcolor: 'background.paper'
                  }
                }}
                startIcon={<LinkIcon />}
              >
                One-Time Link
              </Button>
            </Box>
          </Box>

          {/* Email Authentication Modal */}
          <Modal
            open={showEmailAuth}
            onClose={() => setShowEmailAuth(false)}
            aria-labelledby="email-auth-modal"
            aria-describedby="email-authentication-form"
          >
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.default',
              p: 4,
              borderRadius: 2,
              maxWidth: 400,
              width: '90%',
              boxShadow: 24
            }}>
              <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
                Email Authentication
              </Typography>

              <EmailAuth
                onEmailAuthSuccess={handleEmailAuthSuccess}
                onError={handleEmailAuthError}
              />

              <Button
                fullWidth
                variant="text"
                onClick={() => setShowEmailAuth(false)}
                sx={{ mt: 2 }}
              >
                Cancel
              </Button>
            </Box>
          </Modal>
        </Box>
      </Grid>
    </Grid >
  )
}

export default SpaceLogin