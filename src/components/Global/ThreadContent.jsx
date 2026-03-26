// ThreadCard.jsx
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import { Avatar, Box, Button, Paper, Typography } from '@mui/material';

const ThreadContent = ({
  net_score,
  avatar,
  postedBy,
  timeAgo,
  title,
  content,
  comments,
  shares,
  spaceName,
  handleVote,
  threadId,
  userVote,
  onCommentOpen,
}) => {

  return (
    <Paper sx={{ p: 2.5, backgroundColor: 'paper.backgroundColor', mt: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          sx={{ height: 40, width: 40, mr: 1 }}
          src={avatar}
          alt={spaceName}
        >
          {spaceName ? spaceName.charAt(0).toUpperCase() : 'S'}
        </Avatar>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {/* Primary: Space Name (The Subject) */}
            <Typography
              variant="subtitle2"
              sx={{
                color: 'primary.main',
                fontWeight: 600, // Added slight bold for emphasis
                fontSize: '0.9rem'
              }}
            >
              {spaceName}
            </Typography>

            {/* Secondary: Posted By (The Metadata) */}
            <Typography
              variant="caption" // Changed from subtitle2 to caption for a smaller, cleaner look
              sx={{
                color: 'text.secondary',
                display: 'flex',
                gap: 0.5
              }}
            >
              Posted by {postedBy}
            </Typography>
          </Box>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            {timeAgo}
          </Typography>
        </Box>
      </Box>

      {/* Title */}
      <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700, mt: 1 }}>
        {title}
      </Typography>

      {/* Content */}
      {content && (
        <Box sx={{ mt: 2 }}>
          {content}
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Voting */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            backgroundColor: userVote === 1 ? '#a2cca26e' : userVote === -1 ? '#b8626f83' : 'transparent',
            borderRadius: 3,
            p: 1,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: userVote !== 0 ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: userVote === 1 ? '#a2cca26e' : userVote === -1 ? '#b8626f83' : 'rgba(255, 255, 255, 0.05)',
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
                  color: userVote === 1 ? '#4CAF50' : 'text.primary',
                  height: 28,
                  width: 28,
                  cursor: 'pointer',
                  opacity: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: userVote === 1 ? '#4CAF50' : '#4CAF50',
                    transform: 'scale(1.1)'
                  }
                }}
                onClick={() => handleVote('upvote', threadId)}
              />
              <Typography variant='subtitle2' sx={{
                color: userVote !== 0 ? '#FFFFFF' : 'text.primary',
                fontWeight: userVote !== 0 ? 700 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.2s ease'
              }}>
                {net_score}
              </Typography>
              <ExpandMoreRoundedIcon
                sx={{
                  color: userVote === -1 ? '#F44336' : 'text.primary',
                  height: 28,
                  width: 28,
                  cursor: 'pointer',
                  opacity: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: userVote === -1 ? '#F44336' : '#F44336',
                    transform: 'scale(1.1)'
                  }
                }}
                onClick={() => handleVote('downvote', threadId)}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ gap: 1, display: 'flex' }}>
          <Button
            sx={{ borderRadius: 7, backgroundColor: 'button.backgroundColor' }}
            variant='contained'
            startIcon={<MessageRoundedIcon sx={{ color: 'text.secondary' }} />}
            onClick={() => onCommentOpen(threadId)}
          >
            <Typography sx={{ color: 'text.secondary' }}>
              {comments}
            </Typography>
          </Button>
          <Button
            sx={{ borderRadius: 7, backgroundColor: 'button.backgroundColor' }}
            variant='contained'
            startIcon={<ReplyRoundedIcon sx={{ color: 'text.secondary' }} />}
          // onClick={onShare}
          >
            <Typography sx={{ color: 'text.secondary' }}>
              {shares}
            </Typography>
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ThreadContent;