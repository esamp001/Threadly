// ThreadCard.jsx
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import { Avatar, Box, Button, Paper, Typography } from '@mui/material';

const ThreadContent = ({
  avatar,
  username,
  postedBy,
  timeAgo,
  title,
  content,
  upvotes,
  comments,
  shares,
  spaceName,
  handleVote
}) => {
  console.log(content, " content")
  return (
    <Paper sx={{ p: 2.5, backgroundColor: 'paper.backgroundColor', mt: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          sx={{ height: 35, width: 35, mr: 1 }}
          src={avatar}
          alt={spaceName}
        >
          {spaceName ? spaceName.charAt(0).toUpperCase() : 'S'}
        </Avatar>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {spaceName}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {username}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ExpandLessRoundedIcon
              sx={{ color: 'primary.main', height: 30, width: 30, cursor: 'pointer' }}
              onClick={() => handleVote('upvote')}
            />
            <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
              {upvotes}
            </Typography>
          </Box>
          <ExpandMoreRoundedIcon
            sx={{ color: 'error.main', height: 30, width: 30, cursor: 'pointer' }}
            onClick={() => handleVote('downvote')}
          />
        </Box>

        <Box sx={{ gap: 1, display: 'flex' }}>
          <Button
            sx={{ borderRadius: 7, backgroundColor: 'button.backgroundColor' }}
            variant='contained'
            startIcon={<MessageRoundedIcon sx={{ color: 'text.secondary' }} />}
          // onClick={onComment}
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