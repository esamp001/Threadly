import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import WatchLaterRoundedIcon from '@mui/icons-material/WatchLaterRounded';
import { Box, Paper, Typography } from "@mui/material";
import { Ellipsis } from "lucide-react";


const RightContent = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, backgroundColor: 'paper.backgroundColor' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700 }}>
            Popular Post
          </Typography>

          <Ellipsis color="gray" size={20} />
        </Box>



        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalFireDepartmentRoundedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Hot</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WatchLaterRoundedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Latest</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArrowUpwardRoundedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Top</Typography>
          </Box>
        </Box>

      </Paper>
    </Box>
  )
}

export default RightContent