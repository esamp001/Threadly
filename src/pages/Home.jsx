import { Box, Grid } from '@mui/material'

// Importing
import BottomNav from '../components/BottomNav'
import Header from '../components/Header'
import LeftContent from '../components/LeftContent'
import MainContent from '../components/MainContent'
import RightContent from '../components/RightContent'

const Home = () => {
  return (
    // Main container
    <Grid container sx={{ border: '1px solid black' }}>
      <Grid sx={{ width: '100%' }} item xs={12}>
        <Header />
      </Grid>

      <Grid item xs={12} sx={{ mx: "auto" }}>
        <Box>
          <MainContent />
          <RightContent />
          <LeftContent />
        </Box>
      </Grid>

      <Grid item xs={12}>
        <BottomNav />
      </Grid>
    </Grid>
  )
}

export default Home