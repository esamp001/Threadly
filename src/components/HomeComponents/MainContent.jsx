import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import { Avatar, Box, Button, Paper, Typography } from "@mui/material";
import SearchButton from './SearchButton';

const MainContent = () => {
  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Paper sx={{ p: 2, backgroundColor: 'paper.backgroundColor' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ height: 50, width: 50 }}>J</Avatar>
          <SearchButton />
        </Box>
      </Paper>

      {/* Thread Content */}
      <Paper sx={{ p: 2.5, backgroundColor: 'paper.backgroundColor', mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ height: 35, width: 35, mr: 1 }}>J</Avatar>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Typography sx={{ color: 'text.secondary' }}>John Doe</Typography>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>1 day ago</Typography>
          </Box>
        </Box>

        <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700, mt: 1 }}>Bakit hindi na ako mahal ng jowa ko?</Typography>

        {/* Actual Content */}
        <Box sx={{ mt: 2, border: '1px solid red', height: '100px' }}>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ExpandLessRoundedIcon sx={{ color: 'primary.main', height: 30, width: 30 }} /> {/* Upvote */}
              <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>500</Typography>
            </Box>
            <ExpandMoreRoundedIcon sx={{ color: 'error.main', height: 30, width: 30 }} />{/* Downvote */}
          </Box>
          <Box sx={{ gap: 1, display: 'flex' }}>
            <Button sx={{ borderRadius: 7, backgroundColor: 'button.backgroundColor' }} variant='contained' startIcon={<MessageRoundedIcon sx={{ color: 'text.secondary' }} />}>
              <Typography sx={{ color: 'text.secondary' }}>500</Typography>
            </Button>
            <Button sx={{ borderRadius: 7, backgroundColor: 'button.backgroundColor' }} variant='contained' startIcon={<ReplyRoundedIcon sx={{ color: 'text.secondary' }} />}>
              <Typography sx={{ color: 'text.secondary' }}>26</Typography>
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default MainContent