import { Grid } from '@mui/material'

// Importing
import BottomNav from '../components/HomeComponents/BottomNav'
import Header from '../components/HomeComponents/Header'
import LeftContent from '../components/HomeComponents/LeftContent'
import MainContent from '../components/HomeComponents/MainContent'
import RightContent from '../components/HomeComponents/RightContent'

const Home = () => {
  return (
    // Main container
    <Grid container sx={{ border: '1px solid black' }}>
      <Grid sx={{ width: '100%' }} item size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
        <Header />
      </Grid>

      <Grid container spacing={2} size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ border: '1px solid blue' }}>
        <Grid item size={{ xs: 3 }}>
          <LeftContent />
        </Grid>
        <Grid item size={{ xs: 6 }}>
          <MainContent />
        </Grid>
        <Grid item size={{ xs: 2.8 }}>
          <RightContent />
        </Grid>
      </Grid>


      <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
        <BottomNav />
      </Grid>
    </Grid>
  )
}

export default Home