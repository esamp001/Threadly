// ThreadCard.jsx
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import { Avatar, Box, Button, Paper, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { useState } from 'react';
import apiRequest from '../../config/api';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import VotingComponent from './VotingComponent';

const ThreadContent = ({
  net_score,
  spaceAvatar,
  postedBy,
  timeAgo,
  title,
  content,
  comments,
  shares,
  spaceName,
  threadId,
  userVote,
  onCommentOpen,
  onVoteUpdate,
  componentRendered,
  userAvatar,
}) => {
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();

  // Local state for optimistic updates
  const [localNetScore, setLocalNetScore] = useState(net_score);
  const [localUserVote, setLocalUserVote] = useState(userVote);
  const [isVoting, setIsVoting] = useState(false);

  // Debounce refs
  let voteTimeout = null;
  let abortController = null;

  // Handle vote for thread
  const handleVote = (voteType) => {
    const oldUserVote = localUserVote || 0;
    let newUserVote;

    // Toggle logic
    if (voteType === 'upvote') {
      newUserVote = (oldUserVote === 1) ? 0 : 1;
    } else {
      newUserVote = (oldUserVote === -1) ? 0 : -1;
    }

    const scoreChange = newUserVote - oldUserVote;

    // Immediate optimistic update
    setLocalNetScore(prev => prev + scoreChange);
    setLocalUserVote(newUserVote);

    // Clear previous pending requests
    if (voteTimeout) clearTimeout(voteTimeout);
    if (abortController) abortController.abort();

    // Set loading state
    setIsVoting(true);

    // Set debounce timer
    voteTimeout = setTimeout(async () => {
      abortController = new AbortController();

      try {
        await apiRequest(`/api/maincontent/threads/vote`, {
          method: 'POST',
          signal: abortController.signal,
          body: JSON.stringify({
            threadId,
            voteType,
          }),
        });

        // Optimistic update already applied, just notify parent
        if (onVoteUpdate) {
          onVoteUpdate({
            id: threadId,
            net_score: localNetScore,
            userVote: localUserVote
          });
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request cancelled because user clicked again');
        } else {
          console.error("Actual Error:", error);
          showSnackbar('Error voting', 'error');
          // Rollback on error
          setLocalNetScore(prev => prev - scoreChange);
          setLocalUserVote(oldUserVote);
        }
      } finally {
        // Clear loading state
        setIsVoting(false);
      }
    }, 500);
  };

  return (
    <Paper sx={{ p: 2.5, backgroundColor: 'paper.backgroundColor', mt: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          sx={{ height: 40, width: 40, mr: 1 }}
          src={componentRendered?.current === 'Space' ? userAvatar : spaceAvatar}
          alt={componentRendered?.current === 'Space' ? postedBy : spaceName}
        >
          {componentRendered?.current === 'Space'
            ? (postedBy ? postedBy.charAt(0).toUpperCase() : 'U')
            : (spaceName ? spaceName.charAt(0).toUpperCase() : 'S')
          }
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
              {componentRendered?.current === 'Space' ? user?.username : spaceName}
            </Typography>

            {/* Secondary: Posted By (The Metadata) */}
            {componentRendered?.current !== 'Space' && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'flex',
                  gap: 0.5
                }}
              >
                Posted by {postedBy}
              </Typography>
            )}
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
        <Box
          sx={{
            mt: 2,
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              margin: '1rem auto',
              borderRadius: '8px'
            }
          }}
        >
          <Box dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Voting */}
          <VotingComponent
            net_score={localNetScore}
            userVote={localUserVote}
            onVote={handleVote}
            size="large"
            loading={isVoting}
          />
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