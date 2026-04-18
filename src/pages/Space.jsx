import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import { Avatar, Box, Button, Grid, Paper, Skeleton, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import ThreadContent from '../components/Global/ThreadContent';
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
const AboutSpaceCard = ({ space }) => {
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
        {space?.description || 'A sanctuary for those who value precise information over noise. Official Space is the core of our platform\'s governance and design evolution.'}
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
            244k
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
            SCHOLARS
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
            1.8k
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
            RESEARCHING
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
          Created June 12, 2021
        </Typography>
      </Box>

      {/* Button */}
      <Button
        fullWidth
        variant="contained"
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          py: 1.2,
          backgroundColor: '#2a2b31',
          color: '#e5e7eb',
          '&:hover': {
            backgroundColor: '#3a3b42',
          },
        }}
      >
        Joined
      </Button>
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
        setSpace(result.data?.space || result.space);
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
          <Header />
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
        <Header />
      </Grid>

      {/* Cover Photo Section */}
      <Grid size={12}>
        <Box
          sx={{
            height: 450,
            backgroundColor: 'background.paper',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pb: 30,
          }}
        >
          {/* Cover Photo Placeholder */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 5,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
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
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'uppercase' }}>
                {space?.name || 'Space Name'}
              </Typography>
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

      {/* Thread List and About Space Card */}
      <Grid sx={{ width: '100%', justifyContent: 'center', p: 2, mt: 10 }} container spacing={2}>
        {/* Thread List */}
        <Grid size={9}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'uppercase' }}>
                Threads Discussions
              </Typography>

              {!showThreadForm && (
                <CustomButton
                  onClick={() => setShowThreadForm(true)}
                >
                  Create Thread
                </CustomButton>
              )}
            </Box>

            {/* Thread Creation Form */}
            {showThreadForm && (
              <Box sx={{ mb: 3, mt: 2 }}>
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
        <Grid size={3}>
          <AboutSpaceCard space={space} />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Space;
