import DragHandleRoundedIcon from '@mui/icons-material/DragHandleRounded';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Step,
  StepLabel,
  Stepper,
  SwipeableDrawer,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  DiamondPlus,
  Home,
  LayoutTemplate,
  Search as SearchIcon,
  TrendingUp
} from 'lucide-react';
import Rocket from 'lucide-react/dist/esm/icons/rocket';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FinalChar from '../../assets/FINAL CHAR.png';
import apiRequest from '../../config/api';
import { uploadSingleFileToCloudinary } from '../../utils/cloudinary';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { getTitle } from '../../utils/rankingHelpers';
import { addRecentSearch } from '../../utils/searchHelpers';
import ConfirmationDialog from '../Notifications/ConfirmationDialog';
import ExpBar from './ExpBar';
import SearchDropdown from './SearchDropdown';
import TextFieldThreadly from './TextFieldThreadly';

const Header = ({ openDrawer, setOpenDrawer, onSpaceCreated }) => {
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [showTopicsConfirmation, setShowTopicsConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    avatarUrl: '',
    avatarPublicId: '',
    topics: [],
    communityType: 'public',
    isMature: false,
  });


  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [joinedSpaces, setJoinedSpaces] = useState([]);
  const [joinedSpacesLoading, setJoinedSpacesLoading] = useState(true);
  const [hotSpaces, setHotSpaces] = useState([]);
  const [hotSpacesLoading, setHotSpacesLoading] = useState(true);
  const [trendingSpaces, setTrendingSpaces] = useState([]);
  const [trendingSpacesLoading, setTrendingSpacesLoading] = useState(true);

  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL;

  // Stepper steps for creating a space
  const steps = [
    'About your Space',
    'Space Topics',
    'Privacy & Access Settings',
    'Space Members (Optional)'
  ];

  // A fetch that handles avatar upload using the cloudinary utility
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

      try {
        setLoading(true);
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              
              clearInterval(progressInterval);
              return 90;
            }
            return prev + Math.random() * 20;
          });
        }, 200);

        const result = await uploadSingleFileToCloudinary(file, showSnackbar, 'avatar');

        clearInterval(progressInterval);
        setUploadProgress(100);

        setAvatarPreview(result.url);
        setFormData(prev => ({
          ...prev,
          avatarUrl: result.url,
          avatarPublicId: result.publicId
        }));
      } catch (error) {
        setAvatarPreview(null);
      } finally {
        setLoading(false);
        // Reset progress after a short delay
        setTimeout(() => setUploadProgress(0), 1000);
      }
    }
  };

  // Get avatar URL from user data
  const getAvatarUrl = () => {
    if (user?.avatar_url) return user.avatar_url; // This will be the complete URL

    return null;
  };

  // Fetch topics on component mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setTopicsLoading(true);
        const response = await apiRequest(`/api/header`);
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

  /**
   * Fetches the user's joined spaces from the API
   * This is used to populate the mobile menu drawer with spaces the user has joined
   */
  const fetchJoinedSpaces = useCallback(async () => {
    try {
      setJoinedSpacesLoading(true);
      const response = await apiRequest('/api/header/joined-spaces');
      const result = await response.json();
      if (response.ok) {
        setJoinedSpaces(result.spaces);
      }
    } catch (error) {
      console.error('Failed to fetch joined spaces:', error);
    } finally {
      setJoinedSpacesLoading(false);
    }
  }, []);

  // Fetch joined spaces when component mounts or when user changes
  useEffect(() => {
    if (user?.id) {
      fetchJoinedSpaces();
    }
  }, [user, fetchJoinedSpaces]);

  /**
   * Fetches the hot spaces from the API
   * This is used to populate the mobile menu drawer with most active spaces
   */
  const fetchHotSpaces = useCallback(async () => {
    try {
      setHotSpacesLoading(true);
      const response = await apiRequest('/api/maincontent/hot_spaces');
      const result = await response.json();
      if (result.success) {
        setHotSpaces(result.spaces);
      }
    } catch (error) {
      console.error('Failed to fetch hot spaces:', error);
    } finally {
      setHotSpacesLoading(false);
    }
  }, []);

  // Fetch hot spaces when component mounts
  useEffect(() => {
    fetchHotSpaces();
  }, [fetchHotSpaces]);

  /**
   * Fetches the trending spaces from the API
   * This is used to populate the mobile menu drawer with trending spaces
   */
  const fetchTrendingSpaces = useCallback(async () => {
    try {
      setTrendingSpacesLoading(true);
      const response = await apiRequest('/api/spaces/trending');
      const result = await response.json();
      if (result.success) {
        setTrendingSpaces(result.spaces);
      }
    } catch (error) {
      console.error('Failed to fetch trending spaces:', error);
    } finally {
      setTrendingSpacesLoading(false);
    }
  }, []);

  // Fetch trending spaces when component mounts
  useEffect(() => {
    fetchTrendingSpaces();
  }, [fetchTrendingSpaces]);

  // A fetch that handles space creation
  const saveSpace = async () => {
    try {
      setLoading(true);

      const response = await apiRequest(`/api/header`, {
        method: 'PUT',
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
        onSpaceCreated(result.space);

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

        return result.space.id;
      } else {
        showSnackbar(result.error_message || 'Failed to create space', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to create space', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch that handles logout for the current user
  const handleLogout = async () => {
    try {
      // Call logout API
      const response = await apiRequest('/api/auth/logout', {
        method: 'POST'
      });

      // response return json
      const result = await response.json();

      if (result && result.success) {
        // Clear local storage
        localStorage.removeItem('token');

        showSnackbar(result.message || 'Logged out successfully', 'success');
        handleMenuClose();
        navigate('/login');
      } else {
        // Handle failed logout
        showSnackbar(result?.message || 'Logout failed', 'error');
      }

    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API fails
      localStorage.removeItem('token');
      // logout(); // Remove this too
      navigate('/login');
    }
  };

  // A function that validates the current step
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

  // A function that handles the next button
  const handleNext = async () => {
    if (validateStep()) return;

    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));

    if (activeStep === steps.length - 1) {
      setSubmitting(true);
      const spaceId = await saveSpace();
      setSubmitting(false);
      navigate(`/spaces/${spaceId}`);
    }
  };

  // Function that handles the back button
  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Function that handles the reset button
  const handleReset = () => {
    setActiveStep(0);
    setOpenDrawer(false);
  };

  // Function that handles the menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function that handles the menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handles search input change
   * This is used to update the search query state when user types
   * @param {Event} e - The input change event
   */
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Handles search key down event
   * This is used to navigate to search page when user presses Enter
   * @param {Event} e - The key down event
   */
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchDropdownOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  /**
   * Handles search blur event
   * This is used to navigate to search page when user taps Done on mobile keyboard
   * @param {Event} e - The blur event
   */
  const handleSearchBlur = useCallback((e) => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchDropdownOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  /**
   * Handles search input click
   * This is used to open the search dropdown
   * @param {Event} e - The click event
   */
  const handleSearchClick = (e) => {
    setSearchAnchorEl(e.currentTarget);
    setSearchDropdownOpen(true);
  };

  /**
   * Handles search dropdown close
   * This is used to close the search dropdown
   */
  const handleSearchDropdownClose = () => {
    setSearchDropdownOpen(false);
    setSearchAnchorEl(null);
  };

  return (
    // Main grid container for the header
    <Grid
      container
      spacing={2}
      sx={{
        alignItems: 'center',
        px: 2,
        py: 1,
      }}
    >
      {/* Logo */}
      <Grid
        item
        size={{ xs: 3, sm: 3, md: 3 }}
        sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}
      >
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
          <img
            src={FinalChar}
            alt="Space Character"
            style={{
              width: '55px',
              height: '55px',
              marginLeft: '4px',
              objectFit: 'contain'
            }}
          />
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
          <Tooltip
            title="Home"
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
            <Home
              onClick={() => {
                if (location.pathname === '/home') {
                  window.location.reload();
                } else {
                  navigate('/home');
                }
              }}
              style={{ cursor: 'pointer' }}
              size={25}
            />
          </Tooltip>
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

      {/* Drawer for creating a space */}
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
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  width: '100%',
                  justifyContent: 'space-between',
                  gap: 1
                }}>                  <TextFieldThreadly
                    label="Space Name"
                    variant="outlined"
                    value={formData.spaceName}
                    size="small"
                    sx={{ mt: 1, width: '100%' }}
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
                      mt: 1,
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
                        border: 2,
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
                sx={{ width: { xs: '100%', md: '100%' } }}
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
              disabled={submitting}
              sx={{
                textTransform: 'none',
                backgroundColor: 'primary.main'
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Creating...
                </>
              ) : (
                activeStep === steps.length - 1 ? 'Finish' : 'Next'
              )}
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

      {/* Menu */}
      <Tooltip title="Menu" arrow>
        <DragHandleRoundedIcon
          onClick={() => setShowMobileMenu(true)}
          sx={{
            display: { xs: 'flex', sm: 'none' },
            cursor: 'pointer'
          }}
        />
      </Tooltip>

      {/* Mobile Menu Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onOpen={() => setShowMobileMenu(true)}
        PaperProps={{
          sx: {
            bgcolor: 'background.default',
          }
        }}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Menu</Typography>
          <Typography
            variant="overline"
            sx={{
              mb: 2,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'text.primary',
            }}
          >
            JOINED SPACES
          </Typography>
          <List>
            {joinedSpacesLoading ? (
              // Show skeleton loaders while fetching
              Array.from({ length: 4 }).map((_, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width="60%" height={24} />
                  </Box>
                </ListItem>
              ))
            ) : joinedSpaces.length === 0 ? (
              // Fallback message when no spaces joined
              <ListItem sx={{ px: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  No spaces joined yet
                </Typography>
              </ListItem>
            ) : (
              // Display joined spaces with round avatars
              joinedSpaces.map((space) => (
                <ListItem
                  key={space.id}
                  button
                  onClick={() => {
                    navigate(`/${space.space_slug}`);
                    setShowMobileMenu(false);
                  }}
                  sx={{
                    px: 0,
                    py: 1,
                    borderRadius: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar
                      src={space.avatar_url}
                      alt={space.space_name}
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 2,
                        fontSize: '0.875rem',
                      }}
                    >
                      {space.space_name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <ListItemText
                      primary={
                        <>
                          <Box component="span" sx={{ color: 'primary.main' }}>spaces/</Box>
                          <Box component="span" sx={{ color: 'text.primary' }}>{space.space_slug?.replace('spaces/', '') || space.space_slug}</Box>
                        </>
                      }
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 600,
                        noWrap: true,
                        sx: {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '150px',
                        }
                      }}
                    />
                  </Box>
                </ListItem>
              ))
            )}
          </List>
          {/* Trending Spaces */}
          <Typography
            variant="overline"
            sx={{
              mb: 2,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'text.primary',
            }}
          >
            TRENDING SPACES
          </Typography>
          <List>
            {trendingSpacesLoading ? (
              // Show skeleton loaders while fetching
              Array.from({ length: 3 }).map((_, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width="60%" height={24} />
                  </Box>
                </ListItem>
              ))
            ) : trendingSpaces.length === 0 ? (
              // Fallback message when no trending spaces
              <ListItem sx={{ px: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  No trending spaces right now
                </Typography>
              </ListItem>
            ) : (
              // Display trending spaces with round avatars
              trendingSpaces.map((space) => (
                <ListItem
                  key={space.id}
                  button
                  onClick={() => {
                    navigate(`/spaces/${space.id}`);
                    setShowMobileMenu(false);
                  }}
                  sx={{
                    px: 0,
                    py: 1,
                    borderRadius: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar
                      src={space.avatar_url}
                      alt={space.space_name}
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 2,
                        fontSize: '0.875rem',
                      }}
                    >
                      {space.space_name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <ListItemText
                      primary={
                        <>
                          <Box component="span" sx={{ color: 'primary.main' }}>spaces/</Box>
                          <Box component="span" sx={{ color: 'text.primary' }}>{space.space_slug?.replace('spaces/', '') || space.space_slug}</Box>
                        </>
                      }
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 600,
                        noWrap: true,
                        sx: {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '150px',
                        }
                      }}
                    />
                  </Box>
                </ListItem>
              ))
            )}
          </List>

          {/* Hot Right Now */}
          <Typography
            variant="overline"
            sx={{
              mb: 2,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'text.primary',
            }}
          >
            HOT RIGHT NOW
          </Typography>
          <List>
            {hotSpacesLoading ? (
              // Show skeleton loaders while fetching
              Array.from({ length: 3 }).map((_, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width="60%" height={24} />
                  </Box>
                </ListItem>
              ))
            ) : hotSpaces.length === 0 ? (
              // Fallback message when no hot spaces
              <ListItem sx={{ px: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  No hot spaces right now
                </Typography>
              </ListItem>
            ) : (
              // Display hot spaces with round avatars
              hotSpaces.map((space) => (
                <ListItem
                  key={space.id}
                  button
                  onClick={() => {
                    navigate(`/spaces/${space.id}`);
                    setShowMobileMenu(false);
                  }}
                  sx={{
                    px: 0,
                    py: 1,
                    borderRadius: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar
                      src={space.avatar_url}
                      alt={space.space_name}
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 2,
                        fontSize: '0.875rem',
                      }}
                    >
                      {space.space_name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <ListItemText
                      primary={
                        <>
                          <Box component="span" sx={{ color: 'primary.main' }}>spaces/</Box>
                          <Box component="span" sx={{ color: 'text.primary' }}>{space.space_slug?.replace('spaces/', '') || space.space_slug}</Box>
                        </>
                      }
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 600,
                        noWrap: true,
                        sx: {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '150px',
                        }
                      }}
                    />
                  </Box>
                </ListItem>
              ))
            )}
          </List>
          {/* Spaces Settings */}
          <Typography
            variant="overline"
            sx={{
              mb: 2,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'text.primary',
            }}
          >
            SPACES SETTINGS
          </Typography>
          <List sx={{ gap: 1 }}>
            <ListItem
              button
              onClick={() => {
                setOpenDrawer(true);
                setShowMobileMenu(false);
              }}
              sx={{
                px: 0,
                py: 1,
                borderRadius: .5,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <Rocket
                  size={20}
                  sx={{
                    color: 'text.secondary',
                  }}
                />
                <ListItemText
                  primary="Create Space"
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 500,
                  }}
                />
              </Box>
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>

      {/* Search Bar */}
      <Grid item size="grow">
        <TextField
          fullWidth
          value={searchQuery}
          onChange={handleSearchInputChange}
          onClick={handleSearchClick}
          onKeyDown={handleSearchKeyDown}
          onBlur={handleSearchBlur}
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

            endAdornment: searchQuery.trim() ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      addRecentSearch(searchQuery.trim());
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchDropdownOpen(false);
                      setSearchQuery('');
                    }
                  }}
                  sx={{ p: 0.5 }}
                >
                  <SearchIcon size={18} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <SearchDropdown
          anchorEl={searchAnchorEl}
          open={searchDropdownOpen}
          onClose={handleSearchDropdownClose}
          searchQuery={searchQuery}
        />
      </Grid>



      {/* User Avatar */}
      <Grid item size="auto">

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>

          <Box sx={{ position: 'relative', }}>
            {/* Avatar */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Avatar
                sx={{
                  width: 50,
                  height: 50,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                src={getAvatarUrl()}
                alt={user?.username}
                onClick={handleMenuOpen}
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : 'J'}
              </Avatar>
            </Box>

            {/* Add the Menu component */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  bgcolor: 'background.default',
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  minWidth: 180,
                  mt: 1,
                  '& .MuiList-root': {
                    py: 1,
                  }
                }
              }}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate(`/profile/${user?.username}`);
                }}
                sx={{
                  px: 2,
                  py: 1.5,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    color: 'primary.main'
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'text.secondary'
                  }
                }}
              >
                Profile
              </MenuItem>
              <MenuItem
                // onClick={handleMenuClose}
                sx={{
                  px: 2,
                  py: 1.5,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    color: 'primary.main'
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'text.secondary'
                  }
                }}
              >
                Settings
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  px: 2,
                  py: 1.5,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    color: 'error.main'
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'text.secondary'
                  }
                }}
              >
                Logout
              </MenuItem>
            </Menu>

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
              Lv {user?.level || 1}
            </Box>
          </Box>

          <Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex' }, flexDirection: 'column' }}>
            <ExpBar />

            <Box sx={{
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: .5,
              display: { xs: 'none', sm: 'none', md: 'none', lg: 'flex' }
            }}>

              <Typography sx={{ fontWeight: 700 }}>
                {user?.username || 'Guest'}
              </Typography>

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
                {getTitle(user?.level || 1)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid >
  )
}

export default Header