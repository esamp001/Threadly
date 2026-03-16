import { Button, Typography } from '@mui/material'

const CustomButton = ({ children, fetchOnclick, startIcon, onClick }) => (
  <Button
    onClick={onClick || fetchOnclick}
    startIcon={startIcon}
    sx={{
      borderRadius: 7,
      typography: 'button',
      fontSize: '10px',
      fontWeight: 300,
      border: '3px solid white',
      letterSpacing: '0.05rem',
      textTransform: 'none',
      // bgcolor: 'primary.light',
      boxShadow: theme => `0 4px 0 0 ${theme.palette.primary.main}`,
    }}
    variant='contained'
  >
    <Typography variant='subtitle1' sx={{ fontWeight: 300, color: 'text.primary' }}>
      {children}
    </Typography>
  </Button>
)

export default CustomButton
