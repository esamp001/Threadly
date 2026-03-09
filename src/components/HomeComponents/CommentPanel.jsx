import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { MessageSquare } from 'lucide-react';

import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Slide,
  TextField,
  Typography
} from '@mui/material';



import { useState } from 'react';

const CommentPanel = ({ threadId }) => {
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [newCommentId, setNewCommentId] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Sarah Johnson',
      avatar: 'S',
      content: 'This is such a great discussion! I really appreciate the thoughtful perspectives being shared here.',
      timestamp: '2h ago',
      net_score: 12,
      userVote: 0,
      replies: [
        {
          id: 11,
          author: 'Mike Chen',
          avatar: 'M',
          content: 'I completely agree! The quality of conversation here is really refreshing.',
          timestamp: '1h ago',
          net_score: 5,
          userVote: 0,
          replies: []
        },
        {
          id: 12,
          author: 'Emily Davis',
          avatar: 'E',
          content: 'Same here. It\'s nice to see such civil discourse for a change.',
          timestamp: '45m ago',
          net_score: 3,
          userVote: 0,
          replies: []
        }
      ]
    },
    {
      id: 2,
      author: 'David Wilson',
      avatar: 'D',
      content: 'Has anyone considered the long-term implications of this approach? I think we might be overlooking some important factors.',
      timestamp: '3h ago',
      net_score: 8,
      userVote: 0,
      replies: [
        {
          id: 21,
          author: 'Lisa Anderson',
          avatar: 'L',
          content: 'That\'s a really good point. What specific factors are you thinking about?',
          timestamp: '2h ago',
          net_score: 4,
          userVote: 0,
          replies: []
        }
      ]
    },
    {
      id: 3,
      author: 'Alex Thompson',
      avatar: 'A',
      content: 'Great thread! This exactly matches what I\'ve been thinking about lately.',
      timestamp: '4h ago',
      net_score: 15,
      userVote: 1,
      replies: []
    }
  ]);

  const toggleReplies = (id) => {
    setExpandedReplies(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleVote = (voteType, commentId) => {
    // Optimistic update - update UI immediately
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === commentId) {
          const vote_value = voteType === 'upvote' ? 1 : -1;
          const currentVote = comment.userVote || 0;

          // If user clicked same vote again → remove vote
          if (currentVote === vote_value) {
            return {
              ...comment,
              net_score: comment.net_score - vote_value,
              userVote: 0
            };
          }

          // If user clicked opposite vote → switch vote
          if (comment.userVote === -vote_value) {
            return {
              ...comment,
              net_score: comment.net_score + (vote_value * 2), // Remove old vote, add new vote
              userVote: vote_value
            };
          }

          // New vote
          return {
            ...comment,
            net_score: comment.net_score + vote_value,
            userVote: vote_value
          };
        }
        return comment;
      })
    );
  };

  const handlePostComment = async (threadId) => {
    if (!newCommentText.trim()) return;

    setIsPostingComment(true);

    const response = await fetch(`${API_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: newCommentText,
        thread_id: threadId,
        parent_id: null
      }),
    });

    const newComment = await response.json();

    setComments(prev => [newComment.comment, ...prev]);
    setNewCommentId(newComment.comment.id);
    setNewCommentText('');
    setIsPostingComment(false);

    // Clear the new comment ID after animation
    // setTimeout(() => setNewCommentId(null), 1000);
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const showReplies = expandedReplies[comment.id];
    const isNewComment = comment.id === newCommentId;

    return (
      <Slide
        direction="right"
        in={true}
        timeout={isNewComment ? 500 : 0}
        easing="cubic-bezier(0.4, 0, 0.2, 1)"
      >
        <Box sx={{ mb: 2 }}>
          {/* COMMENT */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: 13,
                bgcolor: 'primary.main',
                border: '2px solid',
                borderColor: 'background.paper',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {comment.avatar}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              {/* HEADER */}
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

                {comment.userVote !== 0 && (
                  <Box
                    sx={{
                      px: 1,
                      py: 0.2,
                      borderRadius: 1,
                      fontSize: 10,
                      fontWeight: 600,
                      backgroundColor: comment.userVote === 1 ? 'success.main' : 'error.main',
                      color: 'white'
                    }}
                  >
                    {comment.userVote === 1 ? '↑' : '↓'}
                  </Box>
                )}
              </Box>

              {/* CONTENT */}
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

              {/* ACTIONS */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
                {/* Voting */}
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
                      onClick={() => handleVote('upvote', comment.id)}
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
                      onClick={() => handleVote('downvote', comment.id)}
                    />
                  </Box>
                </Box>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main'
                    },
                    transition: 'color 0.2s ease'
                  }}
                  onClick={() =>
                    setReplyingTo(
                      replyingTo === comment.id ? null : comment.id
                    )
                  }
                >
                  Reply
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main'
                    },
                    transition: 'color 0.2s ease'
                  }}
                >
                  Share
                </Typography>

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

              {/* VIEW REPLIES */}
              {comment.replies?.length > 0 && !showReplies && (
                <Button
                  onClick={() => toggleReplies(comment.id)}
                  sx={{
                    textTransform: 'none',
                    fontSize: 12,
                    mt: 1.5,
                    color: 'primary.main',
                    fontWeight: 500,
                    px: 0,
                    justifyContent: 'flex-start',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'primary.dark'
                    }
                  }}
                >
                  {comment.replies.length === 1 ? 'View reply' : `View ${comment.replies.length} replies`}
                </Button>
              )}

              {/* REPLIES */}
              {showReplies && (
                <Box
                  sx={{
                    borderLeft: '2px solid',
                    borderColor: 'divider',
                    pl: 2,
                    mt: 2
                  }}
                >

                  {comment.replies.map(reply => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      depth={depth + 1}
                    />
                  ))}

                  <Button
                    onClick={() => toggleReplies(comment.id)}
                    sx={{
                      textTransform: 'none',
                      fontSize: 12,
                      mt: 1,
                      color: 'text.secondary',
                      px: 0,
                      justifyContent: 'flex-start',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: 'primary.main'
                      }
                    }}
                  >
                    Hide replies
                  </Button>

                </Box>
              )}

            </Box>
          </Box>
        </Box>
      </Slide>
    );
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        mt: 3
      }}
    >

      {/* TITLE */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 500
          }}
        >
          Discussion
        </Typography>
      </Box>
      {/* COMMENTS */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {comments.map((comment, index) => (
          <Box key={comment.id}>
            <CommentItem
              comment={comment}
              depth={0}
            />
            {index < comments.length - 1 && (
              <Divider
                sx={{
                  mt: 2,
                  mb: 1,
                  borderColor: 'divider',
                  opacity: 0.6
                }}
              />
            )}
          </Box>
        ))}
      </Box>

      <Divider sx={{ mb: 2, borderColor: 'divider' }} />

      {/* COMMENT INPUT */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          mb: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'primary.main'
          }
        }}
      >

        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          Y
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="What are your thoughts?"
            multiline
            maxRows={4}
            variant="outlined"
            size="small"
            disabled={isPostingComment}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePostComment(threadId);
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'transparent',
                border: 'none',
                '& fieldset': {
                  border: 'none'
                },
                '&:hover fieldset': {
                  border: 'none'
                },
                '&.Mui-focused fieldset': {
                  border: 'none'
                },
                '& .MuiInputBase-input': {
                  fontSize: 14,
                  lineHeight: 1.4,
                  color: 'text.primary',
                  '&::placeholder': {
                    color: 'text.secondary',
                    opacity: 0.7
                  }
                }
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Press Enter to submit, Shift+Enter for new line
            </Typography>

            <Button
              variant="contained"
              size="small"
              startIcon={<MessageSquare size={16} />}
              disabled={isPostingComment || !newCommentText.trim()}
              onClick={() => handlePostComment(threadId)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontSize: 13,
                px: 2,
                py: 0.8,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                },
                '&.Mui-disabled': {
                  backgroundColor: 'action.disabled',
                  color: 'action.disabled'
                }
              }}
            >
              {isPostingComment ? 'Discussing...' : 'Discuss'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper >
  );
};

export default CommentPanel;