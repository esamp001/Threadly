import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Menu,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { MessageCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  currentUserId,
}) => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // States
  const [replyTexts, setReplyTexts] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Refs for debounce — one timeout + abort controller per comment id
  const voteTimeoutsRef = useRef({});
  const abortControllersRef = useRef({});
  // Track the latest resolved vote per comment so the debounced request always sends the final state
  const pendingVoteRefs = useRef({});

  // Helper function - update vote recursively using resolved numeric vote
  const updateVoteRecursively = (comments, commentId, newUserVote) => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        const oldUserVote = comment.userVote || 0;
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
          replies: updateVoteRecursively(comment.replies, commentId, newUserVote)
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

  // Handle comment vote — Reddit-style: always interactive, debounced API call
  const handleCommentVote = (actionType, commentId) => {
    // Resolve current vote from ref (latest) or the comments state
    const currentVote = pendingVoteRefs.current[commentId] !== undefined
      ? pendingVoteRefs.current[commentId]
      : (() => {
          const found = findCommentById(comments, commentId);
          return found ? (found.userVote || 0) : 0;
        })();

    // Compute new resolved vote
    let newUserVote;
    if (actionType === 'upvote') {
      newUserVote = currentVote === 1 ? 0 : 1;
    } else {
      newUserVote = currentVote === -1 ? 0 : -1;
    }

    // Immediate optimistic update — UI is never blocked
    setComments(prev => updateVoteRecursively(prev, commentId, newUserVote));

    // Track the latest intended vote for this comment
    pendingVoteRefs.current[commentId] = newUserVote;

    // Cancel any in-flight request and pending timer for this comment
    if (voteTimeoutsRef.current[commentId]) clearTimeout(voteTimeoutsRef.current[commentId]);
    if (abortControllersRef.current[commentId]) abortControllersRef.current[commentId].abort();

    // Debounce: only fire API after user stops clicking for 600ms
    voteTimeoutsRef.current[commentId] = setTimeout(async () => {
      const finalVote = pendingVoteRefs.current[commentId];
      abortControllersRef.current[commentId] = new AbortController();

      try {
        await apiRequest(`/api/comments/vote`, {
          method: 'POST',
          signal: abortControllersRef.current[commentId].signal,
          body: JSON.stringify({
            commentId,
            // Send the resolved numeric vote so the server always gets the final state
            vote: finalVote,
          }),
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Rollback: restore to what was before this whole interaction
          setComments(prev => updateVoteRecursively(prev, commentId, currentVote));
          pendingVoteRefs.current[commentId] = currentVote;
          showSnackbar('Error voting', 'error');
        }
      } finally {
        delete voteTimeoutsRef.current[commentId];
        delete abortControllersRef.current[commentId];
      }
    }, 600);
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

  /**
   * Helper function to check if comment can be edited
   * Only author can edit within 5 minutes of creation
   * @param {string} createdAt - The comment creation timestamp
   * @param {number} createdById - The comment author ID
   * @param {number} currentUserId - The current user ID
   * @returns {boolean} - True if comment can be edited
   */
  const canEditComment = (createdAt, createdById, currentUserId) => {

    // Check if user is the author
    if (createdById !== currentUserId) {
      return false;
    }

    // If createdAt is missing or invalid, assume it's editable (for newly created comments)
    if (!createdAt) {
      return true;
    }

    // Check if comment is within 5 minutes of creation
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const commentCreatedDate = new Date(createdAt);

    // If date parsing fails, assume it's editable
    if (isNaN(commentCreatedDate.getTime())) {
      console.warn('Invalid comment created_at:', createdAt);
      return true;
    }

    const result = commentCreatedDate > fiveMinutesAgo;
    return result;
  };

  /**
   * Navigate to user profile page
   * This is used to navigate to a user's profile when clicking on their name or avatar
   * @param {string} username - The username of the user to navigate to
   */
  const handleProfileNavigate = (username) => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  // Handle comment edit
  const handleEditSubmit = async () => {
    if (!editText.trim()) return;

    try {
      const response = await apiRequest(`/api/comments/${editingComment}`, {
        method: 'PUT',
        body: JSON.stringify({ content: editText.trim() })
      });

      const data = await response.json();

      if (data.success) {
        // Update comment in state
        const updateCommentRecursively = (comments, commentId, newContent) => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, content: newContent };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentRecursively(comment.replies, commentId, newContent)
              };
            }
            return comment;
          });
        };

        setComments(prev => updateCommentRecursively(prev, editingComment, data.comment.content));
        setEditingComment(null);
        setEditText('');
        showSnackbar('Comment updated successfully', 'success');
      } else {
        showSnackbar(data.error_message || 'Failed to update comment', 'error');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      showSnackbar('Error editing comment', 'error');
    }
  };

  // Handle comment delete
  const handleDeleteComment = async (commentId) => {
    try {
      const response = await apiRequest(`/api/comments/${commentId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        // Update comment in state to show as deleted
        const updateCommentRecursively = (comments, commentId) => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, is_active: false, content: 'This comment is deleted by user' };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentRecursively(comment.replies, commentId)
              };
            }
            return comment;
          });
        };

        setComments(prev => updateCommentRecursively(prev, commentId));
        showSnackbar('Comment deleted', 'success');
      } else {
        showSnackbar(data.error_message || 'Failed to delete comment', 'error');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      showSnackbar('Error deleting comment', 'error');
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
          onClick={() => handleProfileNavigate(comment.author)}
          sx={{
            width: 32,
            height: 32,
            fontSize: 13,
            bgcolor: 'primary.main',
            border: '2px solid',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {comment.author?.[0]?.toUpperCase() || 'A'}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography
              fontWeight={600}
              fontSize={14}
              onClick={() => handleProfileNavigate(comment.author)}
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
          {editingComment === comment.id ? (
            <TextField
              fullWidth
              multiline
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEditSubmit();
                }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: 14,
                },
                '& .MuiInput-underline:before': {
                  borderBottomColor: 'divider',
                },
              }}
              autoFocus
            />
          ) : (
            <Typography
              fontSize={14}
              sx={{
                lineHeight: 1.6,
                color: comment.is_active === false ? 'text.disabled' : 'text.primary',
                wordBreak: 'break-word',
                fontStyle: comment.is_active === false ? 'italic' : 'normal'
              }}
            >
              {comment.content}
            </Typography>
          )}

          {/* COMMENT ITEM ACTIONS */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5 }}>
            {/* COMMENT ITEM VOTING */}
            <Box sx={{ display: 'flex' }}>

              <VotingComponent
                net_score={comment.net_score}
                userVote={comment.userVote}
                onVote={(voteType) => handleCommentVote(voteType, comment.id)}
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
              {comment.is_active !== false && (
                <>
                  <IconButton
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'action.hover'
                      }
                    }}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                  >
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                  >
                    {canEditComment(comment.created_at, comment.created_by, currentUserId) && (
                      <MenuItem
                        onClick={() => {
                          setAnchorEl(null);
                          setEditingComment(comment.id);
                          setEditText(comment.content);
                        }}
                      >
                        Edit
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null);
                        handleDeleteComment(comment.id);
                      }}
                    >
                      Delete
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>

            {editingComment === comment.id && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleEditSubmit}
                  disabled={!editText.trim()}
                >
                  Save
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setEditingComment(null);
                    setEditText('');
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
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
                  currentUserId={currentUserId}
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