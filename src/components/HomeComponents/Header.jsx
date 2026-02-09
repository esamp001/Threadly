import { Avatar, Box, InputAdornment, TextField, Typography, Grid } from '@mui/material';
import { Home, LayoutTemplate, Search as SearchIcon, TrendingUp, Users } from 'lucide-react';
import ThreadlyLogo from '../../assets/Threadly.png';

const Header = () => {

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      px: 7
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center'}}>
        <img src={ThreadlyLogo} alt="Threadly Logo" style={{ width: 90, height: 90, padding: 0 }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.1rem',
            display: { xs: 'none', sm: 'none', md: 'block' }
          }}
        >
          Threadly
        </Typography>
      </Box>

      <Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex' }, gap: 10, ml: 8, alignItems: 'center', }}>
        <Home size={25} />
        <TrendingUp size={25} />
        <LayoutTemplate size={25} />
        <Users size={25} />
      </Box>

      {/* Search Bar */}
      <Grid container>
        <Grid sx={{ width: { xs: 600, sm: 800, md: 1000, lg: 500, xl: 1050} }}>
          <TextField
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: 21,
                '& fieldset': {
                  borderWidth: '2px',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                }
              }
            }}
            size='small'
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 1, width: 150, justifyContent: 'flex-end', ml: 5 }}>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Avatar sx={{ width: 50, height: 50, }}>J</Avatar>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              bgcolor: 'success.main',
              color: '#fff',
              px: 0.8,
              py: 0.2,
              fontSize: 10,
              borderRadius: '999px',
              fontWeight: 700
            }}
          >
            Lv 12
          </Box>
        </Box>

        <Box sx={{
          alignItems: 'center',
          flexDirection: 'column',
          gap: 1,
          width: 150,
          display: { xs: 'none', sm: 'none', md: 'none', lg: 'flex' }
        }}>
          <Typography sx={{ fontWeight: 700 }}>John Doe</Typography>
          <Typography
            sx={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              color: 'success.light',
              bgcolor: 'rgba(76, 175, 80, 0.12)',
              px: 1,
              py: 0.2,
              borderRadius: '6px',
              letterSpacing: 0.3,
            }}
          >
            Head Hunter
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Header