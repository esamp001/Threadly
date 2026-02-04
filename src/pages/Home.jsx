import { Grid } from '@mui/material'

// Importing
import BottomNav from '../components/BottomNav'
import Header from '../components/Header'

const Home = () => {
  return (
    // Main container
    <Grid container sx={{ border: '1px solid black' }}>
      <Grid sx={{ width: '100%' }} item xs={12}>
        <Header />
      </Grid>

      <Grid item xs={12} sx={{ mx: "auto" }}>
        BODY CONTENT
      </Grid>

      <Grid item xs={12}>
        <BottomNav />
      </Grid>
    </Grid>
  )
}

export default Home