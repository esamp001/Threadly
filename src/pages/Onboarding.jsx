import { Grid } from '@mui/material'
import CardOnboarding from '../components/OnboardingComponents/CardOnboarding'

const Onboarding = () => {
  return (
    <Grid sx={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }} container>
      <Grid item size={{ xs: 12, sm: 8, md: 6 }}>
        <CardOnboarding />
      </Grid>
    </Grid>
  )
}

export default Onboarding