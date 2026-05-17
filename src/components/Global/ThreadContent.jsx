// ThreadCard.jsx
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Button, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../config/api';
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
  spaceId,
  threadId,
  userVote,
  onCommentOpen,
  onVoteUpdate,
  componentRendered,
  userAvatar,
  expanded,
  onExpandedChange
}) => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Local state for optimistic updates
  const [localNetScore, setLocalNetScore] = useState(net_score);
  const [localUserVote, setLocalUserVote] = useState(userVote);
  const [isVoting, setIsVoting] = useState(false);
  // const [expanded, setExpanded] = useState(true);

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

  const isSpaceComponent = typeof componentRendered === 'string'
    ? componentRendered === 'Space'
    : componentRendered?.current === 'Space';

  const handleProfileNavigate = (username) => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  const handleSpaceNavigate = (id) => {
    if (id) {
      navigate(`/spaces/${id}`);
    }
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={() => onExpandedChange && onExpandedChange(!expanded)}
      sx={{
        backgroundColor: 'paper.backgroundColor',
        mb: 2,
        '&:before': {
          display: 'none', // Remove default MUI divider
        },
        borderRadius: '12px !important',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        // transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        // '&:hover': {
        //   transform: 'translateY(-2px)',
        //   boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        // },
        '& .MuiAccordion-root': {
          borderRadius: '12px !important',
        },
        '& .MuiPaper-root': {
          borderRadius: '12px !important',
        },
        '& .MuiPaper-elevation1': {
          borderRadius: '12px !important',
        }
      }}
    >
      <AccordionSummary
        sx={{
          backgroundColor: 'paper.accordionHeader',
          display: 'flex',
          alignItems: 'center',
          '&:hover': {
            backgroundColor: 'action.hover',
          }
        }}
      >
        {/* Header and Title - Clickable Area */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
              sx={{
                height: 40,
                width: 40,
                mr: 1,
                flexShrink: 0,
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 }
              }}
              src={isSpaceComponent ? userAvatar : spaceAvatar}
              alt={isSpaceComponent ? postedBy : spaceName}
              onClick={(e) => {
                e.stopPropagation();
                if (isSpaceComponent) {
                  handleProfileNavigate(postedBy);
                } else {
                  handleSpaceNavigate(spaceId);
                }
              }}
            >
              {isSpaceComponent
                ? (postedBy ? postedBy.charAt(0).toUpperCase() : 'U')
                : (spaceName ? spaceName.charAt(0).toUpperCase() : 'S')
              }
            </Avatar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* Primary: Space Name or Poster Name */}
                {isSpaceComponent ? (
                  <Typography
                    variant="subtitle2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProfileNavigate(postedBy);
                    }}
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {postedBy}
                  </Typography>
                ) : (
                  <Typography
                    variant="subtitle2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpaceNavigate(spaceId);
                    }}
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      display: 'inline',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {spaceName}
                  </Typography>
                )}

                {/* Secondary: Posted By */}
                {!isSpaceComponent && (
                  <Typography
                    variant="caption"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProfileNavigate(postedBy);
                    }}
                    sx={{
                      color: 'text.secondary',
                      display: 'flex',
                      gap: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    Posted by {postedBy}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', flexShrink: 0, whiteSpace: 'nowrap', ml: 'auto' }}>
              {timeAgo}
            </Typography>
          </Box>

        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0, backgroundColor: 'paper.backgroundColor', borderRadius: 0 }}>
        <Box sx={{ p: 2.5, pt: 2 }}>
          {/* Title */}
          <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700, overflow: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
            {title}
          </Typography>
          {/* Content */}
          {content && (
            <Box
              sx={{
                mt: 1,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'hidden',
                maxWidth: '100%',
                lineHeight: 1.4,
                '& p': {
                  margin: '0.5rem 0',
                },
                '& br': {
                  marginBottom: '0.25rem',
                },
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
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default ThreadContent;