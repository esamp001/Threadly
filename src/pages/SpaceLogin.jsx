// import React from 'react'
import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, Grid, Typography } from '@mui/material';
import { signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Space from "../assets/space.png";
import CustomButton from '../components/HomeComponents/CustomButton';
import LoginTextField from '../components/Login/LoginTextField';
import { useAuth } from '../context/AuthContext/AuthContext';
import { auth, googleProvider } from '../firebase';

const SpaceLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  console.log(formData, "formData")


  // Helper Function
  const onChangeTextField = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleGoogleLogin = async () => {
    try {
      console.log("Google login clicked");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Send user data to your backend
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Response text:', responseText);

      const { token, userData } = await response.json();

      // Use context to set user
      login(userData, token);

      // Redirect
      navigate('/home');

    } catch (error) {
      console.error('Login error:', error);
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
              label="Username or Email"
              placeholder="commander@space.io"
              type="email"
            />


            {/* Password Field */}
            <LoginTextField
              value={formData.password}
              onChange={(e) => onChangeTextField('password', e.target.value)}
              label="Password"
              placeholder="••••••••"
              type="password"
              rightAction={
                <Button
                  variant="text"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'none',
                    fontWeight: 'medium',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  Forgot password?
                </Button>
              }
            />

            {/* Submit Button */}
            {/* <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: 'primary.main',
                color: 'text.primary',
                fontWeight: 'bold',
                py: 2,
                borderRadius: '28px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
                '&:hover': {
                  bgcolor: 'primary.dark'
                },
                '&:active': {
                  transform: 'scale(0.98)'
                }
              }}
            >
              Log In
            </Button> */}
            <CustomButton
              children="Log In"
            // onClick={() => {}}
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

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 3 }}>
              <Button
                onClick={handleGoogleLogin}
                variant="outlined"
                sx={{
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
            </Box>
            {/* <Button
                variant="outlined"
                sx={{
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
              >
                Apple
              </Button> */}
            {/* </Box> */}
          </Box>

          {/* Footer Links */}
          <Box sx={{ textAlign: 'center', pt: 4, borderTop: `1px solid ${theme => theme.palette.divider}`, mt: 4 }}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 'medium' }}
            >
              New to the universe?{' '}
              <Button
                variant="text"
                sx={{
                  color: 'text.primary',
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  fontWeight: 'medium',
                  textDecoration: 'underline',
                  textDecorationColor: 'primary.main',
                  textDecorationThickness: 2,
                  textUnderlineOffset: 4,
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                Create an account
              </Button>
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid >
  )
}

export default SpaceLogin