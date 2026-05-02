import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import WatchLaterRoundedIcon from '@mui/icons-material/WatchLaterRounded';
import { Box, Paper, Typography } from "@mui/material";
import { useCallback } from "react";

const RightContent = ({ filter = 'latest', onFilterChange }) => {

  /**
   * Changes the thread filter
   * This is used to filter threads by hot, latest, or top
   * @param {string} newFilter - The filter value to apply ('hot', 'latest', 'top')
   */
  const handleFilterChange = useCallback((newFilter) => {
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  }, [onFilterChange]);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, backgroundColor: 'paper.backgroundColor' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700 }}>
            Popular Post
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
          <Box
            onClick={() => handleFilterChange('hot')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
              bgcolor: filter === 'hot' ? 'action.selected' : 'transparent'
            }}
          >
            <LocalFireDepartmentRoundedIcon sx={{ color: filter === 'hot' ? 'primary.main' : 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: filter === 'hot' ? 'primary.main' : 'text.primary' }}>Hot</Typography>
          </Box>
          <Box
            onClick={() => handleFilterChange('latest')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
              bgcolor: filter === 'latest' ? 'action.selected' : 'transparent'
            }}
          >
            <WatchLaterRoundedIcon sx={{ color: filter === 'latest' ? 'primary.main' : 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: filter === 'latest' ? 'primary.main' : 'text.primary' }}>Latest</Typography>
          </Box>
          <Box
            onClick={() => handleFilterChange('top')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
              bgcolor: filter === 'top' ? 'action.selected' : 'transparent'
            }}
          >
            <ArrowUpwardRoundedIcon sx={{ color: filter === 'top' ? 'primary.main' : 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: filter === 'top' ? 'primary.main' : 'text.primary' }}>Top</Typography>
          </Box>
        </Box>

      </Paper>
    </Box>
  )
}

export default RightContent