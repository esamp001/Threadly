import React from 'react'
import { Grid } from '@mui/material'

// Importing
import Header from '../components/Header'

const Home = () => {
  return (
    // Main container
    <Grid container sx={{ border: '1px solid black'}}>
        <Header />
        <Grid item xs={12} md={6}>
            BODY CONTENT
        </Grid>
    </Grid>
  )
}

export default Home