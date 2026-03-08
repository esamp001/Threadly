import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, FormControl, MenuItem, Select, Typography } from "@mui/material";
import { useSnackbar } from '../../context/SnackbarContext';
import ThreadContent from "../Global/ThreadContent";
import CommentPanel from './CommentPanel';
import CustomButton from './CustomButton';
import SearchButton from './SearchButton';

// Quill
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useCallback, useEffect, useRef, useState } from 'react';


const MainContent = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [isExpanded, setIsExpanded] = useState(false);
  const quillRef = useRef(null);
  const { showSnackbar } = useSnackbar();
  const quillInstanceRef = useRef(null);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [threads, setThreads] = useState([]);
  const [openCommentThreads, setOpenCommentThreads] = useState(false);
  const [threadsHasMore, setThreadsHasMore] = useState(true);
  const [threadsPage, setThreadsPage] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    spaceId: '',
    content: ''
  });


  // Function Handlers
  const handleQuillChange = useCallback(() => {
    if (quillInstanceRef.current) {
      const htmlContent = quillInstanceRef.current.root.innerHTML;

      // Strip HTML tags
      const tmp = document.createElement('div');
      tmp.innerHTML = htmlContent;
      const plainText = tmp.textContent || tmp.innerText || '';

      setFormData(prev => ({
        ...prev,
        content: plainText
      }));
    }
  }, []);

  // -------------- API FETCH -------------- //
  const listSpaces = useCallback(async (loadMore = false) => {
    if (loading || !hasMore) return;

    const currentPage = loadMore ? page + 1 : 1;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/maincontent/all_spaces?page=${currentPage}&limit=${limit}`);
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
      const response = await fetch(`${API_URL}/api/maincontent/all_threads?page=${currentPage}&limit=10`);
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
    try {
      const response = await fetch(`${API_URL}/api/maincontent/create_thread`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
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

        // Close accordion
        setIsExpanded(false)

        // Reset Quill content
        if (quillInstanceRef.current) {
          quillInstanceRef.current.setText(''); // Clear the editor
        }

      } else {
        showSnackbar(result.error_message || 'Failed to create thread', 'error');
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      showSnackbar('Error creating thread', 'error');
    }
  };


  const handleVote = async (voteType, threadId) => {
    // 1. Optimistic update - update UI immediately
    setThreads(prev =>
      prev.map(thread => {
        if (thread.id !== threadId) {
          return thread;
        }

        const vote_value = voteType === 'upvote' ? 1 : -1;
        const currentVote = thread.userVote || 0;

        // If user clicked same vote again → remove vote
        if (currentVote === vote_value) {
          return {
            ...thread,
            upvotes: voteType === 'upvote' ? thread.upvotes - 1 : thread.upvotes,
            downvotes: voteType === 'downvote' ? thread.downvotes - 1 : thread.downvotes,
            net_score: thread.net_score - vote_value,
            userVote: null
          };
        }

        // If user clicked opposite vote → switch vote
        if (thread.userVote === -vote_value) {
          return {
            ...thread,
            net_score: thread.net_score + (vote_value * 2), // Remove old vote, add new vote
            userVote: vote_value
          };
        }

        // New vote
        return {
          ...thread,
          net_score: thread.net_score + vote_value,
          userVote: vote_value
        };
      })
    );

    try {
      // Make API call
      const response = await fetch(`${API_URL}/api/maincontent/threads/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: threadId,
          voteType: voteType
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Success - update with actual server data
        setThreads(prevThreads =>
          prevThreads.map(thread =>
            thread.id === result.updatedThread.id
              ? { ...thread, ...result.updatedThread }
              : thread
          )
        );
      } else {
        // Server failed - revert optimistic update
        setThreads(prevThreads =>
          prevThreads.map(thread =>
            thread.id === threadId
              ? {
                ...thread,
                net_score: thread.net_score - (voteType === 'upvote' ? 1 : -1),
                userVote: thread.userVote === (voteType === 'upvote' ? 1 : -1) ? null : thread.userVote
              }
              : thread
          )
        );
        showSnackbar(result.error_message || 'Failed to vote', 'error');
      }
    } catch (error) {
      // Network error - revert optimistic update
      setThreads(prevThreads =>
        prevThreads.map(thread =>
          thread.id === threadId
            ? {
              ...thread,
              net_score: thread.net_score - (voteType === 'upvote' ? 1 : -1),
              userVote: thread.userVote === (voteType === 'upvote' ? 1 : -1) ? null : thread.userVote
            }
            : thread
        )
      );
      showSnackbar('Error voting', 'error');
    }
  };

  const handleCommentOpen = useCallback((threadId) => {
    setOpenCommentThreads(prev => ({
      ...prev,
      [threadId]: !prev[threadId]
    }));
  }, []);

  // Simple useEffect for initial load
  useEffect(() => {
    listSpaces();
    fetchThreads();
  }, []);


  useEffect(() => {
    if (isExpanded && quillRef.current && !quillInstanceRef.current) {
      // Initialize Quill when accordion expands
      quillInstanceRef.current = new Quill(quillRef.current, {
        theme: 'snow',
        placeholder: 'Write your post...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            ['link', 'image'],
            ['clean']
          ]
        }
      });

      // Add change listener
      quillInstanceRef.current.on('text-change', handleQuillChange);
    }
  }, [isExpanded]);

  useEffect(() => {
    return () => {
      if (quillInstanceRef.current) {
        quillInstanceRef.current.off('text-change', handleQuillChange);
      }
    };
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
              <Avatar sx={{ height: 50, width: 50 }}>J</Avatar>
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
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, ml: 1 }}>Select Space</Typography>
          <FormControl fullWidth>
            <Select
              size="small"
              value={formData.spaceId || (spaces && spaces[0] ? spaces[0].id : '')}
              onChange={(e) => {
                const spaceId = e.target.value;
                const selected = spaces.find(space => space.id === spaceId);
                setFormData(prev => ({ ...prev, spaceId, spaceName: selected.space_name, avatarUrl: selected.avatar_url }));
              }}
              renderValue={() => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 35, height: 35 }}>
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Space avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      formData.spaceName?.charAt(0).toUpperCase() || 'S'
                    )}
                  </Avatar>
                  <Typography fontWeight={700}>
                    {formData.spaceName || 'Select Space'}
                  </Typography>
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300, // Set max height for scrolling
                    '& .MuiList-root': {
                      position: 'relative'
                    }
                  }
                }
              }}
              sx={{ borderRadius: 5 }}
            >
              {spaces.map((space, index) => (
                <MenuItem
                  key={space.id}
                  value={space.id}
                  ref={null}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {space.avatar_url ? (
                      <Avatar
                        sx={{ width: 28, height: 28 }}
                        src={space.avatar_url}
                      >
                        {space.space_name.charAt().toUpperCase(0)}
                      </Avatar>
                    ) : (
                      <Avatar sx={{ width: 28, height: 28 }}>
                        {space.space_name.charAt().toUpperCase(0)}
                      </Avatar>
                    )}
                    {space.space_name}
                  </Box>
                </MenuItem>
              ))}

              {hasMore && (
                <MenuItem
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    listSpaces(true);
                  }}
                  sx={{ justifyContent: 'center', py: 1 }}
                >
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {loading ? 'Loading...' : 'Load More'}
                  </Typography>
                </MenuItem>
              )}
            </Select>
          </FormControl>

        </Box>
        <AccordionDetails sx={{ p: 2, backgroundColor: 'paper.backgroundColor' }}>
          <Box
            sx={{
              width: '100%',
              '& .ql-container': {
                backgroundColor: 'paper.backgroundColor',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontFamily: 'Inter, Roboto, sans-serif',
              },
              '& .ql-editor': {
                backgroundColor: 'paper.backgroundColor',
                color: 'text.primary',
                fontSize: '16px',
                lineHeight: 1.5,
                padding: '16px',
                minHeight: '118px', // 150px - 32px padding,
              },
              '& .ql-editor.ql-blank::before': {
                color: 'text.secondary',
              },
              '& .ql-toolbar': {
                backgroundColor: 'paper.backgroundColor',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px 12px 0 0',
              },
              '& .ql-stroke': {
                stroke: 'text.secondary !important',
              },
              '& .ql-fill': {
                fill: 'text.secondary !important',
              },
              '& .ql-picker-label': {
                color: 'text.secondary !important',
              },
              '& .ql-picker-options': {
                backgroundColor: 'background.paper',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
              '& .ql-picker-item': {
                color: 'text.primary',
              },
              '& .ql-picker-item:hover': {
                backgroundColor: 'primary.light',
                color: 'text.primary',
              },
              '& .ql-picker-item.ql-selected': {
                backgroundColor: 'primary.main',
                color: 'text.primary',
              },
              '& .ql-snow .ql-picker.ql-expanded .ql-picker-label': {
                borderColor: 'primary.main',
              },
              '& .ql-snow .ql-picker.ql-expanded .ql-picker-options': {
                borderColor: 'primary.main'
              },
              '& .ql-snow.ql-toolbar button:hover, & .ql-snow.ql-toolbar button:focus, & .ql-snow.ql-toolbar button.ql-active, & .ql-snow.ql-toolbar .ql-picker-label:hover, & .ql-snow.ql-toolbar .ql-picker-label.ql-active, & .ql-snow.ql-toolbar .ql-picker-item:hover, & .ql-snow.ql-toolbar .ql-picker-item.ql-selected': {
                color: '#FFFFFF'
              },

              '& .ql-snow.ql-toolbar button:hover .ql-stroke, & .ql-snow.ql-toolbar button:focus .ql-stroke, & .ql-snow.ql-toolbar button.ql-active .ql-stroke, & .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke, & .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke, & .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke, & .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke': {
                stroke: '#FFFFFF !important', // Changes icon outlines
              },
              '& .ql-snow.ql-toolbar button:hover .ql-fill, & .ql-snow.ql-toolbar button:focus .ql-fill, & .ql-snow.ql-toolbar button.ql-active .ql-fill, & .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill, & .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill, & .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill, & .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill': {
                fill: '#FFFFFF !important', // Changes icon interiors
              },
            }
            }
          >
            <div
              ref={quillRef}
              style={{ height: '150px', marginBottom: '50px' }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <CustomButton fetchOnclick={handleCreateThread}>Create Thread</CustomButton>
            <CustomButton>Draft</CustomButton>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Thread Content */}
      {threads.map(thread => (
        <Box key={thread.id}>
          <ThreadContent
            net_score={thread.net_score}
            handleVote={handleVote}
            userVote={thread.userVote}
            avatar={thread.avatar_url}
            spaceName={thread.space_name || 'Unknown Space'}
            postedBy="u/John Doe"  // You'll need to add user info to threads
            timeAgo={thread.timeAgo}   // You'll need to calculate relative time
            title={thread.title}
            content={thread.content}
            upvotes={thread.upvotes || 0}
            comments={thread.comments || 0}
            shares={thread.shares || 0}
            threadId={thread.id}
            onCommentOpen={handleCommentOpen}
          />
          {openCommentThreads[thread.id] && (
            <CommentPanel threadId={thread.id} isOpen={openCommentThreads[thread.id]} />
          )}
        </Box>
      ))}

    </Box>
  )
}

export default MainContent
