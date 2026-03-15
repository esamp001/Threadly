import { Box, Grid } from '@mui/material'
import { useState } from 'react'

// Importing
import BottomNav from '../components/HomeComponents/BottomNav'
import Header from '../components/HomeComponents/Header'
import LeftContent from '../components/HomeComponents/LeftContent'
import MainContent from '../components/HomeComponents/MainContent'
import RightContent from '../components/HomeComponents/RightContent'


const Home = () => {
  const [openDrawer, setOpenDrawer] = useState(false)
  const [spaces, setSpaces] = useState([]) // Move spaces state here

  const addNewSpace = (newSpace) => {
    setSpaces(prev => [newSpace, ...prev]) // Add new space to the beginning
  }

  return (
    <>
      <Box sx={{ pb: { xs: '70px', sm: 0 } }}>
        <Grid container>
          <Grid sx={{ width: '100%' }} item size={{ xs: 12 }}>
            <Header
              openDrawer={openDrawer}
              setOpenDrawer={setOpenDrawer}
              onSpaceCreated={addNewSpace}
            />
          </Grid>

          <Grid container size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }} spacing={2}>
            <Grid item size={{ xs: 0, sm: 0, md: 0, lg: 2.9, xl: 2.9 }} sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' } }}>
              <LeftContent />
            </Grid>
            <Grid item size={{ xs: 12, sm: 12, md: 9, lg: 6, xl: 6 }}>
              <MainContent spaces={spaces} setSpaces={setSpaces} />
            </Grid>
            <Grid item size={{ xs: 0, sm: 0, md: 3, lg: 3, xl: 3 }} sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}>
              <RightContent />
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <BottomNav
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
      />
    </>
  )
}

export default Home