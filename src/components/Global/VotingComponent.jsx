import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Box, Typography } from "@mui/material";

/**
 * Voting component for threads and comments
 * This is used to display and handle upvote/downvote interactions
 *
 * @param {number} net_score - Current net vote score
 * @param {number} userVote - Current user's vote: 1 (upvote), -1 (downvote), 0 (none)
 * @param {function} onVote - Callback to handle vote action
 * @param {string} size - Size variant: 'small' or 'large'
 */
const VotingComponent = ({ net_score, userVote, onVote, size = 'small' }) => {
  const sizeConfig = {
    small: {
      iconSize: 18,
      fontSize: '0.75rem',
      px: 0.8,
      py: 0.4,
    },
    large: {
      iconSize: 24,
      fontSize: '0.875rem',
      px: 1.2,
      py: 0.6,
    }
  };

  const config = sizeConfig[size];

  // Pedestal shadow colour based on current vote
  const pedestalColor = userVote === 1
    ? 'rgba(76, 175, 80, 0.7)'
    : userVote === -1
      ? 'rgba(244, 67, 54, 0.7)'
      : 'rgba(0, 0, 0, 0.5)';

  // Shared segment button styles
  const segmentSx = (activeColor, isActive) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: config.px,
    py: config.py,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    bgcolor: isActive ? `${activeColor}28` : 'transparent',
    '&:hover': {
      bgcolor: isActive ? `${activeColor}40` : `${activeColor}14`,
    },
  });

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '20px',
        border: '1px solid',
        borderColor: userVote === 1
          ? 'rgba(76, 175, 80, 0.4)'
          : userVote === -1
            ? 'rgba(244, 67, 54, 0.4)'
            : 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        bgcolor: 'rgba(255,255,255,0.03)',
        boxShadow: `0 4px 0 ${pedestalColor}`,
        transition: 'border-color 0.2s ease, transform 0.1s ease, box-shadow 0.1s ease',
        userSelect: 'none',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 0 ${pedestalColor}`,
        },
        '&:active': {
          transform: 'translateY(3px)',
          boxShadow: `0 1px 0 ${pedestalColor}`,
        },
      }}
    >
      {/* Upvote segment */}
      <Box
        sx={segmentSx('#4CAF50', userVote === 1)}
        onClick={() => onVote('upvote')}
      >
        <ExpandLessRoundedIcon
          sx={{
            color: userVote === 1 ? '#4CAF50' : 'text.secondary',
            fontSize: config.iconSize,
            transition: 'color 0.15s ease, transform 0.15s ease',
            transform: userVote === 1 ? 'scale(1.15)' : 'scale(1)',
          }}
        />
      </Box>

      {/* Score */}
      <Box sx={{
        px: config.px,
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Typography
          sx={{
            fontSize: config.fontSize,
            fontWeight: 700,
            color: userVote === 1 ? '#4CAF50' : userVote === -1 ? '#F44336' : 'text.secondary',
            transition: 'color 0.2s ease',
            minWidth: '16px',
            textAlign: 'center',
          }}
        >
          {net_score}
        </Typography>
      </Box>

      {/* Downvote segment */}
      <Box
        sx={segmentSx('#F44336', userVote === -1)}
        onClick={() => onVote('downvote')}
      >
        <ExpandMoreRoundedIcon
          sx={{
            color: userVote === -1 ? '#F44336' : 'text.secondary',
            fontSize: config.iconSize,
            transition: 'color 0.15s ease, transform 0.15s ease',
            transform: userVote === -1 ? 'scale(1.15)' : 'scale(1)',
          }}
        />
      </Box>
    </Box>
  );
};

export default VotingComponent;
