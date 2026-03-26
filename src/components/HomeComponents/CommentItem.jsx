
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  TextField,
  Typography
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { MessageCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import apiRequest from '../../config/api';
import { useSnackbar } from '../../context/SnackbarContext';

const CommentItem = ({
  comment,
  depth,
  expandedReplies,
  newCommentId,
  comments,
  setComments,
}) => {
  const pendingRequests = useRef({});
  const { showSnackbar } = useSnackbar();

  // States
  const [replyTexts, setReplyTexts] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  // Handle comment voting with optimistic update and request cancellation
  const handleCommentVote = async (voteType, commentId) => {
    // 1. Spam Protection
    if (pendingRequests.current[commentId]) {
      pendingRequests.current[commentId].abort();
    }

    const abortController = new AbortController();
    pendingRequests.current[commentId] = abortController;

    // Helper functions need to be defined BEFORE using them
    const updateVoteRecursively = (comments, commentId, voteType, onCommentFound) => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          if (onCommentFound) onCommentFound(comment);

          const newNetScore = voteType === 'upvote'
            ? (comment.userVote === 1 ? comment.net_score - 1 : comment.net_score + 1)
            : (comment.userVote === -1 ? comment.net_score + 1 : comment.net_score - 1);

          const newUserVote = voteType === 'upvote'
            ? (comment.userVote === 1 ? 0 : 1)
            : (comment.userVote === -1 ? 0 : -1);

          return {
            ...comment,
            net_score: newNetScore,
            userVote: newUserVote
          };
        }

        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateVoteRecursively(comment.replies, commentId, voteType, onCommentFound)
          };
        }

        return comment;
      });
    };

    const updateWithServerDataRecursively = (comments, commentId, serverData) => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, ...serverData };
        }

        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateWithServerDataRecursively(comment.replies, commentId, serverData)
          };
        }

        return comment;
      });
    };

    // We'll store previous state of just this comment to rollback if needed
    let previousCommentData = null;

    // 2. Optimistic Update
    setComments(prev => {
      // Helper to find and "snapshot" comment before we change it
      // This ensures our rollback is precise
      return updateVoteRecursively(prev, commentId, voteType, (oldComment) => {
        previousCommentData = oldComment;
      });
    });

    try {
      const response = await apiRequest(`/api/comments/vote`, {
        method: 'POST',
        body: JSON.stringify({ commentId, voteType }),
        signal: abortController.signal
      });
      const result = await response.json();

      if (result.success) {
        setComments(prev => updateWithServerDataRecursively(prev, commentId, result.updatedComment));
      }
    } catch (error) {
      if (error.name === 'AbortError') return;

      // 3. PRECISION ROLLBACK
      // Instead of resetting the whole array, reset only this comment
      setComments(prev => updateWithServerDataRecursively(prev, commentId, previousCommentData));
      showSnackbar('Error voting', 'error');
    } finally {
      if (pendingRequests.current[commentId] === abortController) {
        delete pendingRequests.current[commentId];
      }
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (parentCommentId) => {
    const replyText = replyTexts[parentCommentId];
    if (!replyText?.trim()) return;

    try {
      const response = await apiRequest('/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          content: replyText,
          thread_id: comment.thread_id,
          parent_id: parentCommentId,
        })
      });

      const newReply = await response.json();

      const updateCommentRecursively = (comments, parentCommentId, newReply) => {
        return comments.map(comment => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          }

          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentRecursively(comment.replies, parentCommentId, newReply)
            };
          }

          return comment;
        });
      };

      setComments(prev => updateCommentRecursively(prev, parentCommentId, newReply.comment));

      // Clear reply state
      setReplyTexts(prev => ({ ...prev, [parentCommentId]: '' }));
      setReplyingTo(null);

      showSnackbar('Reply posted successfully', 'success');
    } catch (error) {
      console.error('Error posting reply:', error);
      showSnackbar('Error posting reply', 'error');
    }
  };

  return (
    // THIS WHOLE COMPONENT IS MAPPED EACH COMMENT ITEM

    <Box sx={{ ml: depth > 0 ? 5 : 0, position: 'relative' }}>
      {depth > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: 16,
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: 'divider',
            opacity: 0.6
          }}
        />
      )}

      {comment.replies && comment.replies.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: 16,
            top: 40,
            bottom: 0,
            width: '2px',
            backgroundColor: 'divider',
            opacity: 0.6
          }}
        />
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Avatar
          src={comment.user_avatar_url}
          sx={{
            width: 32,
            height: 32,
            fontSize: 13,
            bgcolor: 'primary.main',
            border: '2px solid',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {comment.author?.[0]?.toUpperCase() || 'A'}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography
              fontWeight={600}
              fontSize={14}
              sx={{
                color: 'text.primary',
                '&:hover': {
                  color: 'primary.main',
                  cursor: 'pointer'
                }
              }}
            >
              {comment.author}
            </Typography>

            <Typography
              fontSize={12}
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {comment.timestamp}
            </Typography>
          </Box>

          {/* COMMENT ITEM CONTENT */}
          <Typography
            fontSize={14}
            sx={{
              lineHeight: 1.6,
              color: 'text.primary',
              wordBreak: 'break-word'
            }}
          >
            {comment.content}
          </Typography>

          {/* COMMENT ITEM ACTIONS */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5 }}>
            {/* COMMENT ITEM VOTING */}
            <Box sx={{ display: 'flex' }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: comment.userVote === 1 ? '#a2cca26e' : comment.userVote === -1 ? '#b8626f83' : 'transparent',
                borderRadius: 3,
                p: 0.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: comment.userVote !== 0 ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: comment.userVote === 1 ? '#a2cca26e' : comment.userVote === -1 ? '#b8626f83' : 'rgba(255, 255, 255, 0.05)',
                  transform: 'translateY(-1px)'
                }
              }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  {/* UPVOTE BUTTON */}
                  <ExpandLessRoundedIcon
                    sx={{
                      color: comment.userVote === 1 ? '#4CAF50' : 'text.secondary',
                      height: 20,
                      width: 20,
                      cursor: 'pointer',
                      opacity: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: comment.userVote === 1 ? '#4CAF50' : '#4CAF50',
                        transform: 'scale(1.1)'
                      }
                    }}
                    onClick={() => handleCommentVote('upvote', comment.id)}
                  />
                  <Typography variant='subtitle2' sx={{
                    color: comment.userVote !== 0 ? '#FFFFFF' : 'text.secondary',
                    fontWeight: comment.userVote !== 0 ? 700 : 500,
                    fontSize: '0.75rem',
                    transition: 'all 0.2s ease',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {comment.net_score}
                  </Typography>
                  {/* DOWNVOTE BUTTON */}
                  <ExpandMoreRoundedIcon
                    sx={{
                      color: comment.userVote === -1 ? '#F44336' : 'text.secondary',
                      height: 20,
                      width: 20,
                      cursor: 'pointer',
                      opacity: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: comment.userVote === -1 ? '#F44336' : '#F44336',
                        transform: 'scale(1.1)'
                      }
                    }}
                    onClick={() => handleCommentVote('downvote', comment.id)}
                  />
                </Box>
              </Box>

              {/* REPLY BUTTON */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  transition: 'background-color 0.2s ease'
                }}
                onClick={() => {
                  setReplyingTo(
                    replyingTo === comment.id ? null : comment.id
                  );
                }}
              >
                <MessageCircle
                  size={16}
                  sx={{
                    color: 'text.secondary',
                    transition: 'color 0.2s ease'
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 12,
                    color: 'text.secondary',
                    transition: 'color 0.2s ease'
                  }}
                >
                  Reply
                </Typography>
              </Box>

              {/* MORE OPTIONS BUTTON */}
              <IconButton
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </Box>

            {replyingTo === comment.id && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  name={`reply-${comment.id}`}  // Add name attribute
                  value={replyTexts[comment.id] || ''}
                  onChange={(e) => {
                    setReplyTexts(prev => ({
                      ...prev,
                      [comment.id]: e.target.value
                    }));
                  }}
                  placeholder="Write a reply..."
                  multiline
                  maxRows={4}
                  variant="standard"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReplySubmit(comment.id);
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
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={!replyTexts[comment.id]?.trim()}
                  >
                    Reply
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyTexts(prev => ({ ...prev, [comment.id]: '' }));
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* RECURSIVE REPLIES RENDERING */}
      {comment.replies && comment.replies.length > 0 && (
        <Accordion sx={{ mt: 1, boxShadow: 'none', '&:before': { display: 'none' }, bgcolor: 'background.default' }}>
          <AccordionSummary
            sx={{
              minHeight: 'auto',
              py: 0.5,
              '& .MuiAccordionSummary-content': { margin: '5px 0' }
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            {comment.replies.map((reply, index) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                isLastChild={index === comment.replies.length - 1}
                expandedReplies={expandedReplies}
                newCommentId={newCommentId}
                replyTexts={replyTexts}
                replyingTo={replyingTo}
                comments={comments}
                setComments={setComments}
                onReplyingTo={setReplyingTo}
                onReplyTextsChange={setReplyTexts}
              />
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  )
}

export default CommentItem