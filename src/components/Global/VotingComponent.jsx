import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Box, Typography } from "@mui/material";

const VotingComponent = ({ net_score, userVote, onVote, size = 'small', loading = false }) => {
  const sizeConfig = {
    small: {
      iconSize: 20,
      fontSize: '0.75rem',
      padding: 0.5,
      minWidth: '20px'
    },
    large: {
      iconSize: 28,
      fontSize: '0.875rem',
      padding: 1,
      minWidth: '20px'
    }
  };

  const config = sizeConfig[size];

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      backgroundColor: userVote === 1 ? '#a2cca26e' : userVote === -1 ? '#b8626f83' : 'transparent',
      borderRadius: 3,
      p: config.padding,
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
        {/* UPVOTE BUTTON */}
        <ExpandLessRoundedIcon
          sx={{
            color: userVote === 1 ? '#4CAF50' : size === 'large' ? 'text.primary' : 'text.secondary',
            height: config.iconSize,
            width: config.iconSize,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.5 : 1,
            transition: 'all 0.2s ease',
            animation: loading ? 'pulse 1.5s ease-in-out infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.5, transform: 'scale(0.95)' },
              '50%': { opacity: 0.8, transform: 'scale(1.05)' }
            },
            '&:hover': loading ? {} : {
              color: userVote === 1 ? '#4CAF50' : '#4CAF50',
              transform: 'scale(1.1)'
            }
          }}
          onClick={() => !loading && onVote('upvote')}
        />
        <Typography variant='subtitle2' sx={{
          color: userVote !== 0 ? '#FFFFFF' : size === 'large' ? 'text.primary' : 'text.secondary',
          fontWeight: userVote !== 0 ? 700 : 500,
          fontSize: config.fontSize,
          transition: 'all 0.2s ease',
          minWidth: config.minWidth,
          textAlign: 'center',
          animation: loading ? 'pulse 1.5s ease-in-out infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.6, transform: 'scale(0.98)' },
            '50%': { opacity: 1, transform: 'scale(1.02)' }
          }
        }}>
          {net_score}
        </Typography>
        {/* DOWNVOTE BUTTON */}
        <ExpandMoreRoundedIcon
          sx={{
            color: userVote === -1 ? '#F44336' : size === 'large' ? 'text.primary' : 'text.secondary',
            height: config.iconSize,
            width: config.iconSize,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.5 : 1,
            transition: 'all 0.2s ease',
            animation: loading ? 'pulse 1.5s ease-in-out infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.5, transform: 'scale(0.95)' },
              '50%': { opacity: 0.8, transform: 'scale(1.05)' }
            },
            '&:hover': loading ? {} : {
              color: userVote === -1 ? '#F44336' : '#F44336',
              transform: 'scale(1.1)'
            }
          }}
          onClick={() => !loading && onVote('downvote')}
        />
      </Box>
    </Box>
  );
};

export default VotingComponent;
