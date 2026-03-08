import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ReplyIcon from '@mui/icons-material/Reply';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Avatar, Box, Button, Divider, IconButton, Paper, TextField, Typography } from '@mui/material';
import { useState } from 'react';

const CommentPanel = () => {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Sarah Johnson',
      avatar: 'S',
      content: 'This is such a great discussion! I really appreciate the thoughtful perspectives being shared here.',
      timestamp: '2h ago',
      likes: 12,
      userLiked: false,
      replies: [
        {
          id: 11,
          author: 'Mike Chen',
          avatar: 'M',
          content: 'I completely agree! The quality of conversation here is really refreshing.',
          timestamp: '1h ago',
          likes: 5,
          userLiked: false,
          replies: []
        },
        {
          id: 12,
          author: 'Emily Davis',
          avatar: 'E',
          content: 'Same here. It\'s nice to see such civil discourse for a change.',
          timestamp: '45m ago',
          likes: 3,
          userLiked: false,
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
      likes: 8,
      userLiked: false,
      replies: [
        {
          id: 21,
          author: 'Lisa Anderson',
          avatar: 'L',
          content: 'That\'s a really good point. What specific factors are you thinking about?',
          timestamp: '2h ago',
          likes: 4,
          userLiked: false,
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
      likes: 15,
      userLiked: true,
      replies: []
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleLike = (commentId, isReply = false, parentId = null) => {
    setComments(prevComments => {
      const updateComment = (comments) => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: comment.userLiked ? comment.likes - 1 : comment.likes + 1,
              userLiked: !comment.userLiked
            };
          }
          if (!isReply && comment.replies) {
            return {
              ...comment,
              replies: updateComment(comment.replies)
            };
          }
          return comment;
        });
      };

      if (isReply && parentId) {
        return prevComments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: updateComment(comment.replies)
            };
          }
          return comment;
        });
      }

      return updateComment(prevComments);
    });
  };

  const handleComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: 'You',
        avatar: 'Y',
        content: newComment,
        timestamp: 'now',
        likes: 0,
        userLiked: false,
        replies: []
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleReply = (parentId, isReply = false, commentId = null) => {
    if (replyText.trim()) {
      const reply = {
        id: Date.now(),
        author: 'You',
        avatar: 'Y',
        content: replyText,
        timestamp: 'now',
        likes: 0,
        userLiked: false,
        replies: []
      };

      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment.id === parentId) {
            if (isReply && commentId) {
              // Reply to a reply
              return {
                ...comment,
                replies: comment.replies.map(reply => {
                  if (reply.id === commentId) {
                    return {
                      ...reply,
                      replies: [...reply.replies, reply]
                    };
                  }
                  return reply;
                })
              };
            } else {
              // Reply to main comment
              return {
                ...comment,
                replies: [...comment.replies, reply]
              };
            }
          }
          return comment;
        });
      });

      setReplyText('');
      setReplyingTo(null);
    }
  };

  const CommentItem = ({ comment, isReply = false, parentId = null, depth = 0 }) => {
    const marginLeft = isReply ? `${depth * 20}px` : '0px';
    const showReplyInput = replyingTo === comment.id;

    return (
      <Box sx={{ ml: marginLeft, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            {comment.avatar}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                {comment.author}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '12px'
                }}
              >
                {comment.timestamp}
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                lineHeight: 1.4,
                mb: 1
              }}
            >
              {comment.content}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                startIcon={<ThumbUpIcon />}
                onClick={() => handleLike(comment.id, isReply, parentId)}
                sx={{
                  color: comment.userLiked ? 'primary.main' : 'text.secondary',
                  fontSize: '12px',
                  padding: '4px 8px',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                {comment.likes > 0 && comment.likes}
              </Button>

              <Button
                size="small"
                startIcon={<ReplyIcon />}
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                sx={{
                  color: 'text.secondary',
                  fontSize: '12px',
                  padding: '4px 8px',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                Reply
              </Button>

              <IconButton
                size="small"
                sx={{
                  color: 'text.secondary',
                  padding: '4px',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </Box>

            {showReplyInput && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: 'primary.main',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  Y
                </Avatar>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply(parentId || comment.id, isReply, comment.id);
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'text.primary',
                      fontSize: '14px',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'text.secondary',
                      opacity: 0.7,
                    },
                  }}
                />
                <Button
                  onClick={() => handleReply(parentId || comment.id, isReply, comment.id)}
                  disabled={!replyText.trim()}
                  sx={{
                    minWidth: 'auto',
                    padding: '6px 12px',
                    fontSize: '12px'
                  }}
                >
                  Reply
                </Button>
              </Box>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {comment.replies.map(reply => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply={true}
                    parentId={comment.id}
                    depth={depth + 1}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  // if (!isOpen) return null;

  return (
    <Paper
      sx={{
        backgroundColor: 'paper.backgroundColor',
        borderRadius: 2,
        p: 3,
        mt: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        Comments ({comments.reduce((acc, comment) => acc + 1 + comment.replies.length, 0)})
      </Typography>

      {/* New Comment Input */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start' }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          Y
        </Avatar>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
            '& .MuiInputBase-input': {
              color: 'text.primary',
              fontSize: '14px',
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'text.secondary',
              opacity: 0.7,
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleComment}
          disabled={!newComment.trim()}
          startIcon={<SendIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Post
        </Button>
      </Box>

      <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Comments List */}
      <Box>
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </Box>
    </Paper>
  );
};

export default CommentPanel;