import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, FormControl, MenuItem, Select, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from 'react';
import apiRequest from '../../config/api';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { uploadImagesToCloudinary } from '../../utils/cloudinary';
import ThreadContent from "../Global/ThreadContent";
import CommentPanel from '../HomeComponents/CommentPanel';
import CustomButton from './CustomButton';
import QuillEditor from './QuillEditor';
import SearchButton from './SearchButton';


const MainContent = ({ spaces, setSpaces }) => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const componentName = useRef('MainContent');

  // States
  const [selectedThreadData, setSelectedThreadData] = useState(null);
  const [openCommentThreads, setOpenCommentThreads] = useState(false);
  const [threadsHasMore, setThreadsHasMore] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [threadsPage, setThreadsPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [threads, setThreads] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [formData, setFormData] = useState({
    title: '',
    spaceId: '',
    content: ''
  });
  const [editorKey, setEditorKey] = useState(0);

  // -------------- API FETCH -------------- //
  const listSpaces = useCallback(async (loadMore = false) => {
    if (loading || !hasMore) return;

    const currentPage = loadMore ? page + 1 : 1;
    try {
      setLoading(true);
      const response = await apiRequest(`/api/maincontent/all_spaces?page=${currentPage}&limit=${limit}`);
      const result = await response.json();
      if (response.ok) {
        const newSpaces = result.spaces;
        if (loadMore) {
          setSpaces(prev => [...prev, ...newSpaces]);
          setPage(currentPage);
        } else {
          setSpaces(newSpaces);
          setPage(1);
        }
        setHasMore(result.pagination.hasMore); // Use backend pagination info
      }
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  const fetchThreads = useCallback(async (loadMore = false) => {
    if (loading || !threadsHasMore) return;

    const currentPage = loadMore ? threadsPage + 1 : 1;
    try {
      setLoading(true);
      const response = await apiRequest(`/api/maincontent/all_threads?page=${currentPage}&limit=10`);
      const result = await response.json();

      if (result.success) {
        if (loadMore) {
          setThreads(prev => [...prev, ...result.threads]);
          setThreadsPage(currentPage);
        } else {
          setThreads(result.threads);
          setThreadsPage(1);
        }
        setThreadsHasMore(result.pagination.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, threadsHasMore, threadsPage]);

  const handleCreateThread = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      showSnackbar('Please enter a title', 'error');
      return;
    }
    if (!formData.content.trim()) {
      showSnackbar('Please enter content', 'error');
      return;
    }
    if (!formData.spaceId) {
      showSnackbar('Please select a space', 'error');
      return;
    }

    try {
      // Upload base64 images to Cloudinary using utility function
      const processedContent = await uploadImagesToCloudinary(formData.content, showSnackbar);

      // Send processed content to backend
      const response = await apiRequest(`/api/maincontent/create_thread`, {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          content: processedContent
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSnackbar('Thread created successfully', 'success');

        setThreads(prev => [result.thread, ...prev]);

        // Reset form
        setFormData({
          title: '',
          content: '',
          spaceId: ''
        });

        // Force QuillEditor remount to clear content
        setEditorKey(prev => prev + 1);

        // Close accordion
        setIsExpanded(false)

      } else {
        showSnackbar(result.error_message || 'Failed to create thread', 'error');
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      showSnackbar('Error creating thread', 'error');
    }
  };

  const handleCommentOpen = useCallback((thread) => {
    setSelectedThreadData(thread);
    setOpenCommentThreads(prev => ({
      ...prev,
      [thread.id]: true
    }));
  }, []);

  const handleVoteUpdate = (updatedThread) => {
    setThreads(prevThreads =>
      prevThreads.map(thread =>
        thread.id === updatedThread.id
          ? { ...thread, ...updatedThread }
          : thread
      )
    );
  };

  const handleCommentClose = useCallback((threadId) => {
    setOpenCommentThreads(prev => ({
      ...prev,
      [threadId]: false
    }));
  }, []);


  // UseEffect
  useEffect(() => {
    listSpaces();
    fetchThreads();
  }, []);


  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Accordion expanded={isExpanded}>
        <AccordionSummary
          onClick={(e) => e.stopPropagation()}
          sx={{ p: 2, backgroundColor: 'paper.backgroundColor' }}
        >
          <Box sx={{ width: '100%' }}>
            {/* Section Title */}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: 'text.secondary',
                mb: 1
              }}
            >
              Create Thread
            </Typography>

            {/* Content */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{ height: 50, width: 50 }}
                src={user?.avatar_url}
                alt={user?.username}
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : 'J'}
              </Avatar>
              <SearchButton sx={{ borderColor: 'white' }}
                expanded={isExpanded}
                onExpand={() => setIsExpanded(!isExpanded)}
                setTitle={(title) => setFormData(prev => ({ ...prev, title }))}
                title={formData.title}
              />
            </Box>
          </Box>
        </AccordionSummary>

        {/* Select Spaces using dropdown */}
        <Box sx={{ p: 2, backgroundColor: 'paper.backgroundColor' }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, ml: 1, fontWeight: 600 }}>
            Where are we posting today?
          </Typography>
          <FormControl fullWidth>
            <Select
              size="small"
              displayEmpty
              value={formData.spaceId || ''}
              onChange={(e) => {
                const spaceId = e.target.value;
                const selected = spaces.find(space => space.id === spaceId);
                setFormData(prev => ({
                  ...prev,
                  spaceId,
                  spaceName: selected?.space_name || '',
                  avatarUrl: selected?.avatar_url || ''
                }));
              }}
              renderValue={(selected) => {
                // 1. Consistency: Use the same Box structure for both states
                if (!selected || selected === '') {
                  return (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Select Space
                    </Typography>
                  );
                }

                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={formData.avatarUrl}
                      sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                    >
                      {formData.spaceName?.charAt(0).toUpperCase()}
                    </Avatar>
                    {/* 2. Consistency: Use variant="body2" and same weight as MenuItems */}
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {formData.spaceName}
                    </Typography>
                  </Box>
                );
              }}
              sx={{ borderRadius: 3 }} // Slightly tighter radius looks cleaner with small inputs
            >
              {spaces.map((space) => (
                <MenuItem key={space.id} value={space.id} sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={space.avatar_url}
                      sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                    >
                      {space.space_name?.charAt(0).toUpperCase()}
                    </Avatar>
                    {/* 3. Consistency: Match the weight and variant from renderValue */}
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {space.space_name}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}

              {hasMore && (
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    listSpaces(true);
                  }}
                  disabled={loading}
                  sx={{ justifyContent: 'center', py: 1.5 }}
                >
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {loading ? 'Loading...' : 'Load More'}
                  </Typography>
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>
        <AccordionDetails sx={{ p: 2, backgroundColor: 'paper.backgroundColor' }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, ml: 1, fontWeight: 600 }}>
            Share your thoughts
          </Typography>
          {/* QuillEditor component */}
          <QuillEditor
            key={editorKey}
            isExpanded={isExpanded}
            value={formData.content}
            onChange={(htmlContent) => {
              setFormData(prev => ({ ...prev, content: htmlContent }));
            }}
            placeholder="Share your thoughts..."
            height="150px"
          />

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <CustomButton fetchOnclick={handleCreateThread}>Create Thread</CustomButton>
            <CustomButton>Draft</CustomButton>
          </Box>
        </AccordionDetails>
      </Accordion>


      {threads && threads.length === 0 ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            No threads created yet
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Be the first to start a discussion!
          </Typography>
        </Box>
      ) : (
        threads.map(thread => (
          <ThreadContent
            key={thread.id}
            net_score={thread.net_score}
            userVote={thread.userVote}
            avatar={thread.avatar_url}
            spaceAvatar={thread.space_avatar_url}
            spaceName={thread.space_name || 'Unknown Space'}
            postedBy={thread.username}
            timeAgo={thread.timeAgo}
            title={thread.title}
            content={thread.content}
            upvotes={thread.upvotes || 0}
            comments={thread.comments || 0}
            shares={thread.shares || 0}
            username={thread.username}
            componentRendered={componentName}
            threadId={thread.id}
            onCommentOpen={() => handleCommentOpen(thread)}
            onVoteUpdate={handleVoteUpdate}
          />
        ))
      )}

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
                  return thread.id === parseInt(threadId) ? { ...thread, comments: newCount } : thread;
                });
                return updated;
              });
            }}
          />
        )
      ))}
    </Box>
  )
}

export default MainContent
