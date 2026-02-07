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
    <Grid container>
      <Grid sx={{ width: '100%' }} item size={{ xs: 12 }}>
        <Header />
      </Grid>

      <Grid container size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }} spacing={2}>
        <Grid item size={{ xs: 0, sm: 0, md: 0, lg: 2.9, xl: 2.9 }} sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' } }}>
          <LeftContent />
        </Grid>
        <Grid item size={{ xs: 12, sm: 12, md: 9, lg: 6, xl: 6 }}>
          <MainContent />
        </Grid>
        <Grid item size={{ xs: 0, sm: 0, md: 3, lg: 3, xl: 3 }} sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}>
          <RightContent />
        </Grid>
      </Grid>


      <Grid item>
        <BottomNav />
      </Grid>
    </Grid>
  )
}

export default Home