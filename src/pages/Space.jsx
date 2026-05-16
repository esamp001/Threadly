import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NoPhotographyRoundedIcon from '@mui/icons-material/NoPhotographyRounded';
import PeopleIcon from '@mui/icons-material/People';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import { Avatar, Box, Button, Grid, IconButton, Menu, MenuItem, MobileStepper, Paper, Skeleton, Typography, useTheme } from '@mui/material';
import { Flame } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import StyledButton from '../components/Global/StyledButton';
import ThreadContent from '../components/Global/ThreadContent';
import BottomNav from '../components/HomeComponents/BottomNav';
import CommentPanel from '../components/HomeComponents/CommentPanel';
import CustomButton from '../components/HomeComponents/CustomButton';
import Header from '../components/HomeComponents/Header';
import QuillEditor from '../components/HomeComponents/QuillEditor';
import TextFieldThreadly from '../components/HomeComponents/TextFieldThreadly';
import apiRequest from '../config/api';
import { useAuth } from '../context/AuthContext/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { uploadImagesToCloudinary } from '../utils/cloudinary';

// Reusable About Space Card component
const AboutSpaceCard = ({ space, isMember, memberCount, onJoin, onLeave, joining, rules, contributors, isOwner, onSettingsClick, isMobile = false }) => {
  const cardStyles = {
    backgroundColor: 'background.paper',
    p: { xs: 2, md: 3 },
    borderRadius: { xs: 0, md: 2 },
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
    overflow: 'hidden',
    position: 'relative'
  };

  return (
    <Paper sx={cardStyles}>
      {/* Accent Top Bar */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: `linear-gradient(90deg, ${isMember ? '#f43f5e' : '#6366f1'} 0%, ${isMember ? '#e11d48' : '#4f46e5'} 100%)`
      }} />

      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: 'text.secondary',
            textTransform: 'uppercase'
          }}
        >
          Community Info
        </Typography>
        {isOwner && (
          <IconButton
            onClick={onSettingsClick}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            <SettingsIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      {/* Description */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: { xs: '0.9rem', md: '0.95rem' },
            lineHeight: 1.6,
            color: 'text.primary',
            fontWeight: 400
          }}
        >
          {space?.description || 'No description available'}
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                Members
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: 'text.primary' }}>
              {memberCount || 0}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                Created
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', mt: 0.5 }}>
              {space?.createdAt || 'Unknown'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Button */}
      <Box sx={{ mb: 3 }}>
        {isMember ? (
          <Button
            fullWidth
            onClick={onLeave}
            disabled={joining}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              py: 1,
              borderColor: 'rgba(244, 63, 94, 0.5)',
              color: '#f43f5e',
              fontWeight: 700,
              '&:hover': {
                borderColor: '#f43f5e',
                bgcolor: 'rgba(244, 63, 94, 0.05)'
              }
            }}
          >
            {joining ? 'Leaving...' : 'Leave Community'}
          </Button>
        ) : (
          <Button
            fullWidth
            onClick={onJoin}
            disabled={joining}
            variant="contained"
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              py: 1.2,
              fontWeight: 800,
              // boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                // boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            {joining ? 'Joining...' : 'Join Community'}
          </Button>
        )}
      </Box>

      {/* Space Rules Section */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography
            sx={{
              fontSize: 12,
              letterSpacing: 2,
              color: '#9ca3af',
            }}
          >
            SPACE RULES
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {rules && rules.length > 0 ? (
            rules.map((rule, index) => (
              <Typography
                key={rule.id}
                sx={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: '#d1d5db',
                }}
              >
                {String(index + 1).padStart(2, '0')}. {rule.rule_text}
              </Typography>
            ))
          ) : (
            <Typography
              sx={{
                fontSize: 13,
                lineHeight: 1.5,
                color: '#9ca3af',
                fontStyle: 'italic',
              }}
            >
              No rules set yet.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Top Contributors Section */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmojiEventsIcon sx={{ fontSize: 14, color: '#9ca3af', mr: 1 }} />
          <Typography
            sx={{
              fontSize: 12,
              letterSpacing: 2,
              color: '#9ca3af',
            }}
          >
            TOP CONTRIBUTORS
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {contributors && contributors.length > 0 ? (
            contributors.map((contributor) => (
              <Box key={contributor.user_id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={contributor.avatar_url}
                  onClick={() => navigate(`/profile/${contributor.username}`)}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: '#6366f1',
                    fontSize: 14,
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                >
                  {contributor.username?.substring(0, 2).toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    onClick={() => navigate(`/profile/${contributor.username}`)}
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#d1d5db',
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                    }}
                  >
                    {contributor.username}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
                    {contributor.points} pts
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography
              sx={{
                fontSize: 13,
                color: '#9ca3af',
                fontStyle: 'italic',
              }}
            >
              No contributors yet.
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const Space = () => {
  const theme = useTheme();
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSnackbar } = useSnackbar();
  const componentName = useRef('Space');
  const [trendingRank, setTrendingRank] = useState(null);
  const [hotRank, setHotRank] = useState(null);

  // Drawer state
  const [openDrawer, setOpenDrawer] = useState(false);

  // Membership state
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [joining, setJoining] = useState(false);

  // Rules and contributors state
  const [rules, setRules] = useState([]);
  const [contributors, setContributors] = useState([]);

  // Thread creation state
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const [creatingThread, setCreatingThread] = useState(false);
  const [showThreadForm, setShowThreadForm] = useState(false);
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [selectedThreadData, setSelectedThreadData] = useState(null);
  const [openCommentThreads, setOpenCommentThreads] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState({});
  const [coverPhotoLoading, setCoverPhotoLoading] = useState(false);
  const coverPhotoInputRef = useRef(null);
  const [coverPhotoBlur, setCoverPhotoBlur] = useState(false);

  // Avatar menu state
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);
  const avatarInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Swipeable view state for mobile
  const [activeStep, setActiveStep] = useState(0);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setActiveStep((prev) => prev < 1 ? prev + 1 : prev),
    onSwipedRight: () => setActiveStep((prev) => prev > 0 ? prev - 1 : prev),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  /**
   * Adds a new space to the state
   * This is used when a space is created from the header
   */
  const addNewSpace = () => {
    // Space page doesn't need to track spaces list, but function exists for Header compatibility
    return
  };

  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL;

  /**
   * Handles cover photo upload to Cloudinary
   *
   * This function uploads the selected cover photo to Cloudinary
   * and updates the space state with the new cover photo URL.
   *
   * Behavior:
   * - Validates file type (images only)
   * - Validates file size (max 5MB)
   * - Uploads to Cloudinary via API
   * - Updates space state with new cover photo URL
   *
   * Hooks used:
   * - useCallback
   */
  const handleCoverPhotoUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      showSnackbar('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('File size must be less than 5MB', 'error');
      return;
    }

    // Show immediate preview using local URL
    const previewUrl = URL.createObjectURL(file);
    setSpace(prev => ({
      ...prev,
      cover_photo_url: previewUrl
    }));

    try {
      setCoverPhotoLoading(true);
      setCoverPhotoBlur(true);

      // Create FormData
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('spaceId', spaceId);

      const response = await fetch(`${API_URL}/api/spaces/cover_photo_upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        showSnackbar('Cover photo updated successfully', 'success');
        setSpace(prev => ({
          ...prev,
          cover_photo_url: result.url
        }));
      } else {
        showSnackbar(result.message || 'Failed to upload cover photo', 'error');
      }
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      showSnackbar('Failed to upload cover photo', 'error');
    } finally {
      setCoverPhotoLoading(false);
      setCoverPhotoBlur(false);
      // Reset file input
      if (coverPhotoInputRef.current) {
        coverPhotoInputRef.current.value = '';
      }
    }
  }, [spaceId, showSnackbar]);

  /**
   * Removes the cover photo from the current space
   * This is used to delete the cover photo by calling the backend API and updating the local state
   *
   * @returns {Promise<void>}
   */
  const handleRemoveCoverPhoto = async () => {
    try {
      const response = await fetch(`${API_URL}/api/spaces/cover_photo_remove`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ spaceId }),
      });

      const result = await response.json();

      if (response.ok) {
        showSnackbar('Cover photo removed successfully', 'success');
        setSpace(prev => ({
          ...prev,
          cover_photo_url: null
        }));
      } else {
        showSnackbar(result.message || 'Failed to remove cover photo', 'error');
      }
    } catch (error) {
      console.error('Error removing cover photo:', error);
      showSnackbar('Failed to remove cover photo', 'error');
    }
  };

  /**
   * Handles space avatar upload to Cloudinary
   *
   * Wrapped in useCallback to memoize the function,
   * preventing unnecessary re-creation on every render.
   *
   * Useful when:
   * - Passing this function as a prop to child components
   * - Using it inside useEffect dependencies
   *
   * Behavior:
   * - Validates file type (images only)
   * - Validates file size (max 5MB)
   * - Shows immediate preview using local URL
   * - Uploads to Cloudinary via API
   * - Updates space state with new avatar URL
   *
   * Dependencies:
   * - spaceId: Current space ID
   * - showSnackbar: Snackbar notification function
   *
   * Hooks used:
   * - useCallback
   */
  const handleAvatarUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      showSnackbar('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('File size must be less than 5MB', 'error');
      return;
    }

    // Show immediate preview using local URL
    const previewUrl = URL.createObjectURL(file);
    setSpace(prev => ({
      ...prev,
      avatar_url: previewUrl
    }));

    try {
      setAvatarLoading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('spaceId', spaceId);

      const response = await fetch(`${API_URL}/api/spaces/avatar_upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        showSnackbar('Avatar updated successfully', 'success');
        setSpace(prev => ({
          ...prev,
          avatar_url: result.url
        }));
      } else {
        showSnackbar(result.message || 'Failed to upload avatar', 'error');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showSnackbar('Failed to upload avatar', 'error');
    } finally {
      setAvatarLoading(false);
      setAvatarMenuOpen(false);
      // Reset file input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  }, [spaceId, showSnackbar]);

  /**
   * Removes the avatar from the current space
   * This is used to delete the avatar by calling the backend API and updating the local state
   *
   * @returns {Promise<void>}
   */
  const handleAvatarRemove = async () => {
    try {
      const response = await fetch(`${API_URL}/api/spaces/avatar_remove`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ spaceId }),
      });

      const result = await response.json();

      if (response.ok) {
        showSnackbar('Avatar removed successfully', 'success');
        setSpace(prev => ({
          ...prev,
          avatar_url: null
        }));
      } else {
        showSnackbar(result.message || 'Failed to remove avatar', 'error');
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      showSnackbar('Failed to remove avatar', 'error');
    } finally {
      setAvatarMenuOpen(false);
    }
  };

  /**
   * Handles joining a space
   *
   * Wrapped in useCallback to memoize the function,
   * preventing unnecessary re-creation on every render.
   *
   * Useful when:
   * - Passing this function as a prop to child components
   * - Using it inside useEffect dependencies
   *
   * Behavior:
   * - Sends POST request to join space API
   * - Updates membership state on success
   * - Increments member count on success
   * - Shows snackbar notification
   *
   * Dependencies:
   * - spaceId: Current space ID
   * - showSnackbar: Snackbar notification function
   *
   * Hooks used:
   * - useCallback
   */
  const handleJoinSpace = useCallback(async () => {
    try {
      setJoining(true);
      const response = await apiRequest(`/api/spaces/${spaceId}/join`, {
        method: 'POST'
      });
      const result = await response.json();

      if (response.ok) {
        setIsMember(true);
        setMemberCount(prev => prev + 1);
        showSnackbar('Joined space successfully', 'success');
      } else {
        showSnackbar(result.error_message || 'Failed to join space', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to join space', 'error');
    } finally {
      setJoining(false);
    }
  }, [spaceId, showSnackbar]);

  /**
   * Handles leaving a space
   *
   * Wrapped in useCallback to memoize the function,
   * preventing unnecessary re-creation on every render.
   *
   * Useful when:
   * - Passing this function as a prop to child components
   * - Using it inside useEffect dependencies
   *
   * Behavior:
   * - Sends DELETE request to leave space API
   * - Updates membership state on success
   * - Decrements member count on success
   * - Shows snackbar notification
   *
   * Dependencies:
   * - spaceId: Current space ID
   * - showSnackbar: Snackbar notification function
   *
   * Hooks used:
   * - useCallback
   */
  const handleLeaveSpace = useCallback(async () => {
    try {
      setJoining(true);
      const response = await apiRequest(`/api/spaces/${spaceId}/leave`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (response.ok) {
        setIsMember(false);
        setMemberCount(prev => prev - 1);
        showSnackbar('Left space successfully', 'success');
      } else {
        showSnackbar(result.error_message || 'Failed to leave space', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to leave space', 'error');
    } finally {
      setJoining(false);
    }
  }, [spaceId, showSnackbar]);

  /**
   * Fetches space data from API
   *
   * Wrapped in useCallback to memoize the function,
   * preventing unnecessary re-creation on every render.
   *
   * Useful when:
   * - Calling this function multiple times across the component
   * - Using it inside useEffect dependencies
   *
   * Behavior:
   * - Sets loading state to true before request
   * - Fetches space data from API for the current spaceId
   * - Handles response parsing and error state management
   * - Updates space state with response data
   * - Updates membership status and member count from response
   * - API returns { success: true, data: { space: {...} } } format per spec
   *
   * Dependencies:
   * - spaceId: Current space ID from URL params
   *
   * Hooks used:
   * - useCallback
   */
  const fetchSpace = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/api/spaces/${spaceId}`);
      const result = await response.json();

      // Check response status and update state accordingly
      // API returns { success: true, data: { space: {...} } } format per spec
      if (response.ok) {
        const spaceData = result.data?.space || result.space;
        setSpace(spaceData);
        setIsMember(spaceData?.isMember || false);
        setMemberCount(spaceData?.memberCount || 0);
      } else {
        setError(result.message || 'Failed to load space');
      }
    } catch (error) {
      setError('Failed to load space');
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  /**
   * Fetch rules for the space
   * This is used to load dynamic space rules
   */
  const fetchRules = useCallback(async () => {
    try {
      const response = await apiRequest(`/api/spaces/${spaceId}/rules`);
      const result = await response.json();

      if (response.ok) {
        setRules(result.rules || []);
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    }
  }, [spaceId]);

  /**
   * Fetch top contributors for the space
   * This is used to load real contributor data with points
   */
  const fetchContributors = useCallback(async () => {
    try {
      const response = await apiRequest(`/api/spaces/${spaceId}/contributors`);
      const result = await response.json();

      if (response.ok) {
        setContributors(result.contributors || []);
      }
    } catch (error) {
      console.error('Failed to fetch contributors:', error);
    }
  }, [spaceId]);

  /**
   * Checks if current space is in trending spaces
   * This is used to display trending badge on space page
   */
  const checkTrendingRank = useCallback(async () => {
    try {
      const response = await apiRequest('/api/spaces/trending');
      const result = await response.json();
      if (result.success) {
        const rank = result.spaces.findIndex(s => s.id === parseInt(spaceId));
        if (rank !== -1) {
          setTrendingRank(rank + 1); // 1-based ranking
        } else {
          setTrendingRank(null);
        }
      }
    } catch (error) {
      console.error('Failed to check trending rank:', error);
    }
  }, [spaceId]);

  /**
   * Checks if current space is in hot spaces
   * This is used to display hot badge on space page
   */
  const checkHotRank = useCallback(async () => {
    try {
      const response = await apiRequest('/api/maincontent/hot_spaces');
      const result = await response.json();
      if (result.success) {
        const rank = result.spaces.findIndex(s => s.id === parseInt(spaceId));
        if (rank !== -1) {
          setHotRank(rank + 1); // 1-based ranking
        } else {
          setHotRank(null);
        }
      }
    } catch (error) {
      console.error('Failed to check hot rank:', error);
    }
  }, [spaceId]);

  /**
   * Fetches threads for a specific space
   *
   * Wrapped in useCallback to memoize the function,
   * preventing unnecessary re-creation on every render.
   *
   * Useful when:
   * - Calling this function multiple times across the component
   * - Using it inside useEffect dependencies
   *
   * Behavior:
   * - Sets loading state to true before request
   * - Fetches threads from API for the given space ID
   * - Updates threads state with response data
   * - Handles errors gracefully with console logging
   *
   * Dependencies:
   * - No external dependencies → function remains stable
   *
   * Hooks used:
   * - useCallback
   */
  const fetchThreads = useCallback(async (spaceId) => {
    try {
      setThreadsLoading(true);
      const response = await apiRequest(`/api/spaces/${spaceId}/threads`);
      const result = await response.json();

      if (response.ok && result.success) {
        const threads = result.threads || [];
        setThreads(threads);

        // Set all threads as expanded by default
        const expandedState = {};
        threads.forEach(thread => {
          expandedState[thread.id] = true;
        });

        setExpandedThreads(expandedState);
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setThreadsLoading(false);
    }
  }, []);

  /**
   * Creates a new thread in the current space
   *
   * Wrapped in useCallback to memoize the function,
   * preventing unnecessary re-creation on every render.
   *
   * Useful when:
   * - Passing this function as a prop to child components
   * - Using it inside useEffect dependencies
   *
   * Behavior:
   * - Validates that title and content are not empty
   * - Uploads base64 images to Cloudinary using utility function
   * - Sends processed content to backend API
   * - Refreshes threads list after successful creation
   * - Clears form and resets editor state
   *
   * Dependencies:
   * - formData: Thread title and content
   * - spaceId: Current space ID
   * - showSnackbar: Snackbar notification function
   *
   * Hooks used:
   * - useCallback
   */
  const handleCreateThread = useCallback(async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showSnackbar('Please fill in both title and content', 'error');
      return;
    }

    try {
      setCreatingThread(true);

      // Upload base64 images to Cloudinary using utility function
      const processedContent = await uploadImagesToCloudinary(formData.content, showSnackbar);

      // Send processed content to backend
      const response = await apiRequest(`/api/maincontent/create_thread`, {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          content: processedContent, // Store HTML content with Cloudinary URLs
          spaceId: spaceId
        })
      });

      const result = await response.json();

      if (response.ok) {
        showSnackbar('Thread created successfully', 'success');
        setFormData({ title: '', content: '' });
        setShowThreadForm(false);

        // Add new thread to state using returned data from backend
        if (result.thread) {
          const newThread = {
            ...result.thread,
            timeAgo: 'Just now',
            comment_count: 0,
            userVote: 0
          };
          setThreads(prev => [newThread, ...prev]);
        }

        // Force QuillEditor remount to clear content
        setEditorKey(prev => prev + 1);

        return result;
      } else {
        showSnackbar(result.error_message || 'Failed to create thread', 'error');
        return result;
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      showSnackbar('Error creating thread', 'error');
    } finally {
      setCreatingThread(false);
    }
  }, [formData, spaceId, showSnackbar]);

  // Fetch space details when spaceId changes from URL params
  useEffect(() => {
    if (spaceId) {
      fetchSpace();
      fetchRules();
      fetchContributors();
    }
  }, [spaceId, fetchSpace, fetchRules, fetchContributors]);

  /**
   * Navigate to space settings page
   * This is used when owner clicks settings icon
   */
  const handleSettingsClick = useCallback(() => {
    navigate(`/spaces/${spaceId}/settings`);
  }, [spaceId, navigate]);

  // Check trending rank when space is loaded
  useEffect(() => {
    if (space && !loading) {
      checkTrendingRank();
      checkHotRank();
    }
  }, [space, loading, checkTrendingRank, checkHotRank]);

  // Fetch threads for the space after space data is loaded
  useEffect(() => {
    if (space && !loading) {
      fetchThreads(space.id);
    }
  }, [space, loading, fetchThreads]);

  /**
   * Handle opening comment panel for a thread
   * This is used to open the comment panel when user clicks on comment button
   * @param {object} thread - The thread object containing thread data
   */
  const handleCommentOpen = useCallback((thread) => {
    setSelectedThreadData(thread);
    setOpenCommentThreads(prev => ({
      ...prev,
      [thread.id]: true
    }));
  }, []);

  /**
   * Handle closing comment panel for a thread
   * This is used to close the comment panel for a specific thread
   * @param {string} threadId - The ID of the thread to close comments for
   */
  const handleCommentClose = useCallback((threadId) => {
    setOpenCommentThreads(prev => ({
      ...prev,
      [threadId]: false
    }));
  }, []);

  /**
   * Handle thread expansion state change
   * This is used to toggle the expanded state of thread accordions
   * @param {string} threadId - The ID of the thread
   * @param {boolean} isExpanded - Whether the thread should be expanded
   */
  const handleExpandedChange = useCallback((threadId, isExpanded) => {
    setExpandedThreads(prev => ({
      ...prev,
      [threadId]: isExpanded
    }));
  }, []);

  /**
   * Show loading state while fetching data
   */
  if (loading) {
    return (
      <Grid container>
        <Grid size={12}>
          <Header
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
            onSpaceCreated={addNewSpace}
          />
        </Grid>
        <Grid size={12}>
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        </Grid>
        <Grid size={12} sx={{ mt: 4, mb: 4, p: 2 }}>
          <Skeleton variant="text" height={50} width="60%" />
          <Skeleton variant="text" height={24} width="80%" sx={{ mt: 1 }} />
        </Grid>
      </Grid>
    );
  }


  return (
    <Grid container>
      {/* Header */}
      <Grid size={12}>
        <Header
          openDrawer={openDrawer}
          setOpenDrawer={setOpenDrawer}
          onSpaceCreated={addNewSpace}
        />
      </Grid>

      {/* Cover Photo Section */}
      <Grid size={12}>
        <Box
          sx={{
            width: '100%',
            height: { xs: 230, sm: 260, md: 320 },
            backgroundColor: 'background.paper',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            overflow: 'hidden',
            borderRadius: { xs: 0, md: 2 },
            mb: { xs: 2, md: 4 },
            boxShadow: theme.shadows[4]
          }}
        >

          <input
            type="file"
            ref={coverPhotoInputRef}
            onChange={handleCoverPhotoUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {space?.userRole === 'owner' && (
            <>
              {space?.cover_photo_url ? (
                <StyledButton
                  onClick={handleRemoveCoverPhoto}
                  startIcon={<NoPhotographyRoundedIcon />}
                  variant="danger"
                  sx={{
                    zIndex: 30,
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    '& .MuiButton-startIcon': {
                      mr: { xs: 0, sm: 1 }
                    }
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Remove Photo</Box>
                </StyledButton>
              ) : (
                <CustomButton
                  onClick={() => coverPhotoInputRef.current?.click()}
                  startIcon={<PhotoCameraRoundedIcon />}
                  sx={{
                    cursor: 'pointer',
                    zIndex: 30,
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    '& .MuiButton-startIcon': {
                      mr: { xs: 0, sm: 1 }
                    }
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Upload Cover Photo</Box>
                </CustomButton>
              )}
            </>
          )}

          {/* Cover Photo Backdrop */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: space?.cover_photo_url
                ? `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url(${space.cover_photo_url})`
                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: coverPhotoLoading ? 0.5 : 1,
              filter: coverPhotoBlur ? 'blur(4px)' : 'none',
              transition: 'all 0.5s ease-in-out'
            }}
          />

          {/* Space Information - Glassmorphism Overlay */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 20,
              width: '100%',
              p: { xs: 2, sm: 3, md: 4 },
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'flex-end' },
              gap: { xs: 2, sm: 3 },
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
              backdropFilter: 'blur(4px)'
            }}
          >
            {/* Space Avatar */}
            <Box
              onClick={(e) => {
                if (space?.userRole === 'owner') {
                  setAvatarMenuAnchor(e.currentTarget);
                  setAvatarMenuOpen(true);
                }
              }}
              sx={{
                position: 'relative',
                zIndex: 30,
                cursor: space?.userRole === 'owner' ? 'pointer' : 'default',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' }
              }}
            >
              <Avatar
                src={space?.avatar_url}
                sx={{
                  width: { xs: 70, sm: 100, md: 120 },
                  height: { xs: 70, sm: 100, md: 120 },
                  backgroundColor: 'primary.main',
                  fontSize: { xs: 32, sm: 40, md: 48 },
                  border: '4px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  opacity: avatarLoading ? 0.5 : 1
                }}
              >
                {space?.name?.charAt(0)?.toUpperCase() || 'S'}
              </Avatar>
            </Box>

            {/* Info Text */}
            <Box sx={{ flex: 1, textAlign: 'left', pb: { xs: 1, sm: 0 } }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: 'white',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  mb: 0.5
                }}
              >
                {space?.name || 'Space Name'}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  maxWidth: '600px',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  lineHeight: 1.4,
                  mb: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {space?.description || 'Space description goes here'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {trendingRank && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: 'rgba(99, 102, 241, 0.9)',
                      px: 1.2,
                      py: 0.4,
                      borderRadius: '20px',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <EmojiEventsIcon sx={{ fontSize: 14, color: 'white' }} />
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem' }}>
                      #{trendingRank} TRENDING
                    </Typography>
                  </Box>
                )}
                {hotRank && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: 'rgba(244, 63, 94, 0.9)',
                      px: 1.2,
                      py: 0.4,
                      borderRadius: '20px',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <Flame size={14} color="white" />
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem' }}>
                      #{hotRank} HOT
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Avatar Menu */}
        <Menu
          anchorEl={avatarMenuAnchor}
          open={avatarMenuOpen}
          onClose={() => setAvatarMenuOpen(false)}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
        >
          <MenuItem
            onClick={() => {
              setAvatarMenuOpen(false);
              avatarInputRef.current?.click();
            }}
          >
            <PhotoCameraRoundedIcon sx={{ mr: 1 }} />
            Change Photo
          </MenuItem>
          {space?.avatar_url && (
            <MenuItem onClick={handleAvatarRemove}>
              <NoPhotographyRoundedIcon sx={{ mr: 1 }} />
              Remove Photo
            </MenuItem>
          )}
        </Menu>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box
            sx={{
              position: 'relative',
              cursor: 'pointer',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -4,
                left: 0,
                width: '100%',
                height: 2,
                bgcolor: 'primary.main',
                transform: 'scaleX(1)',
                transition: 'transform 0.3s ease'
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', fontSize: { xs: '0.85rem', md: '1.1rem' }, letterSpacing: '0.5px' }}>
              Threads
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'relative',
              cursor: 'pointer',
              opacity: 0.5,
              transition: 'opacity 0.3s',
              '&:hover': { opacity: 1 },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -4,
                left: 0,
                width: '100%',
                height: 2,
                bgcolor: 'primary.main',
                transform: 'scaleX(0)',
                transition: 'transform 0.3s ease'
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', fontSize: { xs: '0.85rem', md: '1.1rem' }, letterSpacing: '0.5px' }}>
              Lists
            </Typography>
          </Box>
        </Box>

        {!showThreadForm && (
          <CustomButton
            onClick={() => setShowThreadForm(true)}
            sx={{
              fontSize: { xs: '10px', sm: '11px' },
              borderRadius: '20px',
              px: { xs: 2, sm: 3 },
              // boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                transform: 'translateY(-2px)',
                // boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)'
              }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Create Thread</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Create</Box>
          </CustomButton>
        )}
      </Box>

      {/* Thread List and About Space Card */}
      <Grid sx={{ width: '100%', justifyContent: 'center' }} container spacing={2}>
        {/* Mobile: Swipeable View */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%', pb: 4 }}>
          <Box {...swipeHandlers} sx={{ minHeight: '400px' }}>
            {activeStep === 0 && (
              <Box sx={{ px: 1 }}>
                {/* Thread Creation Form */}
                {showThreadForm && (
                  <Box sx={{
                    mb: 4,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    // border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: theme.shadows[2]
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={user?.avatar_url}
                        onClick={() => navigate(`/profile/${user?.username}`)}
                        sx={{
                          width: 36,
                          height: 36,
                          backgroundColor: 'primary.main',
                          fontSize: 18,
                          mr: 1.5,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: 'divider'
                        }}
                      >
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Create a New Thread
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <TextFieldThreadly
                        label="What's on your mind?"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        maxLength={300}
                        showCharCount
                      />
                    </Box>

                    <Box sx={{
                      mb: 2,
                      borderRadius: 1,
                      overflow: 'hidden',
                      // border: '1px solid',
                      // borderColor: 'divider'
                    }}>
                      <QuillEditor
                        key={editorKey}
                        isExpanded={showThreadForm}
                        value={formData.content}
                        onChange={(htmlContent) => {
                          setFormData(prev => ({ ...prev, content: htmlContent }));
                        }}
                        placeholder="Share your thoughts..."
                        height="150px"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setShowThreadForm(false);
                          setFormData({ title: '', content: '' });
                        }}
                        disabled={creatingThread}
                        sx={{
                          textTransform: 'none',
                          borderRadius: '10px',
                          px: 3
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleCreateThread}
                        sx={{
                          textTransform: 'none',
                          borderRadius: '10px',
                          px: 3,
                          fontWeight: 700
                        }}
                      >
                        {creatingThread ? 'Posting...' : 'Post Thread'}
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Thread List */}
                {threadsLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Skeleton variant="rectangular" height={150} />
                    <Skeleton variant="rectangular" height={150} />
                  </Box>
                ) : threads.length === 0 ? (
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: 2,
                      minHeight: 200,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No posts have been made yet for this space
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {threads.map((thread) => (
                      < ThreadContent
                        componentRendered={componentName}
                        key={thread.id}
                        net_score={thread.net_score}
                        spaceAvatar={thread.avatar_url}
                        postedBy={thread.username}
                        timeAgo={thread.timeAgo}
                        title={thread.title}
                        content={thread.content}
                        comments={thread.comment_count || 0}
                        shares={0}
                        spaceName={thread.space_name}
                        spaceId={spaceId}
                        threadId={thread.id}
                        userVote={thread.userVote}
                        userAvatar={thread.user_avatar_url}
                        expanded={expandedThreads[thread.id] !== false}
                        onExpandedChange={(isExpanded) => handleExpandedChange(thread.id, isExpanded)}
                        onCommentOpen={() => handleCommentOpen(thread)}
                        onVoteUpdate={(updatedThread) => {
                          setThreads(prev =>
                            prev.map(t =>
                              t.id === updatedThread.id ? { ...t, ...updatedThread } : t
                            )
                          );
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* Comment Panels */}
                {Object.entries(openCommentThreads).map(([threadId, isOpen]) => (
                  isOpen && (
                    <CommentPanel
                      key={threadId}
                      isClose={() => handleCommentClose(threadId)}
                      isOpen={isOpen}
                      threadId={threadId}
                      threadData={selectedThreadData}
                      onCommentCountUpdate={(newCount) => {
                        setThreads(prev => {
                          const updated = prev.map(thread => {
                            return thread.id === parseInt(threadId) ? { ...thread, comment_count: newCount } : thread;
                          });
                          return updated;
                        });
                      }}
                    />
                  )
                ))}
              </Box>
            )}
            {activeStep === 1 && (
              <Box sx={{ p: 0, width: '100%' }}>
                <AboutSpaceCard
                  space={space}
                  isMember={isMember}
                  memberCount={memberCount}
                  onJoin={handleJoinSpace}
                  onLeave={handleLeaveSpace}
                  joining={joining}
                  rules={rules}
                  contributors={contributors}
                  isOwner={space?.userRole === 'owner'}
                  onSettingsClick={handleSettingsClick}
                  isMobile={true}
                />
              </Box>
            )}
          </Box>

          {/* Mobile Stepper at the bottom */}
          <MobileStepper
            steps={2}
            position="static"
            activeStep={activeStep}
            sx={{
              justifyContent: 'center',
              backgroundColor: 'transparent',
              mt: 2,
              '& .MuiMobileStepper-dot': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                width: 6,
                height: 6
              },
              '& .MuiMobileStepper-dotActive': {
                backgroundColor: 'primary.main',
                width: 10,
                height: 6,
                borderRadius: '3px'
              }
            }}
          />
        </Box>

        {/* Desktop: Regular Layout */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, width: '100%', pb: 8 }}>
          <Grid container spacing={2}>
            {/* Thread List */}
            <Grid size={9}>
              {/* Scrollable Thread List */}
              <Box sx={{ p: 2 }}>
                {/* Thread Creation Form */}
                {showThreadForm && (
                  <Box sx={{
                    mb: 4,
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: theme.shadows[3],
                    animation: 'fadeIn 0.3s ease-out'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        src={user?.avatar_url}
                        onClick={() => navigate(`/profile/${user?.username}`)}
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: 'primary.main',
                          fontSize: 24,
                          mr: 2,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: 'divider',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.1)' }
                        }}
                      >
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                          Create a New Thread
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Share something with the {space?.name} community
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2.5 }}>
                      <TextFieldThreadly
                        label="Thread Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        maxLength={300}
                        showCharCount
                      />
                    </Box>

                    <Box sx={{
                      mb: 3,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'border-color 0.2s',
                      '&:focus-within': { borderColor: 'primary.main' }
                    }}>
                      <QuillEditor
                        key={editorKey}
                        isExpanded={showThreadForm}
                        value={formData.content}
                        onChange={(htmlContent) => {
                          setFormData(prev => ({ ...prev, content: htmlContent }));
                        }}
                        placeholder="Share your thoughts, ideas, or questions..."
                        height="200px"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="text"
                        onClick={() => {
                          setShowThreadForm(false);
                          setFormData({ title: '', content: '' });
                        }}
                        disabled={creatingThread}
                        sx={{
                          textTransform: 'none',
                          borderRadius: '12px',
                          px: 4,
                          fontWeight: 700,
                          color: 'text.secondary',
                          '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.05)' }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleCreateThread}
                        disabled={creatingThread || !formData.title.trim()}
                        sx={{
                          textTransform: 'none',
                          borderRadius: '12px',
                          px: 5,
                          py: 1.2,
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        {creatingThread ? 'Posting...' : 'Post Thread'}
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Thread List */}
                {threadsLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Skeleton variant="rectangular" height={150} />
                    <Skeleton variant="rectangular" height={150} />
                  </Box>
                ) : threads.length === 0 ? (
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: 2,
                      minHeight: 200,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No posts have been made yet for this space
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {threads.map((thread) => (
                      <ThreadContent
                        componentRendered={componentName}
                        key={thread.id}
                        net_score={thread.net_score}
                        spaceAvatar={thread.avatar_url}
                        postedBy={thread.username}
                        timeAgo={thread.timeAgo}
                        title={thread.title}
                        content={thread.content}
                        comments={thread.comment_count || 0}
                        shares={0}
                        spaceName={thread.space_name}
                        spaceId={spaceId}
                        threadId={thread.id}
                        userVote={thread.userVote}
                        userAvatar={thread.user_avatar_url}
                        expanded={expandedThreads[thread.id] !== false}
                        onExpandedChange={(isExpanded) => handleExpandedChange(thread.id, isExpanded)}
                        onCommentOpen={() => handleCommentOpen(thread)}
                        onVoteUpdate={(updatedThread) => {
                          setThreads(prev =>
                            prev.map(t =>
                              t.id === updatedThread.id ? { ...t, ...updatedThread } : t
                            )
                          );
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* Comment Panels */}
                {Object.entries(openCommentThreads).map(([threadId, isOpen]) => (
                  isOpen && (
                    <CommentPanel
                      key={threadId}
                      isClose={() => handleCommentClose(threadId)}
                      isOpen={isOpen}
                      threadId={threadId}
                      threadData={selectedThreadData}
                      onCommentCountUpdate={(newCount) => {
                        setThreads(prev => {
                          const updated = prev.map(thread => {
                            return thread.id === parseInt(threadId) ? { ...thread, comment_count: newCount } : thread;
                          });
                          return updated;
                        });
                      }}
                    />
                  )
                ))}

              </Box>
            </Grid>

            {/* About Space Card */}
            <Grid size={3} sx={{ display: { xs: 'none', md: 'block' }, mt: 2 }}>
              <AboutSpaceCard
                space={space}
                isMember={isMember}
                memberCount={memberCount}
                onJoin={handleJoinSpace}
                onLeave={handleLeaveSpace}
                joining={joining}
                rules={rules}
                contributors={contributors}
                isOwner={space?.userRole === 'owner'}
                onSettingsClick={handleSettingsClick}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Bottom Navigation */}
        <BottomNav openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
      </Grid>
    </Grid >
  );
};

export default Space;
