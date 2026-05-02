/**
 * Experience (EXP) Progress Bar Component
 * This component displays user's current EXP progression to next level
 */
import {
  Box,
  LinearProgress,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import useExpStats from '../../hooks/useExpStats';

/**
 * EXP Bar component showing user progression to next level
 * This is used to display current EXP, progress bar, and level information
 * @param {Object} props - Component props
 * @param {boolean} props.compact - Whether to show compact version for mobile
 * @returns {JSX.Element} - EXP bar component
 */
const ExpBar = ({ compact = false }) => {
  const theme = useTheme();
  const { stats, loading, error } = useExpStats();

  // Show loading state
  if (loading || !stats) {
    return (
      <Box sx={{ width: '100%', mt: 0.5 }}>
        <LinearProgress
          variant="indeterminate"
          sx={{
            height: compact ? 4 : 6,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              backgroundColor: 'primary.main'
            }
          }}
        />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return null;
  }

  const { currentExp, currentLevel, progress } = stats;
  const { expProgress, expNeededForNextLevel, nextLevelExp, isMaxLevel } = progress;

  /**
   * Tooltip content showing detailed EXP information
   * This is used to provide comprehensive stats on hover
   */
  const tooltipContent = (
    <Box sx={{ p: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
        Level {currentLevel} Progress
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
        Current EXP: {currentExp.toLocaleString()}
      </Typography>
      {!isMaxLevel && (
        <>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
            Next Level: {nextLevelExp.toLocaleString()} EXP
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
            EXP Needed: {expNeededForNextLevel.toLocaleString()}
          </Typography>
        </>
      )}
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
        Daily EXP: {stats.todayExpGained}/150
      </Typography>
    </Box>
  );

  return (
    <Tooltip
      title={tooltipContent}
      arrow
      placement="top"
      sx={{
        '& .MuiTooltip-tooltip': {
          backgroundColor: 'background.paper',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: theme.shadows[2]
        },
        '& .MuiTooltip-arrow': {
          color: 'background.paper',
          '&::before': {
            border: '1px solid',
            borderColor: 'divider'
          }
        }
      }}
    >
      <Box sx={{ width: '100%', mt: 0.5 }}>
        {/* EXP Text Display */}
        {!compact && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: '10px',
                fontWeight: 500,
                color: 'text.secondary'
              }}
            >
              {currentExp.toLocaleString()} EXP
            </Typography>
            {!isMaxLevel && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '10px',
                  fontWeight: 500,
                  color: 'text.secondary'
                }}
              >
                {nextLevelExp.toLocaleString()} EXP
              </Typography>
            )}
          </Box>
        )}

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={isMaxLevel ? 100 : expProgress}
          sx={{
            height: compact ? 4 : 6,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              backgroundColor: isMaxLevel ? 'success.main' : 'primary.main',
              transition: 'background-color 0.3s ease'
            }
          }}
        />

        {/* Progress Percentage */}
        {compact && (
          <Typography
            variant="caption"
            sx={{
              fontSize: '9px',
              fontWeight: 600,
              color: 'text.secondary',
              textAlign: 'center',
              display: 'block',
              mt: 0.25
            }}
          >
            {isMaxLevel ? 'MAX' : `${Math.round(expProgress)}%`}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};

export default ExpBar;
