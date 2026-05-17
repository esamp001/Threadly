// ThreadCard.jsx
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Button, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { useRef, useState } from 'react';
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
  // const [expanded, setExpanded] = useState(true);

  // Refs persist across renders — critical for debounce correctness
  const voteTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  // Track the latest resolved vote so the debounced API call always sends the final state
  const pendingVoteRef = useRef(null);

  // Handle vote for thread — Reddit-style: always interactive, debounced API call
  const handleVote = (voteType) => {
    // Read the current vote from the ref so rapid clicks always see the latest value
    const currentVote = pendingVoteRef.current !== null ? pendingVoteRef.current : (localUserVote || 0);
    let newUserVote;

    // Toggle logic
    if (voteType === 'upvote') {
      newUserVote = (currentVote === 1) ? 0 : 1;
    } else {
      newUserVote = (currentVote === -1) ? 0 : -1;
    }

    const scoreChange = newUserVote - currentVote;

    // Immediate optimistic update — UI is never blocked
    setLocalNetScore(prev => prev + scoreChange);
    setLocalUserVote(newUserVote);

    // Track the latest intended vote for the debounced request
    pendingVoteRef.current = newUserVote;

    // Cancel any in-flight request and pending debounce timer
    if (voteTimeoutRef.current) clearTimeout(voteTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    // Debounce: only fire API after the user stops clicking for 600ms
    voteTimeoutRef.current = setTimeout(async () => {
      const finalVote = pendingVoteRef.current;
      abortControllerRef.current = new AbortController();

      try {
        await apiRequest(`/api/maincontent/threads/vote`, {
          method: 'POST',
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            threadId,
            // Send the resolved numeric vote (-1 | 0 | 1) so the server
            // always gets the final intended state, not just an action verb
            vote: finalVote,
          }),
        });

        // Notify parent with the settled values
        if (onVoteUpdate) {
          onVoteUpdate({
            id: threadId,
            net_score: localNetScore,
            userVote: finalVote,
          });
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          // A newer click cancelled this request — ignore
        } else {
          console.error('Vote error:', error);
          showSnackbar('Error voting', 'error');
          // Rollback both optimistic state and the pending ref
          setLocalNetScore(prev => prev - scoreChange);
          setLocalUserVote(currentVote);
          pendingVoteRef.current = currentVote;
        }
      } finally {
        voteTimeoutRef.current = null;
        abortControllerRef.current = null;
      }
    }, 600);
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