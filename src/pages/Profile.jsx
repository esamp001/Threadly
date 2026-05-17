import {
  AlternateEmailOutlined,
  CalendarTodayOutlined,
  CheckOutlined,
  CloseOutlined,
  EmojiEventsOutlined,
  ExpandLess,
  ExpandMore,
  TravelExploreOutlined
} from '@mui/icons-material';
import {
  alpha,
  Avatar, Box, Button,
  CircularProgress,
  Container, Divider, Grid, Paper,
  Skeleton, Tab, Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/HomeComponents/BottomNav';
import Header from '../components/HomeComponents/Header';
import ExpBar from '../components/Profile/ExpBar';
import FollowButton from '../components/Profile/FollowButton';
import ProfileComments from '../components/Profile/ProfileComments';
import ProfileEdit from '../components/Profile/ProfileEdit';
import ProfileThreads from '../components/Profile/ProfileThreads';
import apiRequest from '../config/api';
import { useAuth } from '../context/AuthContext/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';

/**
 * User profile page with Reddit-style layout
 * Shows user information, posts, comments, and activity
 */
const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [comments, setComments] = useState([]);
  const [threads, setThreads] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [hasMoreThreads, setHasMoreThreads] = useState(true);
  const [commentsPage, setCommentsPage] = useState(1);
  const [threadsPage, setThreadsPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [bioUpdating, setBioUpdating] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  // Automatically update expansion when switching between mobile/desktop views
  useEffect(() => {
    setIsExpanded(!isMobile);
  }, [isMobile]);

  // Sync editedBio with profile bio when editing starts
  useEffect(() => {
    if (profile) {
      setEditedBio(profile.bio || '');
    }
  }, [profile, isEditingBio]);

  /**
   * Handle bio update
   */
  const handleBioSave = async () => {
    setBioUpdating(true);
    try {
      const response = await apiRequest.put('/users/profile', { bio: editedBio });
      if (response.data.success) {
        setProfile(prev => ({ ...prev, bio: editedBio }));
        setIsEditingBio(false);
        showSnackbar('Bio updated successfully', 'success');
      }
    } catch (error) {
      showSnackbar(error.response?.data?.error_message || 'Failed to update bio', 'error');
    } finally {
      setBioUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM yyyy');
    } catch (_) {
      return 'Unknown';
    }
  };

  /**
   * Fetch user profile data
   * This is used to get basic user information and statistics
   */
  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiRequest(`/api/users/${username}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else {
        const data = await response.json().catch(() => ({}));
        showSnackbar(data.error_message || 'User not found', 'error');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showSnackbar('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }, [username, showSnackbar]);

  /**
   * Fetch user's comments with pagination
   * This is used to load comments for the profile page
   */
  const fetchComments = useCallback(async (page = 1, append = false) => {
    if (!append) setCommentsLoading(true);

    try {
      const response = await apiRequest(`/api/users/${username}/comments?page=${page}&limit=20`);
      if (response.ok) {
        const result = await response.json();
        if (append) {
          setComments(prev => [...prev, ...result.comments]);
        } else {
          setComments(result.comments);
        }
        setHasMoreComments(result.hasMore);
        setCommentsPage(page);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      showSnackbar('Failed to load comments', 'error');
    } finally {
      setCommentsLoading(false);
    }
  }, [username, showSnackbar]);

  /**
   * Fetch user's threads with pagination
   * This is used to load threads for the profile page
   */
  const fetchThreads = useCallback(async (page = 1, append = false) => {
    if (!append) setThreadsLoading(true);

    try {
      const response = await apiRequest(`/api/users/${username}/threads?page=${page}&limit=20`);
      if (response.ok) {
        const result = await response.json();
        if (append) {
          setThreads(prev => [...prev, ...result.threads]);
        } else {
          setThreads(result.threads);
        }
        setHasMoreThreads(result.hasMore);
        setThreadsPage(page);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
      showSnackbar('Failed to load threads', 'error');
    } finally {
      setThreadsLoading(false);
    }
  }, [username, showSnackbar]);

  /**
   * Load more comments when scrolling to bottom
   * This is used for infinite scroll functionality
   */
  const loadMoreComments = useCallback(() => {
    if (hasMoreComments && !commentsLoading) {
      fetchComments(commentsPage + 1, true);
    }
  }, [hasMoreComments, commentsLoading, commentsPage, fetchComments]);

  /**
   * Load more threads when scrolling to bottom
   * This is used for infinite scroll functionality
   */
  const loadMoreThreads = useCallback(() => {
    if (hasMoreThreads && !threadsLoading) {
      fetchThreads(threadsPage + 1, true);
    }
  }, [hasMoreThreads, threadsLoading, threadsPage, fetchThreads]);

  /**
   * Handle follow status update
   * This is used to update the follow status when user follows/unfollows
   */
  const handleFollowUpdate = useCallback((isFollowing, followersCount) => {
    if (profile) {
      setProfile(prev => ({
        ...prev,
        isFollowing,
        stats: {
          ...prev.stats,
          followersCount
        }
      }));
    }
  }, [profile]);

  // Fetch profile data when username changes
  useEffect(() => {
    if (username) {
      setLoading(true);
      fetchProfile();
    }
  }, [username, fetchProfile]);

  // Fetch initial data when profile loads or tab changes
  useEffect(() => {
    if (profile) {
      if (activeTab === 0) {
        fetchComments();
      } else if (activeTab === 1) {
        fetchThreads();
      }
    }
  }, [profile, activeTab, fetchComments, fetchThreads]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <>
        <Header openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
        <Box sx={{ pb: { xs: '70px', sm: 0 } }}>
          <Grid sx={{ p: { xs: 0, md: 3 }, mt: { xs: 0, md: 2 } }} container spacing={{ xs: 0, md: 3 }}>
            {/* Profile Sidebar Skeleton */}
            <Grid size={{ xs: 12, lg: 3.5, xl: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: 'background.paper',
                  borderRadius: { xs: 0, md: '16px 16px 0 0' },
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="text" width="60%" height={32} sx={{ mx: 'auto', mb: 1 }} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto', mb: 2 }} />
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Skeleton variant="text" width={40} height={24} />
                    <Skeleton variant="text" width={30} height={16} />
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Skeleton variant="text" width={40} height={24} />
                    <Skeleton variant="text" width={30} height={16} />
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Skeleton variant="text" width={40} height={24} />
                    <Skeleton variant="text" width={30} height={16} />
                  </Box>
                </Box>

                <Skeleton variant="rectangular" height={40} sx={{ mb: 3, borderRadius: 1 }} />

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1.5 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="text" width="30%" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="text" width="30%" />
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box>
                  <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[1, 2, 3].map((i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="text" width="70%" />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Main Content Skeleton */}
            <Grid size={{ xs: 12, lg: 8.5, xl: 9 }}>
              <Paper
                sx={{
                  bgcolor: 'background.paper',
                  mt: { xs: 2, md: 0 },
                  borderRadius: { xs: 0, md: '16px 16px 0 0' },
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                  <Box sx={{ display: 'flex', gap: 4 }}>
                    <Skeleton variant="text" width={100} height={48} />
                    <Skeleton variant="text" width={100} height={48} />
                  </Box>
                </Box>

                <Box sx={{ p: 3 }}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="text" width="150px" />
                      </Box>
                      <Skeleton variant="text" width="100%" height={32} />
                      <Skeleton variant="text" width="80%" height={20} />
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        <BottomNav openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
        <Container maxWidth="sm" sx={{ py: 10 }}>
          <Box
            sx={{
              textAlign: 'center',
              px: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 1,
                letterSpacing: '-0.5px',
              }}
            >
              User not found
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              The profile may have been removed or does not exist.
            </Typography>

            <Button
              variant="outlined"
              onClick={() => navigate('/home')}
              sx={{
                borderRadius: 999,
                px: 3,
                textTransform: 'none',
              }}
            >
              Go back
            </Button>
          </Box>
        </Container>
        <BottomNav openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
      </>
    );
  }
  const isOwnProfile = currentUser?.username === username;

  return (
    <>
      <Header openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
      <Box sx={{ pb: { xs: '70px', sm: 0 } }}>
        <Grid sx={{ p: { xs: 0, md: 3 }, mt: { xs: 0, md: 2 } }} container spacing={{ xs: 0, md: 3 }}>
          {/* Profile Sidebar */}
          <Grid item size={{ xs: 12, lg: 3.5, xl: 3 }}>
            <Box
              sx={{
                borderRadius: { xs: 0, md: '16px 16px 0 0' },
                overflow: 'hidden',
                bgcolor: 'background.paper',
                position: 'relative',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              {/* Hero Banner Section */}
              <Box
                sx={{
                  height: { xs: 80, md: 120 },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                  }}
                />
              </Box>

              <Box sx={{ p: 3, pt: 0, position: 'relative' }}>
                {/* Profile Header (Overlapping Avatar) */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar
                    src={profile.avatarUrl}
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mt: -6,
                      border: `4px solid ${theme.palette.background.paper}`,
                      boxShadow: theme.shadows[3],
                      bgcolor: 'primary.main',
                      fontSize: '2.5rem'
                    }}
                  >
                    {profile.username?.charAt(0)?.toUpperCase()}
                  </Avatar>

                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 2, letterSpacing: '-0.5px' }}>
                    {profile.username}
                  </Typography>

                  {isEditingBio ? (
                    <Box sx={{ mt: 2, px: 2 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="Write something about yourself..."
                        value={editedBio}
                        onChange={(e) => setEditedBio(e.target.value)}
                        disabled={bioUpdating}
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={bioUpdating ? <CircularProgress size={16} /> : <CheckOutlined />}
                          onClick={handleBioSave}
                          disabled={bioUpdating}
                          variant="contained"
                          sx={{ borderRadius: 99, textTransform: 'none' }}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          startIcon={<CloseOutlined />}
                          onClick={() => setIsEditingBio(false)}
                          disabled={bioUpdating}
                          variant="outlined"
                          sx={{ borderRadius: 99, textTransform: 'none' }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          px: 2,
                          lineHeight: 1.6,
                          fontStyle: profile.bio ? 'normal' : 'italic',
                          opacity: profile.bio ? 1 : 0.6
                        }}
                      >
                        {profile.bio || "No bio yet."}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 3 }}>
                    {!isOwnProfile && (
                      <FollowButton
                        userId={profile.id}
                        isFollowing={profile.isFollowing}
                        onFollowUpdate={handleFollowUpdate}
                      />
                    )}
                  </Box>
                </Box>

                {/* Iconized Stats */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, px: 1 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {profile.stats.threadsCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 600 }}>
                      Posts
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {profile.stats.commentsCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 600 }}>
                      Comments
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {profile.stats.followersCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 600 }}>
                      Followers
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2, opacity: 0.6 }} />

                <Button
                  fullWidth
                  variant="text"
                  onClick={() => setIsExpanded(!isExpanded)}
                  endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                  sx={{
                    mb: 1,
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontWeight: 600,
                    '&:hover': { bgcolor: 'transparent', color: 'primary.main' }
                  }}
                >
                  {isExpanded ? 'Show Less' : 'Show More Info'}
                </Button>

                <Box sx={{
                  maxHeight: isExpanded ? '1000px' : '0px',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease-in-out',
                  opacity: isExpanded ? 1 : 0,
                  visibility: isExpanded ? 'visible' : 'hidden'
                }}>
                  {/* EXP Bar with Icon */}
                  <Box sx={{ mb: 4, p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <EmojiEventsOutlined sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Level Progression</Typography>
                    </Box>
                    <ExpBar expPoints={profile.expPoints} level={profile.level} />
                  </Box>

                  {/* Account Information */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="overline" sx={{ mb: 2, color: 'text.secondary', fontWeight: 700, display: 'block' }}>
                      Account Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'action.hover', display: 'flex' }}>
                          <CalendarTodayOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Member Since</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(profile.createdAt)}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'action.hover', display: 'flex' }}>
                          <AlternateEmailOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Username</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>@{profile.username}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Spaces */}
                  {profile.spaces && profile.spaces.length > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TravelExploreOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          Active Spaces ({profile.spaces.length})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {profile.spaces.slice(0, 5).map((space) => (
                          <Box
                            key={space.id}
                            onClick={() => navigate(`/spaces/${space.id}`)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1.5,
                              borderRadius: 2,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                transform: 'translateX(4px)'
                              }
                            }}
                          >
                            <Avatar
                              src={space.space_avatar_url}
                              sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}
                            >
                              {space.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {space.name}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Main Content */}
          <Grid item size={{ xs: 12, lg: 8.5, xl: 9 }}>
            <Box
              sx={{
                borderRadius: { xs: 0, md: '16px 16px 0 0' },
                backgroundColor: 'background.paper',
                overflow: 'hidden',
                mt: { xs: 2, md: 0 },
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  px: 2,
                  pt: 1,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    minWidth: 120,
                    transition: '0.2s',
                    '&:hover': { color: 'primary.main', opacity: 1 }
                  }
                }}
              >
                <Tab label={`Comments (${profile.stats.commentsCount})`} />
                <Tab label={`Posts (${profile.stats.threadsCount})`} />
                {isOwnProfile && <Tab label="Settings" />}
              </Tabs>

              <Box sx={{ p: 1 }}>
                {activeTab === 0 && (
                  <ProfileComments
                    comments={comments}
                    loading={commentsLoading}
                    hasMore={hasMoreComments}
                    onLoadMore={loadMoreComments}
                  />
                )}

                {activeTab === 1 && (
                  <ProfileThreads
                    threads={threads}
                    loading={threadsLoading}
                    hasMore={hasMoreThreads}
                    onLoadMore={loadMoreThreads}
                  />
                )}

                {activeTab === 2 && isOwnProfile && (
                  <ProfileEdit
                    profile={profile}
                    onUpdate={(updatedProfile) => setProfile(updatedProfile)}
                    showSnackbar={showSnackbar}
                  />
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <BottomNav openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
    </>
  );
};

export default Profile;
