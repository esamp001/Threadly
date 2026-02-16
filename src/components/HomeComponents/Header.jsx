import { Avatar, Box, Button, Drawer, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import { DiamondPlus, Home, LayoutTemplate, Search as SearchIcon, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import ThreadlyLogo from '../../assets/Threadly.png';
import TextFieldThreadly from './TextFieldThreadly';
import { useSnackbar } from '../../context/SnackbarContext';
import { CircularProgress } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const Header = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    spaceName: '',
    spaceDescription: '',
    spaceSlug: '',
    avatarUrl: '',  // Store the Cloudinary URL here
    avatarPublicId: ''  // Store Cloudinary public_id
  });

  const steps = [
    'About your Space',
    'Space Details',
    'Space Members'
  ];

  const threadly_topics = [{}]

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

        const response = await fetch('/api/cloudinary/upload', {
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

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setActiveStep(0);
    setOpenDrawer(false);
  };

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      px: 7
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img src={ThreadlyLogo} alt="Threadly Logo" style={{ width: 90, height: 90, padding: 0 }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.1rem',
            display: { xs: 'none', sm: 'none', md: 'block' }
          }}
        >
          Threadly
        </Typography>
      </Box>

      <Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex' }, gap: 10, ml: 8, alignItems: 'center', }}>
        <Home size={25} />
        <TrendingUp size={25} />
        <LayoutTemplate size={25} />
        <DiamondPlus onClick={() => setOpenDrawer(true)} style={{ cursor: 'pointer' }} size={25} />
      </Box>

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
                  '&.Mui-completed': { color: 'primary.main' }
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
                  position: 'relative', // needed for overlay
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
                    {/* Remove button overlay */}
                    <Box
                      onClick={() => { setAvatarPreview(null) }} // replace with your remove logic
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        bgcolor: 'rgba(0,0,0,0)', // fully transparent initially
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.4)', // semi-transparent on hover
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
                <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                  <TextFieldThreadly
                    label="Space Name"
                    variant="outlined"
                    value={formData.spaceName}
                    size="small"
                    sx={{ mt: 2, width: '53%' }}
                    required
                    onChange={(e) => {
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                      setFormData({ ...formData, spaceName: e.target.value, spaceSlug: slug });
                    }}
                  />

                  <TextFieldThreadly
                    label="Space URL"
                    variant="outlined"
                    size="small"
                    sx={{
                      mt: 2,
                      width: '45%',
                      pointerEvents: 'none', // Prevents clicking
                      cursor: 'not-allowed' // Shows not-allowed cursor
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
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6">Step 3: Space Members</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Invite members to your space
              </Typography>
            </Box>
          )}
       
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1,
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
      </Drawer>

      {/* Search Bar */}
      <Grid container>
        <Grid sx={{ width: { xs: 600, sm: 800, md: 1000, lg: 500, xl: 1050 } }}>
          <TextField
            sx={{
              width: '100%',
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
      </Grid>

      <Box sx={{ display: 'flex', gap: 1, width: 150, justifyContent: 'flex-end', ml: 5 }}>
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
          width: 150,
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
    </Box>
  )
}

export default Header