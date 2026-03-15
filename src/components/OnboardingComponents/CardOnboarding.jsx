import CasinoIcon from '@mui/icons-material/Casino'
import { Avatar, Box, Button, LinearProgress, Paper, TextField, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator'
import welcomeSpace from '../../assets/welcome-space.svg'
import { useAuth } from '../../context/AuthContext/AuthContext'
import { generateAvatar } from '../../utils/avatarGenerator'

const generateRandomUsername = () => {
  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: '_',
    style: 'lowerCase'
  })
  return `u/${randomName}`
}

const CardOnboarding = () => {
  const navigate = useNavigate()
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0)
  const [topics, setTopics] = useState([])
  const [selectedTopics, setSelectedTopics] = useState([])
  const [username, setUsername] = useState(generateRandomUsername())
  const [avatarSeed, setAvatarSeed] = useState('default')
  const [avatarOptions, setAvatarOptions] = useState({
    gender: 'male', // Add gender default
    hair: ['short01', 'short02', 'long01'],
    hairColor: ['0e0e0e', '3eac2c', '6a4e35', '85c2c6', '796a45'],
    accessories: ['variant01', 'variant02'],
    facialHair: ['none'],
    clothing: ['variant01', 'variant02'],
    clothingColor: ['0e0e0e', '3eac2c', '6a4e35'],
    eyes: ['variant01', 'variant02', 'variant03'],
    mouth: ['variant01', 'variant02', 'variant03']
  })
  const [finalAvatarUrl, setFinalAvatarUrl] = useState('')

  const steps = [
    'Welcome to Space',
    'Choose Your Interests',
    'Complete Profile'
  ]

  // Fetch for topics
  const fetchTopics = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/header`)
      const data = await response.json()
      if (data.success) {
        setTopics(data.topics)
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
    }
  }, [setTopics])

  const handleSaveOnboarding = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      // Prepare the data to send
      const onboardingData = {
        username,
        avatar_url: null,
        selected_topics: selectedTopics,
        avatar_preferences: {
          seed: avatarSeed,
          options: avatarOptions
        }
      };

      const response = await fetch(`${apiUrl}/api/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(onboardingData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('Onboarding saved successfully:', result);
        navigate('/home');
      } else {
        console.error('Failed to save onboarding:', result.error);
        // Handle error (show message to user)
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      // Handle error (show message to user)
    }
  };

  // Use Effects
  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])


  useEffect(() => {
    // Generate avatar URL whenever options or seed changes
    const avatarUrl = generateAvatar(avatarOptions, avatarSeed);
    setFinalAvatarUrl(avatarUrl);
  }, [avatarOptions, avatarSeed]);

  // Handlers
  const progress = ((activeStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      navigate('/home')
    } else {
      setActiveStep((prevStep) => prevStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  // Functions
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return {
          title: 'Welcome to Space!',
          illustration: welcomeSpace,
          description: 'Let\'s set up your profile to get the most out of your Space experience.',
          content: 'A few quick steps to personalize your journey and connect with communities that match your interests.'
        }
      case 1:
        return {
          title: 'Choose Your Interests',
          topics: topics,
          content: 'We\'ll recommend Spaces and Threads based on your interests.'
        }
      case 2:
        return {
          title: 'Complete Your Profile',
          content: 'A complete profile helps you connect with like-minded space explorers.',
          showProfileForm: true
        }
      default:
        return {
          title: 'Welcome',
          description: '',
          content: ''
        }
    }
  }

  const currentStep = getStepContent(activeStep)

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 500,
        mx: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 1
      }}
    >
      {/* Linear Progress Bar */}
      <Box sx={{ mb: 4 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            }
          }}
        />
        <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center', color: 'text.secondary' }}>
          Step {activeStep + 1} of {steps.length}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, color: 'text.primary' }}>
          {currentStep.title}
        </Typography>
        {currentStep.illustration && (
          <Box sx={{ mb: 2 }}>
            <img
              src={currentStep.illustration}
              alt={currentStep.title}
              style={{
                width: '80%',
                maxWidth: '280px',
                height: 'auto',
                borderRadius: 8,
              }}
            />
          </Box>
        )}
        <Typography
          variant="h6"
          sx={{ mb: 1, fontWeight: 600 }}
        >
          {currentStep.description}
        </Typography>

        <Typography
          variant="body2"
          sx={{ mb: 2, color: 'text.secondary' }}
        >
          {currentStep.content}
        </Typography>
        {currentStep.topics && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {currentStep.topics.map((topic) => (
                <Button
                  key={topic.id}
                  variant={selectedTopics.includes(topic.id) ? "contained" : "outlined"}
                  onClick={() => {
                    if (selectedTopics.includes(topic.id)) {
                      setSelectedTopics(selectedTopics.filter(id => id !== topic.id))
                    } else {
                      setSelectedTopics([...selectedTopics, topic.id])
                    }
                  }}
                  size="small"
                  sx={{
                    borderRadius: 20,
                    textTransform: 'none',
                    ...(selectedTopics.includes(topic.id)
                      ? { bgcolor: 'primary.main', color: 'primary.contrastText' }
                      : { borderColor: 'primary.main', color: 'primary.main' }
                    ),
                    '&:hover': {
                      bgcolor: selectedTopics.includes(topic.id) ? 'primary.dark' : 'primary.main',
                      color: 'primary.contrastText'
                    }
                  }}
                >
                  {topic.name}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {currentStep.showProfileForm && (
          <Box
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            {/* Avatar Preview */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar
                src={finalAvatarUrl}
                sx={{
                  width: 110,
                  height: 110,
                  boxShadow: 3
                }}
              />
            </Box>

            {/* Random Avatar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<CasinoIcon />}
                onClick={() => {
                  const newAvatarSeed = Math.random().toString(36).substring(2, 15);
                  setAvatarSeed(newAvatarSeed);
                }}
                sx={{
                  textTransform: 'none',
                  borderRadius: 3
                }}
              >
                Random Avatar
              </Button>
            </Box>

            {/* Gender Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Gender
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant={avatarOptions.gender === 'male' ? 'contained' : 'outlined'}
                  onClick={() =>
                    setAvatarOptions({ ...avatarOptions, gender: 'male' })
                  }
                  sx={{ borderRadius: 2 }}
                >
                  Male
                </Button>

                <Button
                  fullWidth
                  variant={avatarOptions.gender === 'female' ? 'contained' : 'outlined'}
                  onClick={() =>
                    setAvatarOptions({ ...avatarOptions, gender: 'female' })
                  }
                  sx={{ borderRadius: 2 }}
                >
                  Female
                </Button>
              </Box>
            </Box>

            {/* Username */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Username
              </Typography>

              <TextField
                fullWidth
                placeholder="Choose a username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => setUsername(generateRandomUsername())}
                      sx={{
                        minWidth: 36,
                        p: 1,
                        borderRadius: 2
                      }}
                    >
                      <CasinoIcon />
                    </Button>
                  )
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ textTransform: 'none' }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleSaveOnboarding : handleNext}
          sx={{
            bgcolor: 'primary.main',
            textTransform: 'none',
            px: 3
          }}
        >
          {activeStep === steps.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </Box>
    </Paper>
  )
}

export default CardOnboarding