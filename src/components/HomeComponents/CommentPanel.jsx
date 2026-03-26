import {
  Avatar,
  Box,
  Button,
  Modal,
  Paper,
  Skeleton,
  TextField,
  Typography
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import apiRequest from '../../config/api';
import CommentItem from './CommentItem';

const CommentPanel = ({ isOpen, isClose, threadId, threadData }) => {
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentId, setNewCommentId] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyTexts, setReplyTexts] = useState({});

  // Toggles the visibility of replies for a given comment ID.
  // const toggleReplies = (id) => {
  //   setExpandedReplies(prev => ({
  //     ...prev,
  //     [id]: !prev[id]
  //   }));
  // };

  // Handles posting a new comment to a thread.
  const handlePostComment = async (threadId) => {
    if (!newCommentText.trim()) return;

    setIsPostingComment(true);

    const response = await apiRequest(`/api/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content: newCommentText,
        thread_id: threadId,
        parent_id: null,
      })
    });

    const newComment = await response.json();
    setComments(prev => [newComment.comment, ...prev]);
    setNewCommentId(newComment.comment.id);
    setNewCommentText('');
    setNewCommentId(null);
    setIsPostingComment(false);
  };

  // Fetches comments for a given thread ID.
  const fetchComments = useCallback(async () => {
    if (!threadId) return;

    // Set loading to true BEFORE the fetch
    setLoading(true);

    try {
      const response = await apiRequest(`/api/comments?thread_id=${threadId}`);
      const data = await response.json();

      // Set comments AFTER successful fetch
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Set empty array on error
      setComments([]);
    } finally {
      // Always set loading to false when done
      setLoading(false);
    }
  }, [threadId]);

  // Comment skeleton component
  const CommentSkeleton = () => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="text" width={60} height={16} />
          </Box>
          <Skeleton variant="text" width="100%" height={25} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="90%" height={25} sx={{ mb: 1.5 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Skeleton variant="rectangular" width={70} height={25} sx={{ borderRadius: 3 }} />
            <Skeleton variant="text" width={35} height={16} />
            <Skeleton variant="text" width={35} height={16} />
            <Skeleton variant="circular" width={20} height={20} />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // Handler for closing the modal
  const isCloseHandler = () => {
    isClose();
  };

  // All useEffect hooks
  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, fetchComments, threadId]);

  return (
    // Comment Panel Modal - Parent
    <Modal
      open={isOpen}
      onClose={isCloseHandler}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Paper
        sx={{
          width: '60%',
          maxWidth: 800,
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          mt: 3,
          bgcolor: 'background.default',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >

        {/* ACTUAL THREAD CONTENT */}
        {threadData && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar
                src={threadData.user_avatar_url}
                sx={{ width: 30, height: 30 }}
              >
                {threadData.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 500, color: 'text.primary', lineHeight: 1.2 }}
                  >
                    {threadData.username}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontSize: '0.72rem' }}
                  >
                    Posted in {threadData.space_name}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {threadData.timeAgo}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {threadData.title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.primary', mb: 2 }}>
              {threadData.content}
            </Typography>
          </Box>
        )}

        {/* TITLE */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              letterSpacing: 0.3
            }}
          >
            Discussions
          </Typography>
        </Box>

        {/* COMMENT INPUT */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Avatar
            src={threadData?.user_avatar_url}
            sx={{ width: 30, height: 30 }}
          >
            {threadData?.username?.[0]?.toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write a reply..."
              multiline
              maxRows={4}
              variant="standard"
              disabled={isPostingComment}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handlePostComment(threadId);
                }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: 14,
                },
                '& .MuiInputBase-input': {
                  py: 0.5,
                },
                '& .MuiInput-underline:before': {
                  borderBottomColor: 'divider',
                },
                '& .MuiInput-underline:hover:before': {
                  borderBottomColor: 'text.secondary',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: 'primary.main',
                }
              }}
            />

            {/* Action row (only appears when typing) */}
            {newCommentText.trim() && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 0.5
                }}
              >
                <Button
                  size="small"
                  disabled={isPostingComment}
                  onClick={() => handlePostComment(threadId)}
                  sx={{
                    textTransform: 'none',
                    fontSize: 13,
                    fontWeight: 500,
                    minWidth: 'auto',
                    px: 1.5
                  }}
                >
                  {isPostingComment ? 'Posting...' : 'Reply'}
                </Button>
              </Box>
            )}

          </Box>
        </Box>

        {/* COMMENTS DISPLAY */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 400,
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'divider',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: 'text.secondary',
            }
          }}
        >
          {/* Conditional rendering for loading state - shows skeleton loaders */}
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  animation: `fadeIn 0.3s ease-in-out ${index * 0.1}s both`,
                  animationFillMode: 'both'
                }}
              >
                <CommentSkeleton key={index} />
              </Box>
            ))
          ) : comments.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                color: 'text.secondary'
              }}
            >
              <Typography variant="body1" sx={{ mb: 1 }}>
                No comments yet
              </Typography>
              <Typography variant="caption">
                Be the first to share your thoughts!
              </Typography>
            </Box>
          ) : (
            // Conditional rendering for comments - shows actual comments
            comments.map((comment) => (
              <Box
                key={comment.id}
                sx={{
                  py: 1.5,
                }}
              >
                {/* Shows actual each comment item */}
                <CommentItem
                  comment={comment}
                  depth={0}
                  expandedReplies={expandedReplies}
                  newCommentId={newCommentId}
                  replyTexts={replyTexts}
                  replyingTo={replyingTo}
                  comments={comments}
                  setComments={setComments}
                  onReplyingTo={setReplyingTo}
                  onReplyTextsChange={setReplyTexts}
                />
              </Box>
            ))
          )}
        </Box>
      </Paper >
    </Modal>
  );
};

export default CommentPanel;
