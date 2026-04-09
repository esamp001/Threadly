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
import { useState } from 'react';
import apiRequest from '../../config/api';
import { useSnackbar } from '../../context/SnackbarContext';
import VotingComponent from '../Global/VotingComponent';

const CommentItem = ({
  comment,
  depth,
  expandedReplies,
  newCommentId,
  comments,
  setComments,
}) => {
  const { showSnackbar } = useSnackbar();

  // States
  const [replyTexts, setReplyTexts] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [votingCommentIds, setVotingCommentIds] = useState(new Set());

  let voteTimeout = null;
  let abortController = null;

  // Helper function - update vote recursively
  const updateVoteRecursively = (comments, commentId, actionType) => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        const oldUserVote = comment.userVote || 0; // 1, 0, or -1
        let newUserVote;

        // 1. Determine the NEW userVote state
        if (actionType === 'upvote') {
          newUserVote = (oldUserVote === 1) ? 0 : 1;
        } else {
          newUserVote = (oldUserVote === -1) ? 0 : -1;
        }

        // 2. Calculate the "Swing"
        // Example: If old was -1 and new is 1, change is 1 - (-1) = +2
        const scoreChange = newUserVote - oldUserVote;

        return {
          ...comment,
          net_score: comment.net_score + scoreChange,
          userVote: newUserVote
        };
      }

      if (comment.replies?.length > 0) {
        return {
          ...comment,
          replies: updateVoteRecursively(comment.replies, commentId, actionType)
        };
      }

      return comment;
    });
  };

  // Helper function - find comment by id
  const findCommentById = (comments, id) => {
    for (const comment of comments) {
      if (comment.id === id) return comment;
      if (comment.replies && comment.replies.length > 0) {
        const found = findCommentById(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle comment vote
  const handleCommentVote = (actionType, commentId) => {
    // 1. IMMEDIATE OPTIMISTIC UPDATE
    setComments(prev => updateVoteRecursively(prev, commentId, actionType));

    // 2. CLEAR PREVIOUS PENDING REQUESTS FOR THIS SPECIFIC COMMENT
    if (voteTimeout) clearTimeout(voteTimeout);
    // If a network request is already flying, cancel it
    if (abortController) abortController.abort();

    // 3. SET LOADING STATE
    setVotingCommentIds(prev => new Set(prev).add(commentId));

    // 4. SET A DEBOUNCE TIMER
    voteTimeout = setTimeout(async () => {
      // Create a new controller for this specific request
      abortController = new AbortController();

      try {
        await apiRequest(`/api/comments/vote`, {
          method: 'POST',
          signal: abortController.signal,
          body: JSON.stringify({
            commentId,
            voteType: actionType, // Send the action type ('upvote'/'downvote')
          }),
        });

      } catch (error) {
        if (error.name !== 'AbortError') {
          // Rollback optimistic update
          setComments(prev => updateVoteRecursively(prev, commentId, actionType));
        }
      } finally {
        // Clear loading state
        setVotingCommentIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      }
    }, 500); // Wait 500ms for the user to stop "spamming"
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

              <VotingComponent
                net_score={comment.net_score}
                userVote={comment.userVote}
                onVote={(voteType) => handleCommentVote(voteType, comment.id)}
                loading={votingCommentIds.has(comment.id)}
              />

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
      {
        comment.replies && comment.replies.length > 0 && (
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
        )
      }
    </Box >
  )
}

export default CommentItem