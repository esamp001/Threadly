import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Avatar, Box, Button, CircularProgress, Paper, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ThreadContent from '../components/Global/ThreadContent';
import Header from '../components/HomeComponents/Header';
import apiRequest from '../config/api';
import { addRecentSearch } from '../utils/searchHelpers';

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [tabValue, setTabValue] = useState(0);
  const [spaces, setSpaces] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spacesPage, setSpacesPage] = useState(1);
  const [threadsPage, setThreadsPage] = useState(1);
  const [spacesHasMore, setSpacesHasMore] = useState(true);
  const [threadsHasMore, setThreadsHasMore] = useState(true);

  const observerRef = useRef(null);
  const limit = 10;

  // Add search to recent searches on mount
  useEffect(() => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
    }
  }, [searchQuery]);

  /**
   * Fetches spaces based on search query
   * This is used to search for spaces with pagination
   * @param {boolean} loadMore - Whether to load more results or reset
   */
  const fetchSpaces = useCallback(async (loadMore = false) => {
    if (loading || !spacesHasMore || !searchQuery) return;

    const currentPage = loadMore ? spacesPage + 1 : 1;
    try {
      setLoading(true);
      const response = await apiRequest(`/api/search/spaces?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${limit}`);
      const result = await response.json();

      if (result.success) {
        if (loadMore) {
          setSpaces(prev => [...prev, ...result.spaces]);
          setSpacesPage(currentPage);
        } else {
          setSpaces(result.spaces);
          setSpacesPage(1);
        }
        setSpacesHasMore(result.pagination.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, loading, spacesHasMore, spacesPage, limit]);

  /**
   * Fetches threads based on search query
   * This is used to search for threads with pagination
   * @param {boolean} loadMore - Whether to load more results or reset
   */
  const fetchThreads = useCallback(async (loadMore = false) => {
    if (loading || !threadsHasMore || !searchQuery) return;

    const currentPage = loadMore ? threadsPage + 1 : 1;
    try {
      setLoading(true);
      const response = await apiRequest(`/api/search/threads?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${limit}`);
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
  }, [searchQuery, loading, threadsHasMore, threadsPage, limit]);

  // Fetch initial results when search query or tab changes
  useEffect(() => {
    if (searchQuery) {
      if (tabValue === 0) {
        fetchSpaces(false);
      } else {
        fetchThreads(false);
      }
    }
  }, [searchQuery, tabValue, fetchSpaces, fetchThreads]);

  // Intersection Observer for infinite scroll
  const lastElementRef = useCallback((node) => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (tabValue === 0 && spacesHasMore) {
          fetchSpaces(true);
        } else if (tabValue === 1 && threadsHasMore) {
          fetchThreads(true);
        }
      }
    });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, tabValue, spacesHasMore, threadsHasMore, fetchSpaces, fetchThreads]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!searchQuery) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          No search query provided
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Header />
      {/* Mobile back button */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Button
          onClick={() => navigate('/home')}
          startIcon={<ArrowBackIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            color: 'primary.main',
            fontSize: '0.875rem',
            minWidth: 'auto',
            p: 1
          }}
        >
          Back
        </Button>
      </Box>
      <Box sx={{ p: 3, maxWidth: 'lg', mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Search results for "{searchQuery}"
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Spaces" />
          <Tab label="Threads" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            {loading && spaces.length === 0 ? (
              // Show skeleton while loading
              Array.from({ length: 5 }).map((_, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: 'paper.backgroundColor' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={50} height={50} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                  </Box>
                </Paper>
              ))
            ) : spaces.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  No spaces found
                </Typography>
              </Box>
            ) : (
              <>
                {spaces.map((space) => (
                  <Paper
                    key={space.id}
                    ref={spaces.length - 1 === spaces.length - 1 ? lastElementRef : null}
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: 'paper.backgroundColor',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => window.location.href = `/spaces/${space.id}`}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={space.avatar_url}
                        sx={{ width: 50, height: 50 }}
                      >
                        {space.space_name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {space.space_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {space.space_description || 'No description'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {space.member_count || 0} members
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
                {loading && spacesHasMore && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
              </>
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            {loading && threads.length === 0 ? (
              // Show skeleton while loading
              Array.from({ length: 3 }).map((_, index) => (
                <Paper key={index} sx={{ p: 2.5, mb: 2, backgroundColor: 'paper.backgroundColor' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Skeleton variant="circular" sx={{ height: 40, width: 40, mr: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Skeleton variant="text" width={120} height={20} />
                        <Skeleton variant="text" width={80} height={16} />
                      </Box>
                      <Skeleton variant="text" width={60} height={20} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
                </Paper>
              ))
            ) : threads.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  No threads found
                </Typography>
              </Box>
            ) : (
              <>
                {threads.map((thread, index) => (
                  <div key={thread.id} ref={index === threads.length - 1 ? lastElementRef : null}>
                    <ThreadContent
                      net_score={thread.net_score}
                      userVote={thread.userVote}
                      avatar={thread.user_avatar_url}
                      spaceAvatar={thread.space_avatar_url}
                      spaceName={thread.space_name || 'Unknown Space'}
                      spaceId={thread.space_id}
                      postedBy={thread.username}
                      timeAgo={thread.timeAgo}
                      title={thread.title}
                      content={thread.content}
                      upvotes={thread.upvotes || 0}
                      comments={thread.comments || 0}
                      shares={thread.shares || 0}
                      username={thread.username}
                      componentRendered="Search"
                      threadId={thread.id}
                      onCommentOpen={() => { }}
                      onVoteUpdate={() => { }}
                    />
                  </div>
                ))}
                {loading && threadsHasMore && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export default Search;
