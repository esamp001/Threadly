import React from 'react'
import { Grid } from '@mui/material'

// Importing
import Header from '../components/Header'

const Home = () => {
  return (
    // Main container
    <Grid container sx={{ border: '1px solid black'}}>
      <Grid sx={{ border: '1px solid green', width: '100%' }} item xs={12} lg={12}>
        <Header />
      </Grid>

      <Grid item xs={12} md={8} sx={{ mx: "auto" }}>
        BODY CONTENT
      </Grid>
    </Grid>
  )
}

export default Home