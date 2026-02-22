import { Button, Typography } from '@mui/material'

const CustomButton = ({ children }) => (
  <Button
    sx={{
      borderRadius: 7,
      typography: 'button',
      fontSize: '10px',
      fontWeight: 300,
      border: '3px solid white',
      letterSpacing: '0.05rem',
      textTransform: 'none',
      bgcolor: 'primary.light',
      boxShadow: theme => `0 4px 0 0 ${theme.palette.primary.main}`,
    }}
    variant='contained'
  >
    <Typography variant='subtitle1' sx={{ fontWeight: 300 }}>
      {children}
    </Typography>
  </Button>
)

export default CustomButton
