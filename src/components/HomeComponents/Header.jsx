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
  Paper,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Step,
  StepLabel,
  Stepper,
  SwipeableDrawer,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Home,
  LayoutTemplate,
  Medal,
  Search as SearchIcon,
} from 'lucide-react';
import Rocket from 'lucide-react/dist/esm/icons/rocket';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AstroSpace from "../../assets/astro-space.png";
import FinalChar from '../../assets/FINAL CHAR.png';
import LeaderboardOcto from "../../assets/leaderboard-octo.png";
import apiRequest from '../../config/api';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { uploadSingleFileToCloudinary } from '../../utils/cloudinary';
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
  const [openLeaderboardDrawer, setOpenLeaderboardDrawer] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState({ levels: [], contributors: [] });
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

  /**
   * Handles switching tabs inside the leaderboard drawer
   * This is used to toggle between level masters and space legends views
   * @param {object} event - The MUI tab change event object
   * @param {number} newValue - The index of the selected tab
   */
  const handleLeaderboardTabChange = (event, newValue) => {
    setLeaderboardTab(newValue);
  };

  /**
   * Opens the leaderboard drawer and lazily fetches leaderboard data
   * This is used to display the top platform players when clicking the TrendingUp icon
   */
  const handleLeaderboardClick = async () => {
    setOpenLeaderboardDrawer(true);
    if (leaderboardData.levels.length === 0 && leaderboardData.contributors.length === 0) {
      await fetchLeaderboardData();
    }
  };

  /**
   * Fetches leaderboard datasets from the backend API
   * This is used to retrieve level masters and space contributors rankings in parallel
   */
  const fetchLeaderboardData = async () => {
    try {
      setLeaderboardLoading(true);
      const response = await apiRequest('/api/header/leaderboard');
      const result = await response.json();
      if (response.ok && result.success) {
        setLeaderboardData({
          levels: result.levels || [],
          contributors: result.contributors || []
        });
      } else {
        showSnackbar(result.error_message || 'Failed to fetch leaderboard', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      showSnackbar('Failed to fetch leaderboard', 'error');
    } finally {
      setLeaderboardLoading(false);
    }
  };

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
      else if (formData.spaceName.length > 255) errors.spaceName = 'Space name cannot exceed 255 characters';

      if (!formData.spaceDescription) errors.spaceDescription = 'Description is required';
      else if (formData.spaceDescription.length > 255) errors.spaceDescription = 'Description cannot exceed 255 characters';
    }

    if (activeStep === 1) {
      if (formData.topics.length === 0) {
        setShowTopicsConfirmation(true);
        return true;
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      if (formData.spaceDescription.length > 255) {
        showSnackbar('Character limit exceeded (255 characters max)', 'error');
      } else {
        showSnackbar('Please fill in all required fields', 'error');
      }
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
          <Tooltip
            title="Leaderboard"
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
            <Medal
              onClick={handleLeaderboardClick}
              style={{ cursor: 'pointer' }}
              size={25}
            />
          </Tooltip>
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
            <Rocket
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
                      const value = e.target.value;
                      const slug = value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');

                      setFormData({ ...formData, spaceName: value, spaceSlug: slug });

                      // Immediate validation for character limit
                      if (value.length > 255) {
                        setFieldErrors(prev => ({ ...prev, spaceName: 'Space name cannot exceed 255 characters' }));
                      } else if (fieldErrors.spaceName) {
                        setFieldErrors(prev => ({ ...prev, spaceName: '' }));
                      }
                    }}
                    helperText={fieldErrors.spaceName || (formData.spaceName.length > 200 ? `${formData.spaceName.length}/255` : '')}
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, spaceDescription: value });

                    // Immediate validation for character limit
                    if (value.length > 255) {
                      setFieldErrors(prev => ({ ...prev, spaceDescription: 'Description cannot exceed 255 characters' }));
                    } else if (fieldErrors.spaceDescription) {
                      setFieldErrors(prev => ({ ...prev, spaceDescription: '' }));
                    }
                  }}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2, width: '100%', borderRadius: 2 }}
                  multiline
                  rows={2}
                  rowsMax={2}
                  helperText={fieldErrors.spaceDescription || (formData.spaceDescription.length > 200 ? `${formData.spaceDescription.length}/255` : '')}
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

      {/* Global Gamification Leaderboard Drawer */}
      <Drawer
        anchor="top"
        open={openLeaderboardDrawer}
        onClose={() => setOpenLeaderboardDrawer(false)}
        PaperProps={{
          sx: {
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            maxHeight: '85vh',
            overflowY: 'auto'
          }
        }}
      >
        <Box sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          p: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          {/* Close Button / Header */}
          <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
              Global Leaderboard
            </Typography>
            <Button
              onClick={() => setOpenLeaderboardDrawer(false)}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              Close
            </Button>
          </Box>

          {/* Octo Speech Row */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            width: '100%',
            maxWidth: '600px',
            mb: 3,
            mt: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Box sx={{ position: 'relative', width: { xs: 60, sm: 90 }, height: { xs: 60, sm: 90 }, flexShrink: 0 }}>
              <img
                src={leaderboardTab === 0 ? LeaderboardOcto : AstroSpace}
                alt={leaderboardTab === 0 ? "Octo Mascot" : "Astro Mascot"}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: leaderboardTab === 0
                    ? 'drop-shadow(0px 4px 12px rgba(33, 150, 243, 0.45))'
                    : 'drop-shadow(0px 4px 12px rgba(156, 39, 176, 0.55))',
                }}
              />
            </Box>

            {/* Speech bubble */}
            <Paper sx={{
              position: 'relative',
              bgcolor: leaderboardTab === 0 ? 'rgba(33, 150, 243, 0.06)' : 'rgba(156, 39, 176, 0.06)',
              border: leaderboardTab === 0 ? '1px solid rgba(33, 150, 243, 0.2)' : '1px solid rgba(156, 39, 176, 0.2)',
              borderRadius: '16px',
              p: { xs: 1, sm: 2 },
              flexGrow: 1,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: { xs: '50%', sm: '-8px' },
                top: { xs: '-8px', sm: '50%' },
                transform: { xs: 'translateX(-50%) rotate(45deg)', sm: 'translateY(-50%) rotate(45deg)' },
                width: '16px',
                height: '16px',
                bgcolor: 'background.paper',
                borderLeft: leaderboardTab === 0 ? '1px solid rgba(33, 150, 243, 0.2)' : '1px solid rgba(156, 39, 176, 0.2)',
                borderBottom: {
                  xs: 'none',
                  sm: leaderboardTab === 0 ? '1px solid rgba(33, 150, 243, 0.2)' : '1px solid rgba(156, 39, 176, 0.2)'
                },
                borderTop: {
                  xs: leaderboardTab === 0 ? '1px solid rgba(33, 150, 243, 0.2)' : '1px solid rgba(156, 39, 176, 0.2)',
                  sm: 'none'
                },
                zIndex: 1
              }
            }}>
              <Typography
                sx={{
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1.5,
                  zIndex: 2,
                  fontSize: { xs: '0.7rem', sm: '0.875rem' }
                }}
              >
                {leaderboardTab === 0
                  ? "Ahoy! Level Masters are the most active explorers in Space! Scale the ranks by posting threads, sharing knowledge, and leveling up your profile! 🚀"
                  : "Space Legends are the heartbeat of our communities! Earn Contributor Points inside individual Spaces by contributing high-value posts and comments! 🎖️"
                }
              </Typography>
            </Paper>
          </Box>

          {/* Leaderboard Tabs */}
          <Tabs
            value={leaderboardTab}
            onChange={handleLeaderboardTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              mb: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
              width: '100%',
              maxWidth: '600px',
              '& .MuiTab-root': {
                fontWeight: 700,
                textTransform: 'none',
                fontSize: { xs: '0.85rem', sm: '1rem' }
              }
            }}
          >
            <Tab label="Level Masters" />
            <Tab label="Space Legends" />
          </Tabs>

          {/* Content Area */}
          <Box sx={{ width: '100%', maxWidth: '600px', maxHeight: '380px', overflowY: 'auto', pr: 0.5 }}>
            {leaderboardLoading ? (
              // Loading Skeleton State
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Skeleton variant="text" width={25} height={25} />
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="text" width="40%" height={24} />
                    </Box>
                    <Skeleton variant="rounded" width={50} height={25} />
                  </Paper>
                ))}
              </List>
            ) : (
              // Ranked Users List
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {(leaderboardTab === 0 ? leaderboardData.levels : leaderboardData.contributors).length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No leaderboard records found yet.</Typography>
                  </Box>
                ) : (
                  (leaderboardTab === 0 ? leaderboardData.levels : leaderboardData.contributors).map((entry, index) => {
                    // Define rank badge
                    let rankBadge = `${index + 1}`;
                    let rankColor = 'text.secondary';
                    let rankBg = 'rgba(255, 255, 255, 0.05)';

                    if (index === 0) {
                      rankBadge = '🥇';
                      rankBg = 'rgba(255, 215, 0, 0.15)';
                    } else if (index === 1) {
                      rankBadge = '🥈';
                      rankBg = 'rgba(192, 192, 192, 0.15)';
                    } else if (index === 2) {
                      rankBadge = '🥉';
                      rankBg = 'rgba(205, 127, 50, 0.15)';
                    }

                    return (
                      <Paper
                        key={entry.id}
                        sx={{
                          p: 1.8,
                          bgcolor: entry.username === user?.username ? 'rgba(76, 175, 80, 0.06)' : 'background.paper',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid',
                          borderColor: entry.username === user?.username ? 'success.main' : 'divider',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            borderColor: 'primary.main'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {/* Rank badge */}
                          <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: index < 3 ? '1.2rem' : '0.9rem',
                            bgcolor: rankBg,
                            color: rankColor
                          }}>
                            {rankBadge}
                          </Box>

                          {/* Avatar */}
                          <Avatar
                            src={entry.avatarUrl || entry.avatar_url}
                            alt={entry.username}
                            onClick={() => {
                              setOpenLeaderboardDrawer(false);
                              navigate(`/profile/${entry.username}`);
                            }}
                            sx={{
                              width: 40,
                              height: 40,
                              cursor: 'pointer',
                              border: '2px solid transparent',
                              '&:hover': {
                                borderColor: 'primary.main'
                              }
                            }}
                          >
                            {entry.username?.charAt(0).toUpperCase()}
                          </Avatar>

                          {/* Username */}
                          <Typography
                            onClick={() => {
                              setOpenLeaderboardDrawer(false);
                              navigate(`/profile/${entry.username}`);
                            }}
                            sx={{
                              fontWeight: entry.username === user?.username ? 800 : 600,
                              color: entry.username === user?.username ? 'success.light' : 'text.primary',
                              cursor: 'pointer',
                              '&:hover': {
                                color: 'primary.main',
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {entry.username}
                            {entry.username === user?.username && ' (You)'}
                          </Typography>
                        </Box>

                        {/* Level badge / Point score */}
                        <Box>
                          {leaderboardTab === 0 ? (
                            <Typography
                              sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: 'success.light',
                                bgcolor: 'rgba(76, 175, 80, 0.12)',
                                px: 1.2,
                                py: 0.4,
                                borderRadius: '6px',
                                letterSpacing: 0.3,
                              }}
                            >
                              Lv {entry.level || 1}
                            </Typography>
                          ) : (
                            <Typography
                              sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: 'primary.light',
                                bgcolor: 'rgba(33, 150, 243, 0.12)',
                                px: 1.2,
                                py: 0.4,
                                borderRadius: '6px',
                                letterSpacing: 0.3,
                              }}
                            >
                              {entry.total_points || 0} pts
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    );
                  })
                )}
              </List>
            )}
          </Box>
        </Box>
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

            <ListItem
              button
              onClick={() => {
                handleLeaderboardClick();
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
                <Medal
                  size={20}
                  sx={{
                    color: 'text.secondary',
                  }}
                />
                <ListItemText
                  primary="Leaderboard"
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