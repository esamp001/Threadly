# Onboarding Components

## Purpose
This document specifies the onboarding components that guide new users through the initial setup process for the Space platform.

## Components Overview

### 1. CardOnboarding
The main onboarding card component that displays the onboarding flow.

**File:** `src/components/OnboardingComponents/CardOnboarding.jsx`

#### Props
```jsx
{
  currentStep: number,           // Current step in onboarding flow (0-3)
  totalSteps: number,            // Total number of steps (default: 4)
  onComplete: () => void,        // Callback when onboarding is completed
  onSkip: () => void,           // Callback when user skips onboarding
  userData: {                   // User data collected during onboarding
    displayName?: string,
    interests?: string[],
    avatar?: string
  }
}
```

#### State Management
```jsx
const [currentStep, setCurrentStep] = useState(0);
const [userData, setUserData] = useState({
  displayName: '',
  interests: [],
  avatar: null
});
const [loading, setLoading] = useState(false);
```

#### Implementation
```jsx
import React, { useState, useContext } from 'react';
import {
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { StepWelcome } from './steps/StepWelcome';
import { StepProfile } from './steps/StepProfile';
import { StepInterests } from './steps/StepInterests';
import { StepAvatar } from './steps/StepAvatar';

export const CardOnboarding = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    displayName: user?.displayName || '',
    interests: [],
    avatar: user?.avatarUrl || null
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    'Welcome',
    'Profile',
    'Interests',
    'Avatar'
  ];

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      await handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Update user profile with collected data
      await userAPI.updateProfile(userData);
      await userAPI.completeOnboarding();
      
      // Update user context
      updateUser({
        ...user,
        ...userData,
        isOnboarded: true
      });

      // Redirect to home or dashboard
      window.location.href = '/';
    } catch (error) {
      console.error('Onboarding completion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await userAPI.completeOnboarding();
      updateUser({ ...user, isOnboarded: true });
      window.location.href = '/';
    } catch (error) {
      console.error('Skip onboarding error:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepWelcome 
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
      case 1:
        return (
          <StepProfile 
            userData={userData}
            setUserData={setUserData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <StepInterests 
            userData={userData}
            setUserData={setUserData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <StepAvatar 
            userData={userData}
            setUserData={setUserData}
            onNext={handleNext}
            onBack={handleBack}
            onComplete={handleComplete}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Welcome to Space
          </Typography>
          
          <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStep()}
        </CardContent>
      </Card>
    </Box>
  );
};
```

### 2. StepWelcome
Welcome step introducing users to the Space platform.

**File:** `src/components/OnboardingComponents/steps/StepWelcome.jsx`

#### Props
```jsx
{
  onNext: () => void,
  onSkip: () => void
}
```

#### Implementation
```jsx
import React from 'react';
import {
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Forum,
  People,
  TrendingUp,
  Security
} from '@mui/icons-material';

export const StepWelcome = ({ onNext, onSkip }) => {
  const features = [
    {
      icon: <Forum />,
      title: 'Topic-Based Discussions',
      description: 'Join Spaces dedicated to your interests and engage in meaningful conversations.'
    },
    {
      icon: <People />,
      title: 'Community Driven',
      description: 'Connect with like-minded individuals and build lasting relationships.'
    },
    {
      icon: <TrendingUp />,
      title: 'Quality Content',
      description: 'Vote on the best content and help surface the most valuable discussions.'
    },
    {
      icon: <Security />,
      title: 'Safe Environment',
      description: 'Enjoy a moderated platform with strong community guidelines.'
    }
  ];

  return (
    <Box>
      <Typography variant="body1" align="center" paragraph>
        Space is a modern discussion platform where you can connect through 
        topic-based Spaces and share ideas through Threads.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Box color="primary.main" mr={1}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6">
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="space-between">
        <Button onClick={onSkip} color="secondary">
          Skip for now
        </Button>
        <Button variant="contained" onClick={onNext}>
          Get Started
        </Button>
      </Box>
    </Box>
  );
};
```

### 3. StepProfile
Profile setup step for display name and bio.

**File:** `src/components/OnboardingComponents/steps/StepProfile.jsx`

#### Props
```jsx
{
  userData: object,
  setUserData: (data) => void,
  onNext: () => void,
  onBack: () => void
}
```

#### Implementation
```jsx
import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Box,
  Button,
  Avatar
} from '@mui/material';
import { Person } from '@mui/icons-material';

export const StepProfile = ({ userData, setUserData, onNext, onBack }) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!userData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (userData.displayName.length > 100) {
      newErrors.displayName = 'Display name must be 100 characters or less';
    }
    
    if (userData.bio && userData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleChange = (field) => (event) => {
    setUserData({
      ...userData,
      [field]: event.target.value
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tell us about yourself
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This information will be visible to other users in the community.
      </Typography>

      <Box display="flex" justifyContent="center" mb={3}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main'
          }}
        >
          <Person sx={{ fontSize: 40 }} />
        </Avatar>
      </Box>

      <TextField
        fullWidth
        label="Display Name"
        value={userData.displayName}
        onChange={handleChange('displayName')}
        error={!!errors.displayName}
        helperText={errors.displayName}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Bio (optional)"
        value={userData.bio || ''}
        onChange={handleChange('bio')}
        error={!!errors.bio}
        helperText={errors.bio || `${userData.bio?.length || 0}/500 characters`}
        margin="normal"
        multiline
        rows={3}
        placeholder="Tell others a bit about yourself..."
      />

      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button onClick={onBack}>
          Back
        </Button>
        <Button variant="contained" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Box>
  );
};
```

### 4. StepInterests
Interests selection step for personalized content.

**File:** `src/components/OnboardingComponents/steps/StepInterests.jsx`

#### Props
```jsx
{
  userData: object,
  setUserData: (data) => void,
  onNext: () => void,
  onBack: () => void
}
```

#### Implementation
```jsx
import React from 'react';
import {
  Typography,
  Box,
  Button,
  Chip,
  Grid
} from '@mui/material';

const availableInterests = [
  'Technology',
  'Programming',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'Cybersecurity',
  'DevOps',
  'Cloud Computing',
  'Design',
  'UI/UX',
  'Graphic Design',
  'Photography',
  'Video Production',
  'Marketing',
  'Business',
  'Entrepreneurship',
  'Finance',
  'Investing',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Mathematics',
  'Engineering',
  'Medicine',
  'Psychology',
  'Philosophy',
  'Literature',
  'History',
  'Art',
  'Music',
  'Gaming',
  'Sports',
  'Fitness',
  'Cooking',
  'Travel',
  'Movies',
  'Books'
];

export const StepInterests = ({ userData, setUserData, onNext, onBack }) => {
  const handleToggleInterest = (interest) => {
    const newInterests = userData.interests.includes(interest)
      ? userData.interests.filter(i => i !== interest)
      : [...userData.interests, interest];
    
    setUserData({
      ...userData,
      interests: newInterests
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select your interests
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose topics you're interested in to get personalized content recommendations.
        Select at least 3 interests to continue.
      </Typography>

      <Grid container spacing={1} sx={{ mb: 3 }}>
        {availableInterests.map((interest) => (
          <Grid item key={interest}>
            <Chip
              label={interest}
              clickable
              color={userData.interests.includes(interest) ? 'primary' : 'default'}
              onClick={() => handleToggleInterest(interest)}
              variant={userData.interests.includes(interest) ? 'filled' : 'outlined'}
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="body2" color="text.secondary">
        {userData.interests.length} interest{userData.interests.length !== 1 ? 's' : ''} selected
      </Typography>

      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button onClick={onBack}>
          Back
        </Button>
        <Button 
          variant="contained" 
          onClick={onNext}
          disabled={userData.interests.length < 3}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};
```

### 5. StepAvatar
Avatar upload step for profile picture.

**File:** `src/components/OnboardingComponents/steps/StepAvatar.jsx`

#### Props
```jsx
{
  userData: object,
  setUserData: (data) => void,
  onNext: () => void,
  onBack: () => void,
  onComplete: () => void,
  loading: boolean
}
```

#### Implementation
```jsx
import React, { useState, useRef } from 'react';
import {
  Typography,
  Box,
  Button,
  Avatar,
  CircularProgress
} from '@mui/material';
import { CloudUpload, CameraAlt } from '@mui/icons-material';

export const StepAvatar = ({ 
  userData, 
  setUserData, 
  onNext, 
  onBack, 
  onComplete, 
  loading 
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await userAPI.uploadAvatar(formData);
      setUserData({
        ...userData,
        avatar: response.data.avatarUrl
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSkipAvatar = () => {
    onComplete();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Add a profile picture
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload a photo to help others recognize you. This step is optional.
      </Typography>

      <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
        <Avatar
          src={userData.avatar}
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            border: '2px dashed',
            borderColor: 'divider'
          }}
        >
          {!userData.avatar && <CameraAlt sx={{ fontSize: 60 }} />}
        </Avatar>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <Button
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          onClick={handleUploadClick}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
      </Box>

      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button onClick={onBack}>
          Back
        </Button>
        <Box>
          <Button onClick={handleSkipAvatar} sx={{ mr: 1 }}>
            Skip
          </Button>
          <Button 
            variant="contained" 
            onClick={onComplete}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Complete Setup'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
```

## Integration with Backend

### API Endpoints
```javascript
// API endpoints used by onboarding components
POST /api/users/avatar          // Upload avatar
PUT /api/users/profile          // Update profile
PUT /api/users/onboarding       // Complete onboarding
POST /api/spaces/recommend      // Get recommended spaces based on interests
```

### Data Flow
1. User completes onboarding steps
2. Data is collected in component state
3. On completion, API calls are made to:
   - Update user profile
   - Upload avatar (if provided)
   - Mark onboarding as complete
   - Join recommended spaces based on interests

## Testing Requirements

### Unit Tests
- Step navigation functionality
- Form validation for each step
- File upload handling
- Data persistence across steps

### Integration Tests
- Complete onboarding flow
- API integration for profile updates
- Avatar upload and display
- Error handling for failed uploads

### User Experience Tests
- Responsive design on mobile/desktop
- Accessibility compliance
- Loading states and error messages
- Progress indication

## Styling Guidelines

### Material-UI Theme Integration
- Use consistent spacing and typography
- Follow brand color scheme
- Implement proper focus states
- Ensure touch-friendly button sizes

### Responsive Design
- Mobile-first approach
- Proper breakpoints for tablets/desktops
- Optimized for both portrait and landscape orientations

This onboarding component specification provides a comprehensive, user-friendly introduction to the Space platform while collecting essential user information for personalization.
