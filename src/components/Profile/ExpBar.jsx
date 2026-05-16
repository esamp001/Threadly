import { Box, LinearProgress, Typography } from '@mui/material';

/**
 * Experience points and level display component
 * This is used to show user's EXP progress and level information
 *
 * @param {number} expPoints - Current EXP points
 * @param {number} level - Current user level
 */
const ExpBar = ({ expPoints, level }) => {
  /**
   * Calculate EXP needed for next level
   * This is used to determine progress bar fill percentage
   */
  const getExpForLevel = (level) => {
    // EXP thresholds from the ranking system
    const thresholds = [
      0,    // Level 1
      50,   // Level 2
      120,  // Level 3
      220,  // Level 4
      350,  // Level 5
      500,  // Level 6
      700,  // Level 7
      950,  // Level 8
      1250, // Level 9
      1600, // Level 10
      2000, // Level 11
      2450, // Level 12
      2950, // Level 13
      3500, // Level 14
      4100, // Level 15
    ];

    return level < thresholds.length ? thresholds[level] : thresholds[thresholds.length - 1];
  };

  /**
   * Get level title based on level number
   * This is used to display the user's achievement title
   */
  const getLevelTitle = (level) => {
    const titles = [
      'Newbie',
      'Explorer',
      'Contributor',
      'Advocate',
      'Engager',
      'Collaborator',
      'Influencer',
      'Mentor',
      'Leader',
      'Pioneer',
      'Visionary',
      'Luminary',
      'Sage',
      'Master',
      'Grandmaster'
    ];

    return level <= titles.length ? titles[level - 1] : 'Legendary';
  };

  const currentLevelExp = getExpForLevel(level - 1);
  const nextLevelExp = getExpForLevel(level);
  const expInCurrentLevel = expPoints - currentLevelExp;
  const expNeededForNextLevel = nextLevelExp - currentLevelExp;
  const progress = expNeededForNextLevel > 0 
    ? (expInCurrentLevel / expNeededForNextLevel) * 100 
    : 100;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Level {level}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {getLevelTitle(level)}
        </Typography>
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'background.default',
          '& .MuiLinearProgress-bar': {
            bgcolor: 'primary.main',
            borderRadius: 4,
          },
          mb: 1
        }}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          {expPoints} EXP
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {expNeededForNextLevel - expInCurrentLevel} EXP to next level
        </Typography>
      </Box>
    </Box>
  );
};

export default ExpBar;
