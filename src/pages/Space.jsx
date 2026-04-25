import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InfoIcon from '@mui/icons-material/Info';
import NoPhotographyRoundedIcon from '@mui/icons-material/NoPhotographyRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import { Avatar, Box, Button, Grid, MobileStepper, Paper, Skeleton, Typography } from '@mui/material';
import { Flame } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
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
const AboutSpaceCard = ({ space, isMember, memberCount, onJoin, onLeave, joining }) => {
  return (
    <Paper sx={{ backgroundColor: 'paper.backgroundColor', p: 2, borderRadius: 1 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <InfoIcon sx={{ fontSize: 14, color: '#9ca3af', mr: 1 }} />
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: 2,
            color: '#9ca3af',
          }}
        >
          ABOUT SPACE
        </Typography>
      </Box>

      {/* Description */}
      <Typography
        sx={{
          fontSize: 14,
          lineHeight: 1.6,
          color: '#d1d5db',
          mb: 3,
        }}
      >
        {space?.description || 'No description available'}
      </Typography>

      {/* Stats */}
      <Box
        sx={{
          display: 'flex',
          gap: 6,
          mb: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
            {memberCount || 0}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
            MEMBERS
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 700,
              color: '#22c55e',
            }}
          >
            —
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
            ONLINE
          </Typography>
        </Box>
      </Box>

      {/* Created Date */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 3,
          color: '#9ca3af',
        }}
      >
        <CalendarTodayIcon sx={{ fontSize: 16 }} />
        <Typography sx={{ fontSize: 12 }}>
          Created {space?.createdAt || 'Unknown date'}
        </Typography>
      </Box>

      {/* Button */}
      {isMember ? (
        <StyledButton
          onClick={onLeave}
          disabled={joining}
          variant="danger"
          sx={{
            width: '100%',
          }}
        >
          {joining ? 'Processing...' : 'Leave Space'}
        </StyledButton>
      ) : (
        <CustomButton
          onClick={onJoin}
          disabled={joining}
          fetchOnclick={onJoin}
          sx={{
            width: '100%',
          }}
        >
          {joining ? 'Processing...' : 'Join Space'}
        </CustomButton>
      )}

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
          <Typography
            sx={{
              fontSize: 13,
              lineHeight: 1.5,
              color: '#d1d5db',
            }}
          >
            01. Be respectful and maintain academic rigor.
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              lineHeight: 1.5,
              color: '#d1d5db',
            }}
          >
            02. No self-promotion or low-effort link drops.
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              lineHeight: 1.5,
              color: '#d1d5db',
            }}
          >
            03. Protect user privacy in shared case studies.
          </Typography>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#6366f1',
                fontSize: 14,
              }}
            >
              DT
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>
                Dr. Aris Thorne
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
                2450 pts
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#ec4899',
                fontSize: 14,
              }}
            >
              LV
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>
                Lila Vance
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
                1920 pts
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#10b981',
                fontSize: 14,
              }}
            >
              JG
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>
                Julian Gray
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
                1680 pts
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const Space = () => {
  const { spaceId } = useParams();
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
  const [coverPhotoLoading, setCoverPhotoLoading] = useState(false);
  const coverPhotoInputRef = useRef(null);
  const [coverPhotoBlur, setCoverPhotoBlur] = useState(false);

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
        setThreads(result.threads || []);
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
    }
  }, [spaceId, fetchSpace]);

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
            height: { xs: 250, md: 420 },
            backgroundColor: 'background.paper',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pb: 30,
            '&:hover': {
              opacity: 0.8
            }
          }}
        >

          <input
            type="file"
            ref={coverPhotoInputRef}
            onChange={handleCoverPhotoUpload}
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

          {/* Cover Photo Placeholder */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundImage: space?.cover_photo_url
                ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${space.cover_photo_url})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: coverPhotoLoading ? 0.5 : 1,
              filter: coverPhotoBlur ? 'blur(4px)' : 'none'
            }}
          >

            {/* Space Information Section */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 20,
                textAlign: 'center',
                p: 3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'uppercase' }}>
                  {space?.name || 'Space Name'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {trendingRank && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'primary.main',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2
                      }}
                    >
                      <EmojiEventsIcon sx={{ fontSize: 16, color: 'white' }} />
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        #{trendingRank} Trending
                      </Typography>
                    </Box>
                  )}
                  {hotRank && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'primary.main',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2
                      }}
                    >
                      <Flame size={16} color="white" />
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        #{hotRank} Hot
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              <Typography variant="body1" sx={{ color: 'text.primary', mt: 1 }}>
                {space?.description || 'Space description goes here'}
              </Typography>
            </Box>
          </Box>

          {/* Space Avatar - Centered */}
          <Avatar
            src={space?.avatar_url}
            sx={{
              width: 120,
              height: 120,
              backgroundColor: 'primary.main',
              fontSize: 48,
              zIndex: 10,
              border: '4px solid',
              borderColor: 'background.default',
              position: 'absolute',
              bottom: -60,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            {space?.name?.charAt(0)?.toUpperCase() || 'S'}
          </Avatar>
        </Box>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', textTransform: 'uppercase', fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Threads
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', textTransform: 'uppercase', fontSize: { xs: '1rem', md: '1.25rem' }, ml: { xs: 0, sm: 0.5 } }}>
            Lists
          </Typography>
        </Box>

        {!showThreadForm && (
          <CustomButton
            onClick={() => setShowThreadForm(true)}
            sx={{
              fontSize: { xs: '9px', sm: '10px' },
              minWidth: { xs: 'auto', sm: 'auto' },
              px: { xs: 1.5, sm: 2 }
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
        <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
          <MobileStepper
            steps={2}
            position="static"
            activeStep={activeStep}
            sx={{
              justifyContent: 'center',
              backgroundColor: 'transparent',
              mt: 2,
              '& .MuiMobileStepper-dot': {
                backgroundColor: 'divider'
              },
              '& .MuiMobileStepper-dotActive': {
                backgroundColor: 'primary.main'
              }
            }}
          />
          <Box {...swipeHandlers} sx={{ p: 2 }}>
            {activeStep === 0 && (
              <Box>
                {/* Thread Creation Form */}
                {showThreadForm && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        src={user?.avatar_url}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: 'primary.main',
                          fontSize: 20,
                          mr: 1
                        }}
                      >
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <TextFieldThreadly
                        label="Thread Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        maxLength={300}
                        showCharCount
                      />
                    </Box>
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handleCreateThread}
                        sx={{ textTransform: 'none' }}
                      >
                        {creatingThread ? 'Creating...' : 'Create Thread'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setShowThreadForm(false);
                          setFormData({ title: '', content: '' });
                        }}
                        disabled={creatingThread}
                        sx={{ textTransform: 'none' }}
                      >
                        Cancel
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
              <Box sx={{ p: 2 }}>
                <AboutSpaceCard
                  space={space}
                  isMember={isMember}
                  memberCount={memberCount}
                  onJoin={handleJoinSpace}
                  onLeave={handleLeaveSpace}
                  joining={joining}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Desktop: Regular Layout */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, width: '100%' }}>
          <Grid container spacing={2}>
            {/* Thread List */}
            <Grid size={9}>
              {/* Scrollable Thread List */}
              <Box sx={{ p: 2 }}>
                {/* Thread Creation Form */}
                {showThreadForm && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        src={user?.avatar_url}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: 'primary.main',
                          fontSize: 20,
                          mr: 1
                        }}
                      >
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <TextFieldThreadly
                        label="Thread Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        maxLength={300}
                        showCharCount
                      />
                    </Box>
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handleCreateThread}
                        sx={{ textTransform: 'none' }}
                      >
                        {creatingThread ? 'Creating...' : 'Create Thread'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setShowThreadForm(false);
                          setFormData({ title: '', content: '' });
                        }}
                        disabled={creatingThread}
                        sx={{ textTransform: 'none' }}
                      >
                        Cancel
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
              />
            </Grid>
          </Grid>
        </Box>

        {/* Bottom Navigation */}
        <BottomNav openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
      </Grid>
    </Grid>
  );
};

export default Space;
