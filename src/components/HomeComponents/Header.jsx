import { Avatar, Box, Button, CircularProgress, Drawer, FormControl, FormControlLabel, Grid, InputAdornment, MenuItem, Radio, RadioGroup, Select, Skeleton, Switch, TextField, Tooltip, Typography } from '@mui/material';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { DiamondPlus, Home, LayoutTemplate, Search as SearchIcon, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSnackbar } from '../../context/SnackbarContext';
import ConfirmationDialog from '../Notifications/ConfirmationDialog';
import TextFieldThreadly from './TextFieldThreadly';

const Header = ({ openDrawer, setOpenDrawer, onSpaceCreated }) => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [showTopicsConfirmation, setShowTopicsConfirmation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    spaceName: '',
    spaceDescription: '',
    spaceSlug: '',
    avatarUrl: '',
    communityType: '',
  });

  const [formData, setFormData] = useState({
    spaceName: '',
    spaceDescription: '',
    spaceSlug: '',
    avatarUrl: '',  // Store the Cloudinary URL here
    avatarPublicId: '',  // Store Cloudinary public_id
    topics: [],
    communityType: 'public',
    isMature: false,
  });
  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL;

  const steps = [
    'About your Space',
    'Space Topics',
    'Privacy & Access Settings',
    'Space Members (Optional)'
  ];

  // Helper function
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setUploadProgress(0); // Reset progress

      // Validate file type by extension
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        showSnackbar('Please upload an image file (JPG, PNG, GIF, WebP)', 'error');
        setAvatarPreview(null);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('File size must be less than 5MB', 'error');
        setAvatarPreview(null);
        return;
      }

      try {
        setLoading(true);

        // Create FormData
        const formData = new FormData();
        formData.append('avatar', file);

        // Simulate progress (since fetch doesn't have built-in progress)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + Math.random() * 20;
          });
        }, 200);

        const response = await fetch(`${API_URL}/api/cloudinary/upload`, {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        const result = await response.json();

        if (response.ok) {
          showSnackbar(result.message, 'success');
          setAvatarPreview(result.url);
          setFormData(prev => ({
            ...prev,
            avatarUrl: result.url,
            avatarPublicId: result.publicId
          }));
        } else {
          showSnackbar(result.message, 'error');
          setAvatarPreview(null);
        }
      } catch (error) {
        showSnackbar('Failed to upload avatar', 'error');
        setAvatarPreview(null);
      } finally {
        setLoading(false);
        // Reset progress after a short delay
        setTimeout(() => setUploadProgress(0), 1000);
      }
    }
  };

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setTopicsLoading(true);
        const response = await fetch(`${API_URL}/api/header`);
        const result = await response.json();
        if (response.ok) {
          setTopics(result.topics);
        }
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      } finally {
        setTopicsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const saveSpace = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/header`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceName: formData.spaceName,
          spaceDescription: formData.spaceDescription,
          spaceSlug: formData.spaceSlug,
          avatarUrl: formData.avatarUrl,
          avatarPublicId: formData.avatarPublicId,
          communityType: formData.communityType,
          isMature: formData.isMature,
          topics: formData.topics
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showSnackbar('Space created successfully!', 'success');
        handleReset(); // Close drawer and reset form
        onSpaceCreated(result.space)

        // Reset all forms in creating space
        setFormData({
          spaceName: '',
          spaceDescription: '',
          spaceSlug: '',
          avatarUrl: '',
          avatarPublicId: '',
          communityType: 'public',
          isMature: false,
          topics: []
        });
      } else {
        showSnackbar(result.message || 'Failed to create space', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to create space', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    const errors = {};

    if (activeStep === 0) {
      if (!formData.spaceName) errors.spaceName = 'Space name is required';
      if (!formData.spaceDescription) errors.spaceDescription = 'Description is required';
    }

    if (activeStep === 1) {
      if (formData.topics.length === 0) {
        setShowTopicsConfirmation(true);
        return true;
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      showSnackbar('Please fill in all required fields', 'error');
      return true;
    }

    return false;
  };

  const handleNext = () => {
    if (validateStep()) return;

    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));

    if (activeStep === steps.length - 1) {
      saveSpace();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setActiveStep(0);
    setOpenDrawer(false);
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        alignItems: 'center',
        px: 2,
        py: 1
      }}
    >
      {/* Logo */}
      <Grid item size={{ xs: 3, sm: 3, md: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: 90, height: 90 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              letterSpacing: '0.12em',
              fontFamily: 'Inter, sans-serif',
              textTransform: 'uppercase',
              fontSize: { xs: '0.8rem', sm: '1.25rem' },
              display: 'block'
            }}
          >
            SPAC
            <Box component="span" sx={{ color: 'primary.main' }}>
              E
            </Box>
          </Typography>
        </Box>
      </Grid>

      {/* Navigation */}
      <Grid
        item
        size={{ sm: 'grow', md: 'grow' }}
        sx={{
          display: { xs: 'none', sm: 'flex' },
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{
          display: 'flex',
          // Responsive gap: tight on tablet, wide on desktop
          gap: { sm: 4, md: 6, lg: 10 },
          mr: { lg: 10, xl: 20 },
          alignItems: 'center'
        }}>
          <Home size={25} />
          <TrendingUp size={25} />
          <LayoutTemplate size={25} />
          <Tooltip
            title="Create space"
            arrow
            sx={{
              '& .MuiTooltip-tooltip': {
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: '0.875rem',
              },
              '& .MuiTooltip-arrow': {
                color: 'primary.main',
              }
            }}
          >
            <DiamondPlus
              onClick={() => setOpenDrawer(true)}
              style={{ cursor: 'pointer' }}
              size={25}
            />
          </Tooltip>
        </Box>
      </Grid>


      <Drawer
        anchor="top"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{
          sx: {
            // backgroundImage: coverPhoto ? `url(${coverPhoto})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.66)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1
            }
          }
        }}
      >
        <Box sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          p: 2
        }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel sx={{
                  color: 'text.secondary',
                  '&.Mui-active': { color: 'primary.main' },
                  '&.Mui-completed': { color: 'primary.main' },
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '0.7rem', sm: '0.875rem' }, // Smaller on mobile
                    fontWeight: 500
                  }
                }}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />
        </Box>

        {activeStep === 0 && (
          <Box sx={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            p: 4,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0, 0, 0, 0.79)',
          }}>

            <Typography variant="h6">Step 1: About your Space</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Quickly create a space for your community
            </Typography>

            {/* Right side - Avatar upload */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 150 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  border: '3px solid',
                  borderColor: 'primary.main',
                  boxShadow: theme => `0 4px 0 0 ${theme.palette.success.main}`,
                  bgcolor: 'search.backgroundColor',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme => `0 6px 0 0 ${theme.palette.success.main}`
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress
                      variant="determinate"
                      value={uploadProgress}
                      size={60}
                      sx={{
                        color: 'primary.main',
                        position: 'absolute',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        sx={{
                          color: 'text.primary',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        {`${Math.round(uploadProgress)}%`}
                      </Typography>
                    </Box>
                  </Box>
                ) : avatarPreview ? (
                  <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <Box
                      onClick={() => { setAvatarPreview(null) }}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        bgcolor: 'rgba(0,0,0,0)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.4)',
                        },
                        '&:hover span': {
                          opacity: 1,
                        },
                      }}
                    >
                      <Typography variant="caption" component="span" sx={{ opacity: 0, transition: 'opacity 0.2s ease', color: (theme) => theme.palette.getContrastText(theme.palette.background.paper) }}>Remove</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography sx={{ fontWeight: 700, color: 'text.main' }}>Space</Typography>
                )}
              </Avatar>
              <Button
                component="label"
                size="small"
                sx={{
                  textTransform: "none",
                  borderRadius: "999px",
                  px: 2.5,
                  py: 0.8,
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  backgroundColor: "#111",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  "&:hover": {
                    backgroundColor: "#222",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  },
                }}
              >
                Upload Avatar
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
              {/* Left side - Form fields */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 1 }}>
                  <TextFieldThreadly
                    label="Space Name"
                    variant="outlined"
                    value={formData.spaceName}
                    size="small"
                    sx={{ mt: 2, width: '100%' }}
                    required
                    onChange={(e) => {
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                      setFormData({ ...formData, spaceName: e.target.value, spaceSlug: slug });
                    }}
                    helperText={fieldErrors.spaceName}
                    error={!!fieldErrors.spaceName}
                  />

                  <TextFieldThreadly
                    label="Space URL"
                    variant="outlined"
                    size="small"
                    sx={{
                      mt: 2,
                      width: '100%',
                      pointerEvents: 'none',
                      cursor: 'not-allowed'
                    }}
                    value={`spaces/${formData.spaceSlug}`}
                    disabled
                  />
                </Box>

                <TextFieldThreadly
                  label="Description"
                  onChange={(e) => setFormData({ ...formData, spaceDescription: e.target.value })}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2, width: '100%', borderRadius: 2 }}
                  multiline
                  rows={2}
                  rowsMax={2}
                  helperText={fieldErrors.spaceDescription}
                  error={!!fieldErrors.spaceDescription}
                />
              </Box>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            p: 4,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0, 0, 0, 0.79)',
          }}>
            <Typography variant="h6">Step 2: Space Topics</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Choose your preferred topics for your space
            </Typography>

            <Box sx={{
              height: 400,
              overflowY: 'auto',
              pr: 1,
              mt: 2
            }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                {topicsLoading ? (
                  // Show skeleton boxes while loading
                  Array.from({ length: topics.length || 8 }).map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
                        <Skeleton variant="text" width="60%" height={20} />
                      </Box>
                      <Skeleton variant="text" width="100%" height={14} />
                      <Skeleton variant="text" width="80%" height={14} sx={{ mt: 0.5 }} />
                    </Box>
                  ))
                ) : (
                  // Show actual topics when loaded
                  topics.map((topic) => (
                    <Box
                      key={topic.id}
                      onClick={() => {
                        const topicData = {
                          id: topic.id,
                          name: topic.name,
                          description: topic.description
                        };

                        setFormData(prev => {
                          const isAlreadySelected = prev.topics.some(t => t.id === topic.id);
                          if (isAlreadySelected) {
                            return {
                              ...prev,
                              topics: prev.topics.filter(t => t.id !== topic.id)
                            };
                          } else {
                            return {
                              ...prev,
                              topics: [...prev.topics, topicData]
                            };
                          }
                        })
                      }}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: formData.topics.some(t => t.id === topic.id) ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: formData.topics.some(t => t.id === topic.id) ? 'primary.dark' : 'action.hover'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <i className={topic.icon} style={{ fontSize: 20, marginRight: 8 }} />
                        <Typography variant="subtitle2" fontWeight={500}>
                          {topic.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                        {topic.description}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%', p: 4, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0, 0, 0, 0.79)' }}>
            <Typography variant="h6">Step 3: Privacy & Access Settings</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Choose who can view and contribute to your space
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>Community Type</Typography>
              <RadioGroup
                value={formData.communityType}
                onChange={(e) => setFormData({ ...formData, communityType: e.target.value })}
              >
                <FormControlLabel value="public" control={<Radio />} label="Public - Anyone can view and post" />
                <FormControlLabel value="restricted" control={<Radio />} label="Restricted - Anyone can view, only approved members can post" />
                <FormControlLabel value="private" control={<Radio />} label="Private - Only approved members can view and post" />
              </RadioGroup>

              <FormControlLabel
                sx={{ mt: 2 }}
                control={<Switch checked={formData.isMature} onChange={(e) => setFormData({ ...formData, isMature: e.target.checked })} />}
                label="Mature (18+) content"
              />
            </Box>
          </Box>
        )}

        {activeStep === 3 && (
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%', p: 4, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0, 0, 0, 0.79)' }}>
            <Typography variant="h6">Step 4: Space Members (Optional)</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Invite members to your space or skip for now
            </Typography>

            <Box sx={{ mt: 3 }}>
              <TextFieldThreadly
                sx={{ width: '50%' }}
                label="Invite by username or email"
                placeholder="Enter usernames or emails separated by commas"
              />

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Select Role</Typography>
              <FormControl fullWidth>
                <Select size="small" defaultValue="member">
                  <MenuItem value="member">Member - Can post and comment</MenuItem>
                  <MenuItem value="contributor">Contributor - Can post, comment, and approve posts</MenuItem>
                  <MenuItem value="moderator">Moderator - Full access to moderation tools</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        {/* Navigation Buttons */}
        <Box sx={{
          display: 'flex', justifyContent: 'space-between', p: 1,
          zIndex: 10, backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }}>
          <Button
            onClick={handleReset}
            sx={{
              textTransform: 'none',
              color: 'text.primary'
            }}
          >
            Cancel
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{
                textTransform: 'none',
                color: 'text.primary'
              }}
            >
              Back
            </Button>

            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                textTransform: 'none',
                backgroundColor: 'primary.main'
              }}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Box>
        <ConfirmationDialog
          open={showTopicsConfirmation}
          onClose={() => setShowTopicsConfirmation(false)}
          onConfirm={() => {
            setShowTopicsConfirmation(false);
            setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
          }}
          title="No Topics Selected"
          message="You haven't selected any topics for your space."
          subMessage="Adding topics helps users discover your space, but you can add them later from your space settings. Would you like to continue without topics?"
          confirmText="Continue"
          cancelText="Go Back"
        />
      </Drawer>

      {/* Search Bar */}
      <Grid item size="grow">
        <TextField
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 21,
              '& fieldset': {
                borderWidth: '2px',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              }
            }
          }}
          size='small'
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>


      <Grid item size="auto">
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Avatar sx={{ width: 50, height: 50, }}>J</Avatar>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                bgcolor: 'success.main',
                color: '#fff',
                px: 0.8,
                py: 0.2,
                fontSize: 10,
                borderRadius: '999px',
                fontWeight: 700
              }}
            >
              Lv 12
            </Box>
          </Box>

          <Box sx={{
            alignItems: 'center',
            flexDirection: 'column',
            gap: 1,
            display: { xs: 'none', sm: 'none', md: 'none', lg: 'flex' }
          }}>
            <Typography sx={{ fontWeight: 700 }}>John Doe</Typography>
            <Typography
              sx={{
                display: 'inline-block',
                fontSize: 11,
                fontWeight: 700,
                color: 'success.light',
                bgcolor: 'rgba(76, 175, 80, 0.12)',
                px: 1,
                py: 0.2,
                borderRadius: '6px',
                letterSpacing: 0.3,
              }}
            >
              Head Hunter
            </Typography>
          </Box>
        </Box>
      </Grid>
      {/* </Box > */}
    </Grid >
  )
}

export default Header